import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ success: false, error: "Text parameter is required." }, { status: 400 });
    }

    // Load credentials
    const keysPath = path.join(process.cwd(), "keys.json");
    if (!fs.existsSync(keysPath)) {
      throw new Error("keys.json service account configuration not found in root.");
    }
    const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));

    // Authenticate
    const auth = new google.auth.JWT({
      email: keys.client_email,
      key: keys.private_key,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });

    const tts = google.texttospeech({ version: "v1", auth });

    // Call Text-to-Speech API
    const response = await tts.text.synthesize({
      requestBody: {
        input: { text },
        voice: {
          languageCode: "en-IN",
          name: "en-IN-Wavenet-B",
          ssmlGender: "MALE"
        },
        audioConfig: {
          audioEncoding: "MP3"
        }
      }
    });

    const audioContent = response.data.audioContent;
    if (!audioContent) {
      throw new Error("Failed to retrieve synthesized audio content.");
    }

    return NextResponse.json({
      success: true,
      audioContent
    });
  } catch (error: any) {
    console.error("Text-to-Speech API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
