import { describe, it, expect } from "vitest";
import { getGoogleAuth } from "../../lib/googleAuth";
import { calculateCarbonDNA, generateCoachRecommendations } from "../../lib/mockAi";

describe("CarbonOS Helper Utilities", () => {
  it("should fail gracefully if no credentials are found", () => {
    const prevEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const prevKey = process.env.GOOGLE_PRIVATE_KEY;
    delete process.env.GOOGLE_CLIENT_EMAIL;
    delete process.env.GOOGLE_PRIVATE_KEY;

    expect(() => getGoogleAuth(["scope1"])).toThrow(/Google Cloud service account/);

    process.env.GOOGLE_CLIENT_EMAIL = prevEmail;
    process.env.GOOGLE_PRIVATE_KEY = prevKey;
  });

  it("should initialize JWT auth if environment variables are configured", () => {
    process.env.GOOGLE_CLIENT_EMAIL = "test-email@test.com";
    process.env.GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEv\n-----END PRIVATE KEY-----";

    const auth = getGoogleAuth(["scope1"]);
    expect(auth).toBeDefined();
    expect((auth as any).email).toBe("test-email@test.com");
  });
});

describe("Carbon DNA Calculations", () => {
  it("should correctly compute score and breakdown for a petrol car driver", () => {
    const answers = {
      name: "Test User",
      transportation: "petrol_car",
      commuteMiles: 30,
      foodHabit: "nonveg_heavy",
      shoppingHabits: "frequent_new",
      flightFrequency: "frequent",
      energyBill: 5000,
      energySource: "coal_grid",
      householdSize: 4
    };

    const profile = calculateCarbonDNA(answers);
    expect(profile.name).toBe("Test User");
    expect(profile.score).toBeLessThan(50); // High footprint should yield low score
    expect(profile.breakdown.transportation).toBeGreaterThan(0);
    expect(profile.breakdown.food).toBeGreaterThan(0);
    expect(profile.breakdown.energy).toBeGreaterThan(0);
  });

  it("should correctly compute a high score for a green vegetarian metro commuter", () => {
    const answers = {
      name: "Eco Champion",
      transportation: "metro_train",
      commuteMiles: 10,
      foodHabit: "vegan",
      shoppingHabits: "secondhand_minimal",
      flightFrequency: "never",
      energyBill: 300,
      energySource: "solar_roof",
      householdSize: 1
    };

    const profile = calculateCarbonDNA(answers);
    expect(profile.name).toBe("Eco Champion");
    expect(profile.score).toBeGreaterThan(80); // Highly eco friendly habits
  });
});

describe("Coach Recommendations Engine", () => {
  it("should suggest metro transition for petrol car commuters", () => {
    const mockProfile = {
      name: "Commuter",
      transportation: "petrol_car",
      commuteMiles: 20,
      foodHabit: "vegetarian",
      shoppingHabits: "moderate",
      flightFrequency: "occasional",
      energyBill: 1000,
      energySource: "coal_grid",
      householdSize: 2,
      score: 60,
      breakdown: { transportation: 40, food: 20, shopping: 10, energy: 30 },
      missionsCompleted: [],
      streakDays: 1
    };

    const recs = generateCoachRecommendations(mockProfile);
    expect(recs.length).toBeGreaterThan(0);
    const transportRecs = recs.filter(r => r.category === "Transportation");
    expect(transportRecs.some(r => r.title.includes("Metro"))).toBe(true);
  });
});
