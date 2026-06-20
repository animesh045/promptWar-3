import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateCoachChatResponse } from "@/lib/mockAi";
import { sanitizeString } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history, profile } = body;

    // Input Validation
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
    }

    const safeProfile = {
      name: sanitizeString(profile?.name || "Eco Commuter"),
      transportation: sanitizeString(profile?.transportation || "petrol_car"),
      commuteMiles: Number(profile?.commuteMiles) || 0,
      foodHabit: sanitizeString(profile?.foodHabit || "vegetarian"),
      shoppingHabits: sanitizeString(profile?.shoppingHabits || "moderate"),
      flightFrequency: sanitizeString(profile?.flightFrequency || "occasional"),
      energyBill: Number(profile?.energyBill) || 0,
      energySource: sanitizeString(profile?.energySource || "coal_grid"),
      score: Number(profile?.score) || 62,
      breakdown: {
        transportation: Number(profile?.breakdown?.transportation) || 40,
        food: Number(profile?.breakdown?.food) || 28,
        shopping: Number(profile?.breakdown?.shopping) || 18,
        energy: Number(profile?.breakdown?.energy) || 12,
      },
      householdSize: Number(profile?.householdSize) || 4,
      missionsCompleted: Array.isArray(profile?.missionsCompleted) 
        ? profile.missionsCompleted.map(sanitizeString) 
        : [],
      streakDays: Number(profile?.streakDays) || 0,
      mapsApiKey: profile?.mapsApiKey ? sanitizeString(profile.mapsApiKey) : undefined
    };

    const safeHistory = Array.isArray(history)
      ? history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          content: sanitizeString(h.content || ""),
        }))
      : [];

    const apiKey = process.env.GEMINI_API_KEY || (request.headers.get("x-gemini-key") || "");

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Build system instruction context for Gemini instructing structured output
        const systemPrompt = `You are the CarbonOS AI Climate Coach.
Your tone is intelligent, encouraging, gamified, and highly personalized (inspired by Apple Health + Duolingo + Notion).
The user's name is ${safeProfile.name}.
Their Carbon DNA Profile is:
- Transportation: ${safeProfile.breakdown.transportation}% (Habit: ${safeProfile.transportation}, Daily Commute: ${safeProfile.commuteMiles} km, Flights: ${safeProfile.flightFrequency})
- Food choices: ${safeProfile.breakdown.food}% (Habit: ${safeProfile.foodHabit})
- Shopping Habits: ${safeProfile.breakdown.shopping}% (Habit: ${safeProfile.shoppingHabits})
- Household Energy: ${safeProfile.breakdown.energy}% (Monthly Bill: $${safeProfile.energyBill}, Energy Source: ${safeProfile.energySource})
Current Overall Sustainability Score: ${safeProfile.score}/100.

RULES:
1. Do not give generic advice (like "turn off lights").
2. Focus on high-impact areas first (e.g., if Transportation is high, suggest public transport, carpools, flight offsets. If Food is high, suggest reducing beef/delivery).
3. Always suggest concrete alternative actions.
4. Keep the text answer relatively concise and easy to read using markdown and bold text. Do not output HTML tags, stick to clean markdown.
5. You must respond with a JSON object containing two fields:
   - "text": your main conversational coaching text in markdown format.
   - "recommendedActions": an array containing 1 or 2 recommended actions in this exact schema:
     [
       {
         "id": "gemini-rec-[unique_id]",
         "title": "Short title",
         "category": "Food" | "Transportation" | "Shopping" | "Energy",
         "description": "Details about action",
         "carbonSaved": 120, // estimated kg CO2 saved per year (number)
         "moneySaved": 80, // estimated dollars saved per year (number)
         "effort": "Low" | "Medium" | "High",
         "confidence": 95, // confidence score 0-100 (number)
         "actionLabel": "Button CTA label"
       }
     ]
`;

        let mappedHistory = safeHistory.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        }));

        // Slice to the last 6 messages
        mappedHistory = mappedHistory.slice(-6);

        // Gemini requires the first message in the chat history to be from the 'user'
        while (mappedHistory.length > 0 && mappedHistory[0].role !== "user") {
          mappedHistory.shift();
        }

        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          systemInstruction: systemPrompt 
        });

        const chatSession = model.startChat({
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
            responseMimeType: "application/json",
          },
          history: mappedHistory,
        });

        const result = await chatSession.sendMessage(sanitizeString(message));
        const rawText = result.response.text();

        let cleanedText = "";
        let recommendedActions: any[] | undefined = undefined;

        try {
          const parsed = JSON.parse(rawText.trim());
          cleanedText = sanitizeString(parsed.text || "");
          
          if (Array.isArray(parsed.recommendedActions)) {
            recommendedActions = parsed.recommendedActions.map((rec: any, idx: number) => ({
              id: sanitizeString(rec.id || `gemini-rec-${idx}`),
              title: sanitizeString(rec.title || "Climate Action"),
              category: ["Food", "Transportation", "Shopping", "Energy"].includes(rec.category) 
                ? rec.category 
                : "Transportation",
              description: sanitizeString(rec.description || ""),
              carbonSaved: Number(rec.carbonSaved) || 100,
              moneySaved: Number(rec.moneySaved) || 50,
              effort: ["Low", "Medium", "High"].includes(rec.effort) ? rec.effort : "Medium",
              confidence: Math.min(100, Math.max(0, Number(rec.confidence) || 90)),
              actionLabel: sanitizeString(rec.actionLabel || "Add to Missions")
            }));
          }
        } catch (e) {
          console.error("Failed to parse Gemini structured response:", e, rawText);
          cleanedText = sanitizeString(rawText);
        }

        // If extraction failed, construct a fallback action from the text
        if (!recommendedActions) {
          recommendedActions = [
            {
              id: "gemini-fallback-rec",
              title: "Adopt Custom Recommendation",
              category: safeProfile.breakdown.transportation > 40 ? "Transportation" : "Food",
              description: "Put this Climate Coach suggestion into action for your weekly streak.",
              carbonSaved: 150,
              moneySaved: 50,
              effort: "Medium",
              confidence: 90,
              actionLabel: "Add to Missions"
            }
          ];
        }

        return NextResponse.json({
          text: cleanedText,
          recommendedActions
        });

      } catch (geminiError) {
        console.error("Gemini API call failed, falling back to mock:", geminiError);
      }
    }

    // Default to mock response if no API key or call failed
    const mockResponse = generateCoachChatResponse(sanitizeString(message), safeHistory, safeProfile);
    return NextResponse.json(mockResponse);

  } catch (error: any) {
    return NextResponse.json({ error: sanitizeString(error.message) }, { status: 500 });
  }
}
