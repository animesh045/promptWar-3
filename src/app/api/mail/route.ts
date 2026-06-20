import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, transitMode, carbonSaved, moneySaved, cost, time } = body;

    const recipient = "animesh045th3@gmail.com";
    const subject = `CarbonOS Route Certificate - ${transitMode}`;

    // Create styled HTML email body
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; background-color: #0c110e; color: #e5e7eb; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2d24;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="color: #10b981; margin: 0; font-size: 24px; letter-spacing: 2px; font-weight: 800;">CARBONOS</h1>
          <span style="font-size: 10px; color: #6b7280; letter-spacing: 1px;">CLIMATE TWIN NETWORK</span>
        </div>
        
        <h2 style="color: #ffffff; text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 5px;">OPTIMIZED TRAJECTORY CERTIFICATE</h2>
        <p style="font-size: 12px; text-align: center; color: #9ca3af; margin-bottom: 25px;">This certificate confirms the evaluation of the lowest-carbon transit route calculated for your journey.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: bold;">ORIGIN:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${origin}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: bold;">DESTINATION:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${destination}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: bold;">DATE LOGGED:</td>
            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${new Date().toLocaleDateString("en-IN")}</td>
          </tr>
        </table>
        
        <hr style="border: 0; border-top: 1px solid #1f2d24; margin: 20px 0;" />
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
          <div style="background-color: #111815; padding: 15px; border-radius: 8px; border: 1px solid #1f2d24; text-align: center;">
            <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase; display: block; margin-bottom: 5px;">Active Trajectory</span>
            <strong style="font-size: 16px; color: #10b981;">${transitMode}</strong>
          </div>
          <div style="background-color: #111815; padding: 15px; border-radius: 8px; border: 1px solid #1f2d24; text-align: center;">
            <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase; display: block; margin-bottom: 5px;">Carbon Saved</span>
            <strong style="font-size: 16px; color: #34d399;">-${carbonSaved} kg CO₂</strong>
          </div>
          <div style="background-color: #111815; padding: 15px; border-radius: 8px; border: 1px solid #1f2d24; text-align: center;">
            <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase; display: block; margin-bottom: 5px;">Financial Savings</span>
            <strong style="font-size: 16px; color: #34d399;">₹${moneySaved}</strong>
          </div>
          <div style="background-color: #111815; padding: 15px; border-radius: 8px; border: 1px solid #1f2d24; text-align: center;">
            <span style="font-size: 10px; color: #9ca3af; text-transform: uppercase; display: block; margin-bottom: 5px;">Duration</span>
            <strong style="font-size: 16px; color: #ffffff;">${time} mins</strong>
          </div>
        </div>
        
        <p style="font-size: 13px; line-height: 1.6; color: #d1d5db; text-align: justify; margin-bottom: 30px;">
          By prioritizing <strong>${transitMode}</strong> over the baseline cab ride, you have prevented <strong>${carbonSaved} kg of CO₂</strong> emissions. This reduction is equivalent to powering a smartphone for <strong>${Math.round(carbonSaved * 350)} days</strong>. Thank you for your active ecological stewardship.
        </p>
        
        <div style="border-top: 1px solid #1f2d24; padding-top: 15px; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between; align-items: center;">
          <span>CarbonOS Verification Authority</span>
          <span style="font-family: monospace; font-weight: bold; color: #9ca3af;">HASH: ${Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
        </div>
      </div>
    `;

    // Attempt Gmail send
    let apiError = "";
    try {
      const keysPath = path.join(process.cwd(), "keys.json");
      if (fs.existsSync(keysPath)) {
        const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
        
        const auth = new google.auth.JWT({
          email: keys.client_email,
          key: keys.private_key,
          scopes: ["https://www.googleapis.com/auth/gmail.send"]
        });

        const gmail = google.gmail({ version: "v1", auth });

        // Encode MIME message
        const makeBody = (to: string, from: string, sub: string, message: string) => {
          const str = [
            `To: ${to}`,
            `From: ${from}`,
            `Subject: ${sub}`,
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=utf-8",
            "Content-Transfer-Encoding: 7bit",
            "",
            message,
          ].join("\n");

          return Buffer.from(str)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
        };

        const rawMessage = makeBody(recipient, keys.client_email, subject, htmlBody);
        
        await gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: rawMessage
          }
        });
        
        return NextResponse.json({
          success: true,
          simulated: false,
          recipient,
          subject
        });
      }
    } catch (err: any) {
      console.warn("Gmail API direct dispatch failed, running in simulation mode:", err.message);
      apiError = err.message;
    }

    // Return simulation success containing the full HTML
    return NextResponse.json({
      success: true,
      simulated: true,
      recipient,
      subject,
      error: apiError || "Service Account lacks Gmail mailbox profile.",
      html: htmlBody
    });
  } catch (error: any) {
    console.error("Mail route handler error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
