import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleAuth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    const auth = getGoogleAuth(["https://www.googleapis.com/auth/devstorage.read_write"]);

    const storage = google.storage({ version: "v1", auth });
    const bucketName = "amd-ideathon-495506-lens-vault";
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const fileType = file.type || "image/png";
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Check/create bucket
    try {
      await storage.buckets.get({ bucket: bucketName });
    } catch (err: any) {
      if (err.code === 404 || err.message?.includes("Not Found")) {
        console.log(`Bucket ${bucketName} not found, creating...`);
        await storage.buckets.insert({
          project: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || "amd-ideathon-495506",
          requestBody: {
            name: bucketName,
            location: "asia-south1" // India region
          }
        });
      } else {
        throw err;
      }
    }

    // 2. Upload file to GCS
    await storage.objects.insert({
      bucket: bucketName,
      name: fileName,
      media: {
        mimeType: fileType,
        body: fileBuffer
      },
      predefinedAcl: "publicRead"
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    return NextResponse.json({
      success: true,
      name: fileName,
      url: publicUrl,
      bucket: bucketName
    });
  } catch (error: any) {
    console.error("GCS Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
