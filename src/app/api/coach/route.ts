import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateCoachChatResponse } from "@/lib/mockAi";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history, profile } = body;

    const apiKey = process.env.GEMINI_API_KEY || (request.headers.get("x-gemini-key") || "");

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Build system instruction context for Gemini
        const systemPrompt = `You are the CarbonOS AI Climate Coach.
Your tone is intelligent, encouraging, gamified, and highly personalized (inspired by Apple Health + Duolingo + Notion).
The user's name is ${profile.name || "Eco Commuter"}.
Their Carbon DNA Profile is:
- Transportation: ${profile.breakdown?.transportation || 40}% (Habit: ${profile.transportation}, Daily Commute: ${profile.commuteMiles} miles, Flights: ${profile.flightFrequency})
- Food choices: ${profile.breakdown?.food || 28}% (Habit: ${profile.foodHabit})
- Shopping Habits: ${profile.breakdown?.shopping || 18}% (Habit: ${profile.shoppingHabits})
- Household Energy: ${profile.breakdown?.energy || 12}% (Monthly Bill: $${profile.energyBill}, Energy Source: ${profile.energySource})
Current Overall Sustainability Score: ${profile.score || 62}/100.

RULES:
1. Do not give generic advice (like "turn off lights").
2. Focus on high-impact areas first (e.g., if Transportation is high, suggest public transport, carpools, flight offsets. If Food is high, suggest reducing beef/delivery).
3. Always suggest concrete alternative actions.
4. Keep answers relatively concise and easy to read using markdown and bold text.
5. In addition to your text answer, you must respond with a JSON block at the end (or parseable) that specifies 1 or 2 recommended actions in this format:
RECOMMENDED_ACTIONS:[
  {
    "id": "gemini-rec-1",
    "title": "Short title",
    "category": "Food | Transportation | Shopping | Energy",
    "description": "Details about action",
    "carbonSaved": 120, // estimated kg CO2 saved per year
    "moneySaved": 80, // estimated dollars saved per year
    "effort": "Low | Medium | High",
    "confidence": 95, // confidence score 0-100
    "actionLabel": "Button CTA label"
  }
]
`;

        let mappedHistory = history.map((h: any) => ({
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
          },
          history: mappedHistory,
        });

        const result = await chatSession.sendMessage(message);
        const text = result.response.text();

        // Extract recommended actions if Gemini returned them
        let recommendedActions: any[] | undefined = undefined;
        const match = text.match(/RECOMMENDED_ACTIONS:([\s\S]*)/);
        let cleanedText = text;
        if (match) {
          try {
            recommendedActions = JSON.parse(match[1].trim());
            cleanedText = text.replace(/RECOMMENDED_ACTIONS:[\s\S]*/, "").trim();
          } catch (e) {
            // failed parsing, fallback
            console.error("Failed to parse Gemini recommendations:", e);
          }
        }

        // If extraction failed, construct a fallback action from the text
        if (!recommendedActions) {
          recommendedActions = [
            {
              id: "gemini-fallback-rec",
              title: "Adopt Custom Recommendation",
              category: profile.breakdown?.transportation > 40 ? "Transportation" : "Food",
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
    const mockResponse = generateCoachChatResponse(message, history, profile);
    return NextResponse.json(mockResponse);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
