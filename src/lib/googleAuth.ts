import { google } from "googleapis";
import path from "path";
import fs from "fs";

export function getGoogleAuth(scopes: string[]) {
  const envEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const envKey = process.env.GOOGLE_PRIVATE_KEY;

  if (envEmail && envKey) {
    // Format private key correctly if it has escaped newlines
    const formattedKey = envKey.replace(/\\n/g, "\n");
    return new google.auth.JWT({
      email: envEmail,
      key: formattedKey,
      scopes
    });
  }

  // Fallback to local keys.json (mostly for local legacy setup)
  try {
    const keysPath = path.join(process.cwd(), "keys.json");
    if (fs.existsSync(keysPath)) {
      const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
      return new google.auth.JWT({
        email: keys.client_email,
        key: keys.private_key,
        scopes
      });
    }
  } catch (err) {
    console.error("Failed to load keys.json:", err);
  }

  throw new Error("Google Cloud service account credentials not found in env variables or keys.json");
}
