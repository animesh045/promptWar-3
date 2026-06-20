import { describe, it, expect } from "vitest";
import { isFirebaseConfigured, syncProfileToFirebase, loadProfileFromFirebase } from "./firebase";

describe("Firebase integration: fallback mode", () => {
  it("should detect that Firebase is not configured by default", () => {
    expect(isFirebaseConfigured).toBe(false);
  });

  it("should gracefully return false when syncing profile without configuration", async () => {
    const dummyProfile = { name: "Test Commuter", score: 85 };
    const result = await syncProfileToFirebase(dummyProfile);
    expect(result).toBe(false);
  });

  it("should gracefully return null when loading profile without configuration", async () => {
    const result = await loadProfileFromFirebase("Test Commuter");
    expect(result).toBeNull();
  });
});
