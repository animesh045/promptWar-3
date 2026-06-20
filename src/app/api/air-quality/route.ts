import { NextResponse } from "next/server";
import { validateAddress, sanitizeString } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address || typeof address !== "string") {
      return NextResponse.json({ success: false, error: "Address parameter is required and must be a string." }, { status: 400 });
    }

    if (!validateAddress(address)) {
      return NextResponse.json({ success: false, error: "Invalid address format or length." }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Google Maps API Key not configured." }, { status: 500 });
    }

    // 1. Geocode address to coordinates
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();

    if (geocodeData.status !== "OK" || !geocodeData.results || geocodeData.results.length === 0) {
      return NextResponse.json({ success: false, error: `Geocoding failed: ${geocodeData.status}` }, { status: 400 });
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;
    const formattedAddress = geocodeData.results[0].formatted_address;

    // 2. Query Google Air Quality API
    const aqiUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;
    const aqiRes = await fetch(aqiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: {
          latitude: lat,
          longitude: lng
        },
        extraComputations: [
          "HEALTH_RECOMMENDATIONS",
          "DOMINANT_POLLUTANT_CONCENTRATION"
        ],
        languageCode: "en"
      })
    });

    const aqiData = await aqiRes.json();

    if (!aqiRes.ok) {
      return NextResponse.json({ success: false, error: aqiData.error?.message || "Air Quality API lookup failed." }, { status: aqiRes.status });
    }

    // Extract relevant data
    const uaqiIndex = aqiData.indexes?.find((idx: any) => idx.code === "uaqi") || aqiData.indexes?.[0];
    const aqi = uaqiIndex?.aqi ?? null;
    const category = uaqiIndex?.category || "Unknown";
    const color = uaqiIndex?.color || null;
    const dominantPollutant = aqiData.indexes?.[0]?.dominantPollutant || "Unknown";
    
    // Get recommendations
    const recommendations = aqiData.healthRecommendations?.generalPopulation || "No general recommendations available.";

    return NextResponse.json({
      success: true,
      lat,
      lng,
      formattedAddress: sanitizeString(formattedAddress),
      aqi,
      category: sanitizeString(category),
      color: color ? {
        red: Number(color.red) || 0,
        green: Number(color.green) || 0,
        blue: Number(color.blue) || 0
      } : null,
      dominantPollutant: sanitizeString(dominantPollutant),
      recommendations: sanitizeString(recommendations)
    });
  } catch (error: any) {
    console.error("Air Quality API Route Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
