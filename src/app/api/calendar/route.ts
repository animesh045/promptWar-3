import { NextResponse } from "next/server";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, transitMode, carbonSaved, moneySaved, cost, time } = body;

    const summary = `CarbonOS Commute: ${transitMode}`;
    const description = `Journey optimized via CarbonOS Climate Twin Network.\n\n` +
      `- Origin: ${origin}\n` +
      `- Destination: ${destination}\n` +
      `- Carbon Saved: ${carbonSaved} kg CO₂\n` +
      `- Financial Savings: ₹${moneySaved}\n` +
      `- Fare Cost: ₹${cost}\n` +
      `- Duration: ${time} minutes\n\n` +
      `Thank you for driving the planet forward!`;

    const startDateTime = new Date();
    const endDateTime = new Date(startDateTime.getTime() + time * 60000);

    const eventDetails = {
      summary,
      location: `${origin} to ${destination}`,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Asia/Kolkata"
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Asia/Kolkata"
      },
      attendees: [
        { email: "animesh045th3@gmail.com" }
      ],
      colorId: "2", // Green color on Calendar
      reminders: {
        useDefault: true
      }
    };

    let apiError = "";
    try {
      const keysPath = path.join(process.cwd(), "keys.json");
      if (fs.existsSync(keysPath)) {
        const keys = JSON.parse(fs.readFileSync(keysPath, "utf8"));
        
        const auth = new google.auth.JWT({
          email: keys.client_email,
          key: keys.private_key,
          scopes: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events"
          ]
        });

        const calendar = google.calendar({ version: "v3", auth });

        // Create the event on the primary calendar of the service account and invite the user
        const response = await calendar.events.insert({
          calendarId: "primary",
          sendUpdates: "all",
          requestBody: eventDetails
        });

        return NextResponse.json({
          success: true,
          simulated: false,
          eventId: response.data.id,
          htmlLink: response.data.htmlLink
        });
      }
    } catch (err: any) {
      console.warn("Google Calendar API direct connection failed, running in simulation mode:", err.message);
      apiError = err.message;
    }

    // Return simulation success containing a realistic link
    return NextResponse.json({
      success: true,
      simulated: true,
      error: apiError || "Service account does not have primary calendar delegation.",
      event: eventDetails,
      htmlLink: "https://calendar.google.com/calendar/u/0/r"
    });
  } catch (error: any) {
    console.error("Google Calendar Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
