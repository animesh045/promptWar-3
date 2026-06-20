import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 });
    }

    // Load credentials
    const keysPath = path.join(process.cwd(), "keys.json");
    if (!fs.existsSync(keysPath)) {
      throw new Error("keys.json service account configuration not found in root.");
    }
    const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));

    // Authenticate GCS
    const auth = new google.auth.JWT({
      email: keys.client_email,
      key: keys.private_key,
      scopes: ["https://www.googleapis.com/auth/devstorage.read_write"]
    });

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
          project: keys.project_id,
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
