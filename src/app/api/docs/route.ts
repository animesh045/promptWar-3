import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleAuth } from "@/lib/googleAuth";
import { sanitizeString, validateAddress } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, transitMode, carbonSaved, moneySaved, cost, time, carbon } = body;

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
    const safeCarbon = Number(carbon) || 0;

    const auth = getGoogleAuth([
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file"
    ]);

    const docs = google.docs({ version: "v1", auth });
    const drive = google.drive({ version: "v3", auth });

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const docTitle = `CarbonOS Route Report - ${new Date().toLocaleDateString()}`;

    // Create a new document
    const createResponse = await docs.documents.create({
      requestBody: {
        title: docTitle
      }
    });

    const documentId = createResponse.data.documentId;
    if (!documentId) {
      throw new Error("Failed to create Google Document.");
    }

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;

    // Share document with user email
    try {
      await drive.permissions.create({
        fileId: documentId,
        requestBody: {
          role: "writer",
          type: "user",
          emailAddress: "animesh045th3@gmail.com"
          // Using write permissions so the user can edit their report
        },
        sendNotificationEmail: false
      });
    } catch (err) {
      console.error("Failed to share Google Doc with user email:", err);
    }

    // Build the report text structure
    const p1 = "CARBONOS CLIMATE TWIN NETWORK\n";
    const p2 = "Travel Trajectory Optimization Report\n";
    const p3 = `Generated on: ${timestamp}\n\n`;

    const s1 = "1. Journey Overview\n";
    const s1Content = `Origin Address: ${safeOrigin}\nDestination Address: ${safeDestination}\nBaseline Mode: Auto/Cab Ride (Baseline)\n\n`;

    const s2 = "2. Optimized Choice Details\n";
    const s2Content = `Selected Transit Option: ${safeTransitMode}\nDuration: ${safeTime} minutes\nCarbon Footprint: ${safeCarbon} kg CO2\nFare Cost: ₹${safeCost}\n\n`;

    const s3 = "3. Ecological & Financial Impact\n";
    const s3Content = `Carbon Saved vs Baseline: -${safeCarbonSaved} kg CO2\nFinancial Savings vs Baseline: +₹${safeMoneySaved}\nEquivalence: Charging a smartphone for ${Math.round(safeCarbonSaved * 350)} days\n\n`;

    const s4 = "4. Ecosystem Impact Summary & Narrative\n";
    const s4Content = `By choosing ${safeTransitMode} instead of the cab ride baseline, you reduce emissions by ${safeCarbonSaved} kg CO2 and save ₹${safeMoneySaved} on this journey. This active decision directly contributes to regional carbon neutral initiatives.\n`;

    // Construct full content string to find character ranges
    const fullText = p1 + p2 + p3 + s1 + s1Content + s2 + s2Content + s3 + s3Content + s4 + s4Content;

    // Apply inserts and formatting
    // Note: indices in Google Docs are 1-based and adjust as you write.
    // To make it easy, we insert the text first, then apply formatting.
    const requests = [
      {
        insertText: {
          location: { index: 1 },
          text: fullText
        }
      }
    ];

    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests
      }
    });

    // Let's add some bolding/headers styling
    // We compute exact indices:
    let idx = 1;
    const formatRequests: any[] = [];

    // Header 1 style (subheading)
    formatRequests.push({
      updateTextStyle: {
        range: { startIndex: idx, endIndex: idx + p1.length },
        textStyle: {
          bold: true,
          fontSize: { magnitude: 11, unit: "PT" },
          foregroundColor: { color: { rgbColor: { red: 0.06, green: 0.72, blue: 0.51 } } } // Eco Green
        },
        fields: "bold,fontSize,foregroundColor"
      }
    });
    idx += p1.length;

    // Title style
    formatRequests.push({
      updateTextStyle: {
        range: { startIndex: idx, endIndex: idx + p2.length },
        textStyle: {
          bold: true,
          fontSize: { magnitude: 20, unit: "PT" },
          foregroundColor: { color: { rgbColor: { red: 0.1, green: 0.1, blue: 0.1 } } }
        },
        fields: "bold,fontSize,foregroundColor"
      }
    });
    idx += p2.length;

    // Timestamp
    formatRequests.push({
      updateTextStyle: {
        range: { startIndex: idx, endIndex: idx + p3.length },
        textStyle: {
          italic: true,
          fontSize: { magnitude: 10, unit: "PT" },
          foregroundColor: { color: { rgbColor: { red: 0.5, green: 0.5, blue: 0.5 } } }
        },
        fields: "italic,fontSize,foregroundColor"
      }
    });
    idx += p3.length;

    // Heading 1 sections formatting
    const sections = [
      { headingLen: s1.length, contentLen: s1Content.length },
      { headingLen: s2.length, contentLen: s2Content.length },
      { headingLen: s3.length, contentLen: s3Content.length },
      { headingLen: s4.length, contentLen: s4Content.length }
    ];

    for (const sec of sections) {
      formatRequests.push({
        updateTextStyle: {
          range: { startIndex: idx, endIndex: idx + sec.headingLen },
          textStyle: {
            bold: true,
            fontSize: { magnitude: 14, unit: "PT" },
            foregroundColor: { color: { rgbColor: { red: 0.08, green: 0.47, blue: 0.34 } } }
          },
          fields: "bold,fontSize,foregroundColor"
        }
      });
      idx += sec.headingLen + sec.contentLen;
    }

    // Apply formatting
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: formatRequests
      }
    });

    return NextResponse.json({
      success: true,
      documentId,
      documentUrl,
      title: docTitle
    });
  } catch (error: any) {
    console.error("Google Docs API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
