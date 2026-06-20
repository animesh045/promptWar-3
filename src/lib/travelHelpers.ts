export interface TransitMethod {
  id: string;
  name: string;
  carbon: number; // kg CO2
  cost: number; // INR
  time: number; // minutes
  savings: number; // INR saved relative to car baseline
  carbonSaved: number; // kg saved relative to car baseline
  color: string;
  pathLength: number;
  pathDash: number;
}

/**
 * Resolves Maps search link according to transit selection.
 */
export function getRedirectUrl(id: string, origin: string, destination: string): string {
  const encOrigin = encodeURIComponent(origin);
  const encDest = encodeURIComponent(destination);
  switch (id) {
    case "metro":
      return `https://www.google.com/maps/dir/?api=1&origin=${encOrigin}&destination=${encDest}&travelmode=transit`;
    case "train":
      return "https://www.irctc.co.in/nget/train-search";
    case "bus":
      return `https://www.google.com/maps/dir/?api=1&origin=${encOrigin}&destination=${encDest}&travelmode=transit`;
    case "bike":
      return "https://www.olaelectric.com/";
    case "walk":
      return `https://www.google.com/maps/dir/?api=1&origin=${encOrigin}&destination=${encDest}&travelmode=walking`;
    case "car":
      return "https://www.uber.com/in/en/";
    default:
      return `https://www.google.com/maps/dir/?api=1&origin=${encOrigin}&destination=${encDest}`;
  }
}

/**
 * Returns user CTA label for transit mapping options.
 */
export function getActionLabel(id: string): string {
  switch (id) {
    case "metro":
      return "Open Metro Route Map";
    case "train":
      return "Book on IRCTC Portal";
    case "bus":
      return "Open Bus Directions";
    case "bike":
      return "Ola Electric App";
    case "walk":
      return "Open Walking Map";
    case "car":
      return "Book Uber / Ola Cab";
    default:
      return "Open Map Directions";
  }
}

/**
 * Computes commuter metric options dynamically.
 */
export function computeTransitMethods(
  originStr: string,
  destinationStr: string,
  distanceKm?: number,
  durationSec?: number
): TransitMethod[] {
  let distanceInKm = 12; // default Bandra to Andheri
  let baseDurationSec = 1500; // 25 mins default

  if (distanceKm !== undefined && durationSec !== undefined) {
    distanceInKm = distanceKm;
    baseDurationSec = durationSec;
  } else {
    // Deterministic estimation based on text inputs
    if (originStr && destinationStr) {
      let hash = 0;
      const str = originStr + destinationStr;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      distanceInKm = Math.abs(hash % 35) + 4; // Between 4 km and 39 km
      baseDurationSec = Math.round((distanceInKm / 28) * 3600); // 28 km/h avg speed
    }
  }

  // Dynamic names based on geographical location search
  const combined = `${originStr} ${destinationStr}`.toLowerCase();
  let metroName = "Mumbai Metro";
  let busName = "BEST CNG Bus";
  let trainName = "Local Train";

  if (
    combined.includes("delhi") ||
    combined.includes("noida") ||
    combined.includes("gurugram") ||
    combined.includes("gurgaon") ||
    combined.includes("faridabad") ||
    combined.includes("ghaziabad") ||
    combined.includes("ncr")
  ) {
    metroName = "Delhi Metro";
    busName = "DTC CNG Bus";
    trainName = "Northern Railways Suburban";
  } else if (combined.includes("bangalore") || combined.includes("bengaluru")) {
    metroName = "Namma Metro";
    busName = "BMTC Electric Bus";
    trainName = "SWR Local Train";
  } else if (combined.includes("kolkata") || combined.includes("calcutta")) {
    metroName = "Kolkata Metro";
    busName = "CSTC Bus";
    trainName = "Eastern Railway Local";
  } else if (combined.includes("chennai") || combined.includes("madras")) {
    metroName = "Chennai Metro";
    busName = "MTC Bus";
    trainName = "SR Suburban Train";
  } else if (combined.includes("pune")) {
    metroName = "Pune Metro";
    busName = "PMPML Bus";
    trainName = "Pune Local Train";
  } else if (combined.includes("hyderabad")) {
    metroName = "Hyderabad Metro";
    busName = "TSRTC Bus";
    trainName = "MMTS Local Train";
  }

  const carTime = Math.round(baseDurationSec / 60);
  const carCost = distanceInKm * 18 + 50; // ₹18 per km + ₹50 base auto/cab
  const carCarbon = parseFloat((distanceInKm * 0.17).toFixed(2)); // 0.17 kg CO2 per km

  const methods = [
    {
      id: "metro",
      name: metroName,
      carbon: parseFloat((distanceInKm * 0.012).toFixed(2)),
      cost: Math.round(10 + distanceInKm * 3),
      time: Math.round(4 + distanceInKm * 1.3),
      color: "var(--brand-500)",
      pathLength: 200,
      pathDash: 6,
    },
    {
      id: "train",
      name: trainName,
      carbon: parseFloat((distanceInKm * 0.007).toFixed(2)),
      cost: Math.round(5 + distanceInKm * 0.8),
      time: Math.round(8 + distanceInKm * 1.1),
      color: "var(--blue-500)",
      pathLength: 180,
      pathDash: 8,
    },
    {
      id: "bus",
      name: busName,
      carbon: parseFloat((distanceInKm * 0.022).toFixed(2)),
      cost: Math.round(6 + distanceInKm * 1.2),
      time: Math.round(4 + carTime * 1.25),
      color: "var(--purple-500)",
      pathLength: 220,
      pathDash: 10,
    },
    {
      id: "bike",
      name: "Ola Electric Scooter",
      carbon: parseFloat((distanceInKm * 0.009).toFixed(2)),
      cost: Math.round(10 + distanceInKm * 4),
      time: Math.round(carTime * 0.85),
      color: "#34d399",
      pathLength: 240,
      pathDash: 0,
    },
    {
      id: "walk",
      name: "Walking",
      carbon: 0.0,
      cost: 0,
      time: Math.round(distanceInKm * 12),
      color: "var(--text-tertiary)",
      pathLength: 240,
      pathDash: 0,
    },
    {
      id: "car",
      name: "Auto/Cab Ride (Baseline)",
      carbon: carCarbon,
      cost: Math.round(carCost),
      time: carTime,
      color: "var(--orange-500)",
      pathLength: 260,
      pathDash: 0,
    },
  ];

  return methods.map((m) => {
    const savings = Math.max(0, carCost - m.cost);
    const carbonSaved = Math.max(0, carCarbon - m.carbon);
    return {
      ...m,
      savings,
      carbonSaved: parseFloat(carbonSaved.toFixed(2)),
    };
  });
}
