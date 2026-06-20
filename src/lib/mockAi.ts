export interface Recommendation {
  id: string;
  title: string;
  category: "Transportation" | "Food" | "Shopping" | "Energy" | "Household";
  description: string;
  carbonSaved: number; // in kg CO2 per year
  moneySaved: number; // in INR (₹) per year
  effort: "Low" | "Medium" | "High";
  confidence: number; // percentage 0-100
  actionLabel: string;
}

export interface UserProfile {
  name: string;
  transportation: string; // "petrol_car", "electric_car", "two_wheeler", "ola_scooter", "metro_train", "auto_rickshaw"
  commuteMiles: number; // Daily commute in km
  foodHabit: string; // "nonveg_heavy", "nonveg_light", "vegetarian", "vegan"
  shoppingHabits: string; // "frequent_new", "moderate", "secondhand_minimal"
  flightFrequency: string; // "never", "occasional", "frequent"
  energyBill: number; // average monthly INR (₹)
  energySource: string; // "coal_grid", "mixed_grid", "solar_roof"
  householdSize: number;
  score: number; // carbon score 0-100 (100 is excellent/clean)
  breakdown: {
    transportation: number; // percentage
    food: number;
    shopping: number;
    energy: number;
  };
  missionsCompleted: string[];
  streakDays: number;
  mapsApiKey?: string;
}

export const defaultProfile: UserProfile = {
  name: "Indian Sustainer",
  transportation: "petrol_car",
  commuteMiles: 20, // 20 km
  foodHabit: "vegetarian",
  shoppingHabits: "moderate",
  flightFrequency: "occasional",
  energyBill: 2500, // ₹2,500 average monthly bill
  energySource: "coal_grid",
  householdSize: 4,
  score: 65,
  breakdown: {
    transportation: 38,
    food: 22,
    shopping: 15,
    energy: 25
  },
  missionsCompleted: [],
  streakDays: 3
};

// Generates Indian DNA breakdown based on questionnaire inputs
export function calculateCarbonDNA(answers: any): UserProfile {
  let transportEmissions = 0;
  let foodEmissions = 0;
  let shoppingEmissions = 0;
  let energyEmissions = 0;

  // 1. Transportation (kg CO2 per km * 300 days)
  const km = Number(answers.commuteMiles) || 15;
  switch (answers.transportation) {
    case "petrol_car":
      transportEmissions = km * 0.18 * 300; // 180g per km
      break;
    case "electric_car":
      transportEmissions = km * 0.08 * 300; // 80g per km (still high due to Indian coal grid mix!)
      break;
    case "two_wheeler":
      transportEmissions = km * 0.08 * 300; // 80g per km
      break;
    case "ola_scooter":
      transportEmissions = km * 0.03 * 300; // 30g per km
      break;
    case "metro_train":
      transportEmissions = km * 0.02 * 300; // 20g per km
      break;
    case "auto_rickshaw":
      transportEmissions = km * 0.06 * 300; // 60g per km (CNG auto-rickshaw)
      break;
  }
  // Add flights
  switch (answers.flightFrequency) {
    case "frequent": transportEmissions += 3500; break; 
    case "occasional": transportEmissions += 1000; break; 
    case "never": transportEmissions += 0; break;
  }

  // 2. Food (kg CO2 per year)
  switch (answers.foodHabit) {
    case "nonveg_heavy": foodEmissions = 2200; break; // Heavy meat
    case "nonveg_light": foodEmissions = 1500; break; // chicken/fish only
    case "vegetarian": foodEmissions = 900; break; // Paneer/Dal/Rice (much lower!)
    case "vegan": foodEmissions = 600; break;
  }

  // 3. Shopping (kg CO2 per year)
  switch (answers.shoppingHabits) {
    case "frequent_new": shoppingEmissions = 1800; break;
    case "moderate": shoppingEmissions = 900; break;
    case "secondhand_minimal": shoppingEmissions = 300; break;
  }

  // 4. Energy (Monthly bill in INR converted to kWh, then multiplied by Indian Grid Carbon Intensity)
  // Indian average tariff: ₹7.5 per kWh.
  // Indian grid carbon intensity: ~0.82 kg CO2 per kWh (highly coal-intensive grid!).
  const monthlyKwh = (Number(answers.energyBill) || 2000) / 7.5;
  const yearlyKwh = monthlyKwh * 12;
  
  let gridIntensityFactor = 0.82; // Default Coal mix
  if (answers.energySource === "solar_roof") gridIntensityFactor = 0.05;
  else if (answers.energySource === "mixed_grid") gridIntensityFactor = 0.5;

  energyEmissions = yearlyKwh * gridIntensityFactor;

  const total = transportEmissions + foodEmissions + shoppingEmissions + energyEmissions;

  // Scale total into a score from 0 to 100 (100 is best, i.e., lowest emissions)
  // Average Indian per capita emission is around 2,500 kg CO2.
  // If user is at 2,000 kg or less, score is 90+. If user is at 8,000 kg, score is 20.
  let calculatedScore = Math.round(100 - (total / 120));
  if (calculatedScore < 10) calculatedScore = 10;
  if (calculatedScore > 98) calculatedScore = 98;

  // Return breakdown percentages
  const pTrans = Math.max(10, Math.round((transportEmissions / total) * 100)) || 25;
  const pFood = Math.max(10, Math.round((foodEmissions / total) * 100)) || 25;
  const pShop = Math.max(10, Math.round((shoppingEmissions / total) * 100)) || 25;
  const pEnergy = Math.max(5, Math.round((energyEmissions / total) * 100)) || 25;

  // Normalize percentages to sum to 100
  const sum = pTrans + pFood + pShop + pEnergy;
  const diff = 100 - sum;

  return {
    name: answers.name || "Indian Sustainer",
    transportation: answers.transportation,
    commuteMiles: km,
    foodHabit: answers.foodHabit,
    shoppingHabits: answers.shoppingHabits,
    flightFrequency: answers.flightFrequency,
    energyBill: Number(answers.energyBill) || 2000,
    energySource: answers.energySource,
    householdSize: Number(answers.householdSize) || 4,
    score: calculatedScore,
    breakdown: {
      transportation: pTrans + (diff > 0 ? diff : 0),
      food: pFood,
      shopping: pShop,
      energy: pEnergy + (diff < 0 ? diff : 0)
    },
    missionsCompleted: [],
    streakDays: 1
  };
}

export function generateCoachRecommendations(profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Transport Recommendations
  if (profile.transportation === "petrol_car" || profile.transportation === "two_wheeler") {
    recommendations.push({
      id: "rec-transport-1",
      title: "Switch 2 Commutes to Metro",
      category: "Transportation",
      description: `Riding the local metro or train for your ${profile.commuteMiles} km commute twice a week offsets petrol combustion.`,
      carbonSaved: Math.round(profile.commuteMiles * 0.15 * 2 * 52),
      moneySaved: Math.round(profile.commuteMiles * 8.5 * 2 * 52), // ₹8.5/km petrol savings
      effort: "Medium",
      confidence: 95,
      actionLabel: "Compare Metro Routes"
    });
  }

  if (profile.transportation === "two_wheeler") {
    recommendations.push({
      id: "rec-transport-2",
      title: "Evaluate Ather / Ola Electric Scooter",
      category: "Transportation",
      description: "Swapping a petrol motorcycle for a local electric scooter reduces operating expenses by 80% and slashes commute footprint.",
      carbonSaved: Math.round(profile.commuteMiles * 0.05 * 300),
      moneySaved: Math.round(profile.commuteMiles * 2.2 * 300), // fuel differential
      effort: "High",
      confidence: 90,
      actionLabel: "Track EV Scooter Swap"
    });
  }

  // Food Recommendations
  if (profile.foodHabit === "nonveg_heavy") {
    recommendations.push({
      id: "rec-food-1",
      title: "Adopt 3 Vegetarian Days",
      category: "Food",
      description: "Switching from mutton/heavy meats to paneer, dal, and local seasonal vegetables 3 days a week significantly lowers methane footprint.",
      carbonSaved: 680,
      moneySaved: 4500,
      effort: "Low",
      confidence: 97,
      actionLabel: "Browse Vegetarian Recs"
    });
  } else {
    // Delivery check (Swiggy / Zomato focus)
    recommendations.push({
      id: "rec-food-2",
      title: "Decline Swiggy / Zomato Delivery 2x/wk",
      category: "Food",
      description: "Food delivery couriers (petrol two-wheelers) generate high carbon margins. Cooking paneer-chole or dal at home saves fuel and packaging plastic.",
      carbonSaved: 190,
      moneySaved: 12000, // Large savings on delivery fees, markup and taxes!
      effort: "Low",
      confidence: 94,
      actionLabel: "Accept Home Cook Mission"
    });
  }

  // Energy Recommendations
  if (profile.energySource === "coal_grid") {
    recommendations.push({
      id: "rec-energy-1",
      title: "Switch to Green Grid/Solar Pool",
      category: "Energy",
      description: "Enroll in your utility provider's (e.g. Tata Power / Adani) green tariff program. It routes power from renewable pools directly to your meter.",
      carbonSaved: Math.round(profile.energyBill * 12 * 0.08), // approx 0.65 kg saved per rupee spent
      moneySaved: 0,
      effort: "Low",
      confidence: 92,
      actionLabel: "Check Utility Swaps"
    });
  }

  // Default fallback if profile is extremely green
  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec-green-default",
      title: "Share Carbon DNA with Family",
      category: "Household",
      description: "You are leading! Inspiring community actions in your colony will multiply carbon sinks.",
      carbonSaved: 120,
      moneySaved: 0,
      effort: "Low",
      confidence: 99,
      actionLabel: "Share Profile"
    });
  }

  return recommendations;
}

export function generateCoachChatResponse(
  message: string,
  history: { role: string; content: string }[],
  profile: UserProfile
): { text: string; recommendedActions?: Recommendation[] } {
  const lowercaseMsg = message.toLowerCase();
  
  if (lowercaseMsg.includes("delivery") || lowercaseMsg.includes("food") || lowercaseMsg.includes("zomato") || lowercaseMsg.includes("swiggy")) {
    return {
      text: `Looking at your Indian Carbon DNA, **Swiggy & Zomato deliveries** represent major packaging and delivery mileage emission drivers. 

Swapping restaurant deliveries for simple home-cooked vegetarian meals (like paneer, dal-roti, or chole) just 2 times a week cuts **${profile.foodHabit === 'nonveg_heavy' ? '6.8kg' : '3.4kg'} of CO₂ per week** (the equivalent of charging a laptop continuously for 2.5 months). Plus, it keeps roughly **₹1,200/month** in your wallet by bypassing delivery charges and taxes!

Here is my action recommendation:`,
      recommendedActions: [
        {
          id: "chat-rec-food-1",
          title: "Cook One Local Dal-Rice Meal",
          category: "Food",
          description: "Decline Zomato/Swiggy. Cook a fresh home meal using locally sourced pulses.",
          carbonSaved: 12,
          moneySaved: 280,
          effort: "Low",
          confidence: 95,
          actionLabel: "Mark as Completed"
        },
        {
          id: "chat-rec-food-2",
          title: "Buy Sabzi from Local Mandi",
          category: "Food",
          description: "Shop at the local weekly vegetable market rather than buying plastic-wrapped cold-storage veggies.",
          carbonSaved: 45,
          moneySaved: 150,
          effort: "Medium",
          confidence: 90,
          actionLabel: "Mandi Location List"
        }
      ]
    };
  }

  if (lowercaseMsg.includes("commute") || lowercaseMsg.includes("transport") || lowercaseMsg.includes("auto") || lowercaseMsg.includes("metro") || lowercaseMsg.includes("drive")) {
    return {
      text: `Your profile logs a **${profile.commuteMiles} km daily commute**. Driving a petrol hatchback or auto generates massive corridor pollution.

If you ride the **Metro or local train** instead of a petrol hatchback even **two days a week**, you'll mitigate roughly **${Math.round(profile.commuteMiles * 0.16 * 2 * 52)} kg of CO₂** annually and bypass metropolitan traffic jams!

Here are carbon intercept solutions for your Indian commute:`,
      recommendedActions: [
        {
          id: "chat-rec-trans-1",
          title: "Delhi/Mumbai Metro Commuting",
          category: "Transportation",
          description: "Adopt electric mass transit metro options. Check comparative routing in the Travel Engine.",
          carbonSaved: 280,
          moneySaved: 4800,
          effort: "Medium",
          confidence: 96,
          actionLabel: "Go to Travel Engine"
        }
      ]
    };
  }

  // General fallback
  return {
    text: `Namaste ${profile.name}! I am your CarbonOS AI Climate Coach. 
    
Your primary footprint driver is **${profile.breakdown.transportation > 40 ? 'Transportation' : profile.breakdown.food > 30 ? 'Food choices (Zomato/Heavy non-veg)' : 'Household Electricity'}**, making up **${Math.max(profile.breakdown.transportation, profile.breakdown.food, profile.breakdown.energy)}%** of your baseline. 

Focusing on targeted shifts—such as choosing local mandi sabzi, taking the metro, or swapping to solar roof net metering—delivers 15x better results than micro-habits. What would you like to look at first?`,
    recommendedActions: generateCoachRecommendations(profile).slice(0, 2)
  };
}

export function simulateCarbonLensScan(scanType: string, filename: string): {
  carbonScore: number;
  extractedTitle: string;
  impactDrivers: string[];
  healthierAlternatives: string[];
  greenerAlternatives: string[];
  costComparison: { current: number; green: number };
  expectedAnnualImpact: number; // kg saved
} {
  switch (scanType) {
    case "electricity":
      return {
        carbonScore: 28, // Lower score due to heavy coal grid mix in India!
        extractedTitle: "State Electricity Bill (MSEDCL / BESCOM)",
        impactDrivers: [
          "Powered by State grid pool reliant heavily on Coal (72% carbon intensity)",
          "High cooling load from 2 ACs set at 20°C instead of eco-efficient 24°C",
          "Phantom standby load from home water pump and electronics"
        ],
        healthierAlternatives: [
          "Calibrate AC units to 24°C"
        ],
        greenerAlternatives: [
          "Switch contract to Green Power Tariff option (+₹0.66 per unit)",
          "Install Rooftop Solar Net-Metering system (-₹1,800/mo electricity bill)"
        ],
        costComparison: { current: 4800, green: 5200 }, // in INR
        expectedAnnualImpact: 1980
      };
    case "receipt":
      return {
        carbonScore: 52,
        extractedTitle: "Zomato Restaurant Delivery Receipt",
        impactDrivers: [
          "Heavy double-container plastic packaging and plastic cutlery",
          "Courier transport emissions (petrol motorcycle covering 8km)",
          "Mutton Curry item (high carbon intensity livestock rearing)"
        ],
        healthierAlternatives: [
          "Home-cooked Paneer Butter Masala",
          "Opt-out of Zomato plastic cutlery"
        ],
        greenerAlternatives: [
          "Choose local vegetarian dishes (Dal Makhani/Tadka) (-2.8kg CO2)",
          "Decline delivery and pick up food via active bicycle transit"
        ],
        costComparison: { current: 650, green: 220 }, // in INR (restaurant vs home cook)
        expectedAnnualImpact: 480
      };
    case "product":
      return {
        carbonScore: 38,
        extractedTitle: "Synthetic Polyester Kurta - Fast Fashion Brand",
        impactDrivers: [
          "Polyester fabric (petrochemical derivative, high manufacturing heat)",
          "Synthetic dyes released into local river channels during spinning",
          "Heavy road cargo transport from textile factory"
        ],
        healthierAlternatives: [
          "Khadi or Organic Cotton Handloom Kurta"
        ],
        greenerAlternatives: [
          "Purchase Handloom Khadi cotton Kurta (-18kg CO2 footprint)",
          "Support local thrift resellers or clothing swap networks"
        ],
        costComparison: { current: 1200, green: 800 }, // in INR
        expectedAnnualImpact: 140
      };
    case "menu":
    default:
      return {
        carbonScore: 61,
        extractedTitle: "Udupi Vegetarian Restaurant Menu",
        impactDrivers: [
          "Dairy-heavy dishes like Butter Paneer Masala",
          "Imported packaged canned beverages",
          "Zero emission locally sourced lentils and grains"
        ],
        healthierAlternatives: [
          "Masala Dosa, Idli-Sambar, or Rava Dosa",
          "Filter Coffee or fresh Lime Soda"
        ],
        greenerAlternatives: [
          "Order Sambar-Idli or Plain Dosa instead of Paneer Butter Masala (-1.2kg CO2)",
          "Opt for tap filtered water instead of plastic mineral bottles"
        ],
        costComparison: { current: 280, green: 180 }, // in INR
        expectedAnnualImpact: 110
      };
  }
}

export function getWeeklyMissions(): {
  id: string;
  title: string;
  description: string;
  carbonReduction: number;
  streakIncrement: boolean;
  rewardPoints: number;
  completed: boolean;
}[] {
  return [
    {
      id: "mission-1",
      title: "Ride Metro/Local Train Twice",
      description: "Bypass petrol traffic. Ride the public metro or local train for 2 commutes.",
      carbonReduction: 6.4,
      streakIncrement: true,
      rewardPoints: 150,
      completed: false
    },
    {
      id: "mission-2",
      title: "Skip Zomato/Swiggy Orders",
      description: "Avoid courier fuel and plastic packaging. Cook paneer or dal at home.",
      carbonReduction: 3.4,
      streakIncrement: false,
      rewardPoints: 100,
      completed: false
    },
    {
      id: "mission-3",
      title: "Buy Mandi Sabzi",
      description: "Purchase fresh weekly produce from a local vegetable cart/mandi instead of superstores.",
      carbonReduction: 1.8,
      streakIncrement: true,
      rewardPoints: 80,
      completed: false
    },
    {
      id: "mission-4",
      title: "Phantom AC Cutoff",
      description: "Set AC sleep timer to turn off after 3 hours. Set AC temperature to 24°C.",
      carbonReduction: 4.5,
      streakIncrement: false,
      rewardPoints: 120,
      completed: false
    }
  ];
}

export function getImpactFeed(): {
  id: string;
  timestamp: string;
  userName: string;
  actionText: string;
  carbonReduced: number;
  equivalenceText: string;
  type: "transport" | "food" | "shopping" | "energy";
}[] {
  return [
    {
      id: "feed-1",
      timestamp: "3 hours ago",
      userName: "You",
      actionText: "opted for Metro instead of a petrol cab for commute",
      carbonReduced: 2.8,
      equivalenceText: "Running a home ceiling fan continuously for 5 months",
      type: "transport"
    },
    {
      id: "feed-2",
      timestamp: "6 hours ago",
      userName: "Amit Patel",
      actionText: "completed the 'Skip Swiggy Delivery' home paneer dinner",
      carbonReduced: 3.4,
      equivalenceText: "Offsets the carbon weight of 4 LPG cylinder cooking hours",
      type: "food"
    },
    {
      id: "feed-3",
      timestamp: "Yesterday",
      userName: "You",
      actionText: "switched home grid pool tariff to Tata Power Green Tariff",
      carbonReduced: 86.0,
      equivalenceText: "Planting 4 mature shade Banyan trees in your society",
      type: "energy"
    },
    {
      id: "feed-4",
      timestamp: "3 days ago",
      userName: "Neha Sharma",
      actionText: "purchased a Khadi organic Kurti, rejecting polyester fast-fashion",
      carbonReduced: 18.0,
      equivalenceText: "Conserves 3,500 liters of water in local cotton growing",
      type: "shopping"
    }
  ];
}
