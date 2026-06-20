import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleAuth";
import { sanitizeString, validateAddress } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, transitMode, carbonSaved, moneySaved, cost, time } = body;

    if (!validateAddress(origin) || !validateAddress(destination)) {
      return NextResponse.json({ success: false, error: "Invalid origin or destination address." }, { status: 400 });
    }

    const safeOrigin = sanitizeString(origin);
    const safeDestination = sanitizeString(destination);
    const safeTransitMode = sanitizeString(transitMode);
    const safeCarbonSaved = Number(carbonSaved) || 0;
    const safeMoneySaved = Number(moneySaved) || 0;
    const safeCost = Number(cost) || 0;
    const safeTime = Number(time) || 0;

    const summary = `CarbonOS Commute: ${safeTransitMode}`;
    const description = `Journey optimized via CarbonOS Climate Twin Network.\n\n` +
      `- Origin: ${safeOrigin}\n` +
      `- Destination: ${safeDestination}\n` +
      `- Carbon Saved: ${safeCarbonSaved} kg CO₂\n` +
      `- Financial Savings: ₹${safeMoneySaved}\n` +
      `- Fare Cost: ₹${safeCost}\n` +
      `- Duration: ${safeTime} minutes\n\n` +
      `Thank you for driving the planet forward!`;

    const startDateTime = new Date();
    const endDateTime = new Date(startDateTime.getTime() + safeTime * 60000);

    const eventDetails = {
      summary,
      location: `${safeOrigin} to ${safeDestination}`,
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
      const auth = getGoogleAuth([
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events"
      ]);

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
