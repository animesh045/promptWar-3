import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleAuth";
import { sanitizeFormula, validateAddress } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, transitMode, carbonSaved, moneySaved, cost, time } = body;

    if (!validateAddress(origin) || !validateAddress(destination)) {
      return NextResponse.json({ success: false, error: "Invalid origin or destination address." }, { status: 400 });
    }

    const safeOrigin = sanitizeFormula(origin);
    const safeDestination = sanitizeFormula(destination);
    const safeTransitMode = sanitizeFormula(transitMode);
    const safeCarbonSaved = Number(carbonSaved) || 0;
    const safeMoneySaved = Number(moneySaved) || 0;
    const safeCost = Number(cost) || 0;
    const safeTime = Number(time) || 0;

    const auth = getGoogleAuth([
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file"
    ]);

    const drive = google.drive({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    // Search for existing spreadsheet
    const driveSearch = await drive.files.list({
      q: "name = 'CarbonOS Travel Impact Log' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false",
      fields: "files(id, name, webViewLink)",
      spaces: "drive"
    });

    let spreadsheetId = "";
    let spreadsheetUrl = "";
    const files = driveSearch.data.files;

    if (files && files.length > 0 && files[0].id) {
      spreadsheetId = files[0].id;
      spreadsheetUrl = files[0].webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    } else {
      // Create new spreadsheet
      const newSheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: "CarbonOS Travel Impact Log"
          }
        },
        fields: "spreadsheetId,spreadsheetUrl"
      });

      spreadsheetId = newSheet.data.spreadsheetId || "";
      spreadsheetUrl = newSheet.data.spreadsheetUrl || "";

      if (!spreadsheetId) {
        throw new Error("Failed to retrieve spreadsheet ID upon creation.");
      }

      // Share spreadsheet with user email
      try {
        await drive.permissions.create({
          fileId: spreadsheetId,
          requestBody: {
            role: "writer",
            type: "user",
            emailAddress: "animesh045th3@gmail.com"
          },
          sendNotificationEmail: false
        });
      } catch (err) {
        console.error("Failed to share sheet with user email:", err);
      }

      // Write header row
      const headers = [
        ["Timestamp", "Origin", "Destination", "Transit Mode", "Carbon Saved (kg)", "Financial Savings (INR)", "Fare Cost (INR)", "Duration (mins)"]
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        requestBody: {
          values: headers
        }
      });

      // Format header row
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 8
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: {
                        red: 16 / 255,
                        green: 185 / 255,
                        blue: 129 / 255
                      },
                      textFormat: {
                        bold: true,
                        foregroundColor: {
                          red: 1,
                          green: 1,
                          blue: 1
                        }
                      },
                      horizontalAlignment: "CENTER"
                    }
                  },
                  fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
                }
              }
            ]
          }
        });
      } catch (err) {
        console.error("Failed to apply styling request to spreadsheet headers:", err);
      }
    }

    // Append current transit option data
    const timestampStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const rowData = [
      [
        timestampStr,
        safeOrigin,
        safeDestination,
        safeTransitMode,
        safeCarbonSaved,
        safeMoneySaved,
        safeCost,
        safeTime
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A2",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rowData
      }
    });

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl,
      loggedValues: rowData[0]
    });
  } catch (error: any) {
    console.error("Google Sheets Sync API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
