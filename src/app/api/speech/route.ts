import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleAuth";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ success: false, error: "Text parameter is required." }, { status: 400 });
    }

    const auth = getGoogleAuth(["https://www.googleapis.com/auth/cloud-platform"]);

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
