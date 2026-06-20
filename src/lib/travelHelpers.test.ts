import { describe, it, expect } from "vitest";
import { getRedirectUrl, getActionLabel, computeTransitMethods } from "./travelHelpers";

describe("travelHelpers: getRedirectUrl", () => {
  it("returns google maps transit direction link for metro and bus", () => {
    const origin = "Bandra";
    const dest = "Andheri";
    expect(getRedirectUrl("metro", origin, dest)).toContain("travelmode=transit");
    expect(getRedirectUrl("bus", origin, dest)).toContain("travelmode=transit");
  });

  it("returns IRCTC train link for train", () => {
    expect(getRedirectUrl("train", "Delhi", "Mumbai")).toBe("https://www.irctc.co.in/nget/train-search");
  });

  it("returns Ola Electric link for bike", () => {
    expect(getRedirectUrl("bike", "Bandra", "Juhu")).toBe("https://www.olaelectric.com/");
  });

  it("returns google maps walking direction link for walk", () => {
    expect(getRedirectUrl("walk", "Bandra", "Juhu")).toContain("travelmode=walking");
  });

  it("returns Uber link for car", () => {
    expect(getRedirectUrl("car", "Bandra", "Juhu")).toBe("https://www.uber.com/in/en/");
  });

  it("returns fallback maps redirection link for unknown method", () => {
    expect(getRedirectUrl("teleport", "Bandra", "Juhu")).toContain("dir/?api=1");
  });
});

describe("travelHelpers: getActionLabel", () => {
  it("returns correct CTA labels for different modes", () => {
    expect(getActionLabel("metro")).toBe("Open Metro Route Map");
    expect(getActionLabel("train")).toBe("Book on IRCTC Portal");
    expect(getActionLabel("bus")).toBe("Open Bus Directions");
    expect(getActionLabel("bike")).toBe("Ola Electric App");
    expect(getActionLabel("walk")).toBe("Open Walking Map");
    expect(getActionLabel("car")).toBe("Book Uber / Ola Cab");
    expect(getActionLabel("unknown")).toBe("Open Map Directions");
  });
});

describe("travelHelpers: computeTransitMethods", () => {
  it("uses deterministic estimation based on text inputs when no numbers are provided", () => {
    const methods = computeTransitMethods("Delhi Airport", "Connaught Place");
    expect(methods.length).toBe(6);
    
    const metro = methods.find(m => m.id === "metro");
    expect(metro).toBeDefined();
    expect(metro?.name).toBe("Delhi Metro");
    expect(metro?.carbonSaved).toBeGreaterThanOrEqual(0);
    expect(metro?.savings).toBeGreaterThanOrEqual(0);
  });

  it("adjusts transit names based on regions", () => {
    // Bangalore
    const bangalore = computeTransitMethods("Majestic Bangalore", "Whitefield Bengaluru");
    expect(bangalore.find(m => m.id === "metro")?.name).toBe("Namma Metro");
    expect(bangalore.find(m => m.id === "bus")?.name).toBe("BMTC Electric Bus");

    // Pune
    const pune = computeTransitMethods("Kothrud Pune", "Shivajinagar Pune");
    expect(pune.find(m => m.id === "metro")?.name).toBe("Pune Metro");

    // Hyderabad
    const hyd = computeTransitMethods("Secunderabad Hyderabad", "Gachibowli");
    expect(hyd.find(m => m.id === "metro")?.name).toBe("Hyderabad Metro");

    // Kolkata
    const kolkata = computeTransitMethods("Howrah Kolkata", "Salt Lake");
    expect(kolkata.find(m => m.id === "metro")?.name).toBe("Kolkata Metro");
  });

  it("uses supplied distance and duration if passed in", () => {
    const distanceKm = 10;
    const durationSec = 1800; // 30 minutes
    const methods = computeTransitMethods("Bandra", "Andheri", distanceKm, durationSec);

    const car = methods.find(m => m.id === "car");
    expect(car?.time).toBe(30);
    expect(car?.cost).toBe(10 * 18 + 50); // ₹230
    expect(car?.carbon).toBe(1.7); // 10 * 0.17
  });
});
