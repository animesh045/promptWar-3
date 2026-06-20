import { vi, describe, it, expect } from "vitest";
import { POST as sheetsHandler } from "./sheets/route";
import { POST as docsHandler } from "./docs/route";
import { POST as calendarHandler } from "./calendar/route";
import { POST as mailHandler } from "./mail/route";
import { POST as speechHandler } from "./speech/route";
import { POST as uploadHandler } from "./upload/route";

// Mock the getGoogleAuth function to throw an error, forcing simulation fallback
vi.mock("@/lib/googleAuth", () => ({
  getGoogleAuth: () => {
    throw new Error("Simulated auth credentials missing error");
  }
}));

describe("API Route Simulation Fallbacks", () => {
  it("should handle Google Sheets sync simulation fallback gracefully", async () => {
    const request = new Request("http://localhost/api/sheets", {
      method: "POST",
      body: JSON.stringify({
        origin: "New Delhi, Delhi, India",
        destination: "Gurugram, Haryana, India",
        transitMode: "Metro Train",
        carbonSaved: 12.5,
        moneySaved: 45,
        cost: 60,
        time: 45
      })
    });

    const response = await sheetsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulated).toBe(true);
    expect(data.spreadsheetUrl).toBe("https://docs.google.com/spreadsheets");
    expect(data.loggedValues).toBeDefined();
    expect(data.loggedValues[1]).toBe("New Delhi, Delhi, India");
  });

  it("should handle Google Docs sync simulation fallback gracefully", async () => {
    const request = new Request("http://localhost/api/docs", {
      method: "POST",
      body: JSON.stringify({
        origin: "New Delhi, Delhi, India",
        destination: "Gurugram, Haryana, India",
        transitMode: "Metro Train",
        carbonSaved: 12.5,
        moneySaved: 45,
        cost: 60,
        time: 45,
        carbon: 2.1
      })
    });

    const response = await docsHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulated).toBe(true);
    expect(data.documentId).toBe("simulated-document-id");
    expect(data.documentUrl).toBe("https://docs.google.com/document");
    expect(data.title).toContain("CarbonOS Route Report");
  });

  it("should handle Google Calendar schedule simulation fallback gracefully", async () => {
    const request = new Request("http://localhost/api/calendar", {
      method: "POST",
      body: JSON.stringify({
        origin: "New Delhi, Delhi, India",
        destination: "Gurugram, Haryana, India",
        transitMode: "Metro Train",
        carbonSaved: 12.5,
        moneySaved: 45,
        cost: 60,
        time: 45
      })
    });

    const response = await calendarHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulated).toBe(true);
    expect(data.htmlLink).toBe("https://calendar.google.com/calendar/u/0/r");
  });

  it("should handle Gmail dispatch simulation fallback gracefully", async () => {
    const request = new Request("http://localhost/api/mail", {
      method: "POST",
      body: JSON.stringify({
        origin: "New Delhi, Delhi, India",
        destination: "Gurugram, Haryana, India",
        transitMode: "Metro Train",
        carbonSaved: 12.5,
        moneySaved: 45,
        cost: 60,
        time: 45
      })
    });

    const response = await mailHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulated).toBe(true);
    expect(data.html).toBeDefined();
    expect(data.recipient).toBe("animesh045th3@gmail.com");
  });

  it("should handle Google Text-to-Speech simulation fallback gracefully", async () => {
    const request = new Request("http://localhost/api/speech", {
      method: "POST",
      body: JSON.stringify({
        text: "Testing Text to Speech Simulation"
      })
    });

    const response = await speechHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulated).toBe(true);
    expect(data.audioContent).toBeDefined();
  });

  it("should handle Google Cloud Storage upload simulation fallback gracefully", async () => {
    const mockFile = {
      name: "test.png",
      type: "image/png",
      arrayBuffer: async () => new ArrayBuffer(8)
    };

    const request = {
      formData: async () => {
        const fd = new Map();
        fd.set("file", mockFile);
        return {
          get: (key: string) => fd.get(key)
        };
      }
    } as any;

    const response = await uploadHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.simulated).toBe(true);
    expect(data.url).toContain("simulated-bucket");
  });
});
