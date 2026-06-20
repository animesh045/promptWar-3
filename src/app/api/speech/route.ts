import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleAuth";
import { sanitizeString } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ success: false, error: "Text parameter is required." }, { status: 400 });
    }

    let audioContent = "";
    let simulated = false;
    let apiError = "";

    try {
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

      audioContent = response.data.audioContent || "";
      if (!audioContent) {
        throw new Error("Failed to retrieve synthesized audio content.");
      }
    } catch (err: any) {
      console.warn("Text-to-Speech API direct connection failed, running in simulation mode:", err.message);
      apiError = err.message;
      simulated = true;
      // 1-second silent MP3 base64 payload
      audioContent = "//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQAfBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwAAAP8=";
    }

    return NextResponse.json({
      success: true,
      simulated,
      error: apiError || undefined,
      audioContent
    });
  } catch (error: any) {
    console.error("Text-to-Speech API Error:", error);
    return NextResponse.json({ success: false, error: sanitizeString(error.message) }, { status: 500 });
  }
}
