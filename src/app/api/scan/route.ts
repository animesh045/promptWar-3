import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { simulateCarbonLensScan } from "@/lib/mockAi";

export async function POST(request: Request) {
  let scanType = "receipt";
  let filename = "receipt.jpg";
  try {
    const body = await request.json();
    scanType = body.scanType || "receipt";
    filename = body.filename || "receipt.jpg";
    const { image } = body;

    const apiKey = process.env.GEMINI_API_KEY || (request.headers.get("x-gemini-key") || "");

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        if (image) {
          // Base64 image extraction
          const base64Data = image.split(",")[1] || image;
          const mimeType = image.split(";")[0]?.split(":")[1] || "image/jpeg";

          const systemPrompt = `You are the CarbonOS Carbon Lens Scanner, powered by Gemini Vision.
Analyze the provided document (receipt, utility bill, product packaging, or restaurant menu).
Extract carbon details and output a clean JSON response containing:
{
  "carbonScore": 0-100, // (100 is best, i.e. lowest carbon impact, 0 is worst)
  "extractedTitle": "A clean, descriptive title of what was scanned",
  "impactDrivers": ["3 major reasons for the emissions or green rating"],
  "healthierAlternatives": ["1-2 healthier lifestyle or product swaps"],
  "greenerAlternatives": ["1-2 greener swaps that cut carbon footprint directly, with estimated savings"],
  "costComparison": { "current": number, "green": number }, // estimated price in INR
  "expectedAnnualImpact": number // estimated annual kg CO2 saved by switching
}
Format your output strictly as a single JSON object. Do not include markdown wraps or backticks in the response, just return raw JSON text.`;

          const result = await model.generateContent([
            systemPrompt,
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            }
          ]);

          const text = result.response.text();
          const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);

          return NextResponse.json(parsed);
        } else {
          // Dynamic Gemini Simulation
          const systemPrompt = `You are a Carbon Footprint Simulator, simulating a scanner audit.
Generate a highly realistic and randomized carbon footprint audit JSON for a simulated scanning of a "${scanType || 'receipt'}" (Grocery Receipt, Utility Bill, Shopping Product, or Restaurant Menu).
Make the data specific and descriptive (e.g. if receipt, pick a random grocery order or Zomato delivery. If utility, a local electricity bill with kwh values. If product, a fast fashion kurta or imported snack. If menu, a restaurant menu card).
All costs must be realistic and in Indian Rupees (₹).
Output a JSON response in this exact format:
{
  "carbonScore": number, // 0-100 (100 is best/lowest carbon, 0 is worst)
  "extractedTitle": "Clean descriptive title of the simulated item",
  "impactDrivers": ["3 descriptive bullet points detailing carbon impact drivers"],
  "healthierAlternatives": ["1-2 alternative lifestyle swaps"],
  "greenerAlternatives": ["1-2 greener swaps that cut carbon footprint directly, with estimated savings"],
  "costComparison": { "current": number, "green": number }, // estimated current vs greener price in INR (₹)
  "expectedAnnualImpact": number // estimated annual kg CO2 saved by switching
}
Format your output strictly as a single JSON object. Do not include markdown wraps or backticks in the response, just return raw JSON text.`;

          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 2000
            }
          });

          const text = result.response.text();
          const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          return NextResponse.json(parsed);
        }
      } catch (geminiError) {
        console.error("Gemini API call failed, falling back to mock:", geminiError);
      }
    }

    // Default mock response based on type
    const mockData = simulateCarbonLensScan(scanType || "receipt", filename || "receipt.jpg");
    return NextResponse.json(mockData);

  } catch (error: any) {
    // Safe fallback to mock if everything fails
    try {
      const mockData = simulateCarbonLensScan(scanType || "receipt", filename || "receipt.jpg");
      return NextResponse.json(mockData);
    } catch (e) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
