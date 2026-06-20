"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { 
  MapPin, 
  Navigation, 
  Car, 
  Train, 
  Bus, 
  Bike, 
  Footprints, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Leaf,
  Info,
  Volume2,
  Wind
} from "lucide-react";

interface TransitMethod {
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

const getIconForMethod = (id: string) => {
  switch (id) {
    case "metro": return Train;
    case "train": return Train;
    case "bus": return Bus;
    case "bike": return Bike;
    case "walk": return Footprints;
    case "car": default: return Car;
  }
};

const getRedirectUrl = (id: string, origin: string, destination: string) => {
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
};

const getActionLabel = (id: string) => {
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
};

export default function TravelImpactEngine() {
  const [origin, setOrigin] = useState("Bandra, Mumbai");
  const [destination, setDestination] = useState("Andheri, Mumbai");
  const [calculating, setCalculating] = useState(false);
  const [activeMethod, setActiveMethod] = useState<string>("metro");
  const [showRealMap, setShowRealMap] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState("");
  const [transitMethods, setTransitMethods] = useState<TransitMethod[]>([]);
  const activeMethodDetails = transitMethods.find(m => m.id === activeMethod) || transitMethods[0] || {
    id: "metro",
    name: "Mumbai Metro",
    carbon: 0.1,
    cost: 30,
    time: 18,
    savings: 270,
    carbonSaved: 4.0,
    color: "var(--brand-500)",
    pathLength: 200,
    pathDash: 6
  };
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetsSynced, setSheetsSynced] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [syncingDocs, setSyncingDocs] = useState(false);
  const [docsSynced, setDocsSynced] = useState(false);
  const [docUrl, setDocUrl] = useState("");
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  
  const [originAqi, setOriginAqi] = useState<any>(null);
  const [destinationAqi, setDestinationAqi] = useState<any>(null);
  const [fetchingAqi, setFetchingAqi] = useState(false);
  const [playingNarrative, setPlayingNarrative] = useState(false);

  const [syncingMail, setSyncingMail] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [mailSimulated, setMailSimulated] = useState(false);

  const [syncingCalendar, setSyncingCalendar] = useState(false);
  const [calendarSynced, setCalendarSynced] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState("");
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [loadingYoutube, setLoadingYoutube] = useState(false);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);

  // Dynamic Transit Calculation Engine
  const computeTransitMethods = (
    originStr: string,
    destinationStr: string,
    distanceKm?: number,
    durationSec?: number
  ): TransitMethod[] => {
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

    if (combined.includes("delhi") || combined.includes("noida") || combined.includes("gurugram") || combined.includes("gurgaon") || combined.includes("faridabad") || combined.includes("ghaziabad") || combined.includes("ncr")) {
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
        pathDash: 6
      },
      {
        id: "train",
        name: trainName,
        carbon: parseFloat((distanceInKm * 0.007).toFixed(2)),
        cost: Math.round(5 + distanceInKm * 0.8),
        time: Math.round(8 + distanceInKm * 1.1),
        color: "var(--blue-500)",
        pathLength: 180,
        pathDash: 8
      },
      {
        id: "bus",
        name: busName,
        carbon: parseFloat((distanceInKm * 0.022).toFixed(2)),
        cost: Math.round(6 + distanceInKm * 1.2),
        time: Math.round(4 + carTime * 1.25),
        color: "var(--purple-500)",
        pathLength: 220,
        pathDash: 10
      },
      {
        id: "bike",
        name: "Ola Electric Scooter",
        carbon: parseFloat((distanceInKm * 0.009).toFixed(2)),
        cost: Math.round(10 + distanceInKm * 4),
        time: Math.round(carTime * 0.85),
        color: "#34d399",
        pathLength: 240,
        pathDash: 0
      },
      {
        id: "walk",
        name: "Walking",
        carbon: 0.0,
        cost: 0,
        time: Math.round(distanceInKm * 12),
        color: "var(--text-tertiary)",
        pathLength: 240,
        pathDash: 0
      },
      {
        id: "car",
        name: "Auto/Cab Ride (Baseline)",
        carbon: carCarbon,
        cost: Math.round(carCost),
        time: carTime,
        color: "var(--orange-500)",
        pathLength: 260,
        pathDash: 0
      }
    ];

    return methods.map((m) => {
      const savings = Math.max(0, carCost - m.cost);
      const carbonSaved = Math.max(0, carCarbon - m.carbon);
      return {
        ...m,
        savings,
        carbonSaved: parseFloat(carbonSaved.toFixed(2))
      };
    });
  };

  const fetchAqiData = async (org: string, dest: string) => {
    setFetchingAqi(true);
    try {
      const [originRes, destRes] = await Promise.all([
        fetch("/api/air-quality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: org })
        }),
        fetch("/api/air-quality", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: dest })
        })
      ]);
      const originData = await originRes.json();
      const destData = await destRes.json();
      if (originData.success) setOriginAqi(originData);
      else setOriginAqi(null);
      
      if (destData.success) setDestinationAqi(destData);
      else setDestinationAqi(null);
    } catch (e) {
      console.error("AQI Fetch Error:", e);
    } finally {
      setFetchingAqi(false);
    }
  };

  const handlePlayNarrative = async () => {
    const audioEl = document.getElementById("narrative-audio-player") as HTMLAudioElement;
    if (playingNarrative) {
      if (audioEl) audioEl.pause();
      setPlayingNarrative(false);
      return;
    }

    setPlayingNarrative(true);
    try {
      const textToSynthesize = `By choosing ${activeMethodDetails.name} instead of a standard cab ride, you prevent ${activeMethodDetails.carbonSaved} kilograms of carbon dioxide emissions and save ${activeMethodDetails.savings.toFixed(0)} rupees on this journey. This carbon reduction is equivalent to powering a smartphone for ${Math.round(activeMethodDetails.carbonSaved * 350)} days. Thank you for your active ecological stewardship.`;
      
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSynthesize })
      });
      const data = await response.json();
      if (data.success && data.audioContent) {
        const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
        if (audioEl) {
          audioEl.src = audioUrl;
          audioEl.play();
          audioEl.onended = () => {
            setPlayingNarrative(false);
          };
        }
      } else {
        setPlayingNarrative(false);
      }
    } catch (e) {
      console.error(e);
      setPlayingNarrative(false);
    }
  };

  useEffect(() => {
    // Initial calculation
    setTransitMethods(computeTransitMethods(origin, destination));
    fetchAqiData(origin, destination);

    // Check environment variable first
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    let finalKey = "";
    if (envKey) {
      finalKey = envKey;
    } else {
      // Check if Google Maps Key exists in settings
      const savedProfile = localStorage.getItem("carbonos-profile");
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed.mapsApiKey) {
            finalKey = parsed.mapsApiKey;
          }
        } catch (e) {}
      }
    }

    if (finalKey) {
      setMapsApiKey(finalKey);
      setShowRealMap(true);
    }
  }, []);

  // Google Maps Places Autocomplete setup
  useEffect(() => {
    if (!mapsApiKey) return;

    const initAutocomplete = () => {
      if (!(window as any).google || !originRef.current || !destinationRef.current) return;

      const originAutocomplete = new (window as any).google.maps.places.Autocomplete(originRef.current, {
        types: ["geocode", "establishment"]
      });
      originAutocomplete.addListener("place_changed", () => {
        const place = originAutocomplete.getPlace();
        if (place.formatted_address) {
          setOrigin(place.formatted_address);
        } else if (place.name) {
          setOrigin(place.name);
        }
      });

      const destAutocomplete = new (window as any).google.maps.places.Autocomplete(destinationRef.current, {
        types: ["geocode", "establishment"]
      });
      destAutocomplete.addListener("place_changed", () => {
        const place = destAutocomplete.getPlace();
        if (place.formatted_address) {
          setDestination(place.formatted_address);
        } else if (place.name) {
          setDestination(place.name);
        }
      });
    };

    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
      if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
        initAutocomplete();
      } else {
        existingScript.addEventListener("load", initAutocomplete);
      }
    }
  }, [mapsApiKey]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleRouteCompute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    
    setCalculating(true);
    fetchAqiData(origin, destination);

    if ((window as any).google && (window as any).google.maps && mapsApiKey) {
      const service = new (window as any).google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: (window as any).google.maps.TravelMode.DRIVING,
        },
        (response: any, status: any) => {
          setCalculating(false);
          if (status === "OK" && response && response.rows[0].elements[0].status === "OK") {
            const element = response.rows[0].elements[0];
            const distanceKm = element.distance.value / 1000;
            const durationSec = element.duration.value;
            setTransitMethods(computeTransitMethods(origin, destination, distanceKm, durationSec));
          } else {
            setTransitMethods(computeTransitMethods(origin, destination));
          }
        }
      );
    } else {
      setTimeout(() => {
        setTransitMethods(computeTransitMethods(origin, destination));
        setCalculating(false);
      }, 1000);
    }
  };

  const handleExportPDF = () => {
    setIsPdfModalOpen(true);
  };

  const handleSyncSheets = async () => {
    setSyncingSheets(true);
    try {
      const response = await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          transitMode: activeMethodDetails.name,
          carbonSaved: activeMethodDetails.carbonSaved,
          moneySaved: activeMethodDetails.savings,
          cost: activeMethodDetails.cost,
          time: activeMethodDetails.time
        })
      });
      const data = await response.json();
      if (data.success) {
        setSheetsSynced(true);
        if (data.spreadsheetUrl) {
          setSheetUrl(data.spreadsheetUrl);
        }
        setTimeout(() => setSheetsSynced(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleSyncDocs = async () => {
    setSyncingDocs(true);
    try {
      const response = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          transitMode: activeMethodDetails.name,
          carbonSaved: activeMethodDetails.carbonSaved,
          moneySaved: activeMethodDetails.savings,
          cost: activeMethodDetails.cost,
          time: activeMethodDetails.time,
          carbon: activeMethodDetails.carbon
        })
      });
      const data = await response.json();
      if (data.success) {
        setDocsSynced(true);
        if (data.documentUrl) {
          setDocUrl(data.documentUrl);
        }
        setTimeout(() => setDocsSynced(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingDocs(false);
    }
  };

  const handleSendEmail = async () => {
    setSyncingMail(true);
    try {
      const response = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          transitMode: activeMethodDetails.name,
          carbonSaved: activeMethodDetails.carbonSaved,
          moneySaved: activeMethodDetails.savings,
          cost: activeMethodDetails.cost,
          time: activeMethodDetails.time
        })
      });
      const data = await response.json();
      if (data.success) {
        setMailSent(true);
        setMailSimulated(data.simulated);
        setTimeout(() => setMailSent(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingMail(false);
    }
  };

  const handleSyncCalendar = async () => {
    setSyncingCalendar(true);
    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          transitMode: activeMethodDetails.name,
          carbonSaved: activeMethodDetails.carbonSaved,
          moneySaved: activeMethodDetails.savings,
          cost: activeMethodDetails.cost,
          time: activeMethodDetails.time
        })
      });
      const data = await response.json();
      if (data.success) {
        setCalendarSynced(true);
        if (data.htmlLink) {
          setCalendarUrl(data.htmlLink);
        }
        setTimeout(() => setCalendarSynced(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingCalendar(false);
    }
  };

  const fetchYoutubeVideos = async (methodName: string) => {
    setLoadingYoutube(true);
    try {
      const query = `${methodName} travel guide india`;
      const res = await fetch(`/api/youtube?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.videos) {
        setYoutubeVideos(data.videos);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingYoutube(false);
    }
  };

  useEffect(() => {
    if (activeMethodDetails?.name) {
      fetchYoutubeVideos(activeMethodDetails.name);
    }
  }, [activeMethodDetails?.name]);

  return (
    <AppLayout>
      <div className="travel-page-grid">
        {/* Left Side: Route Controls & Comparison List */}
        <div className="travel-controls-stack">
          {/* Card: Inputs */}
          <div className="glass-card router-input-card">
            <span className="card-pre">GOOGLE MAPS PLATFORM</span>
            <h2>Travel Impact Engine</h2>
            <p>Determine the lowest-carbon trajectory for your daily commutes and journeys.</p>

            <form onSubmit={handleRouteCompute} className="routing-form">
              <div className="input-group">
                <span className="input-label">Origin Address</span>
                <div className="input-with-icon">
                  <MapPin size={16} className="input-field-icon" />
                  <input 
                    type="text" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value)}
                    ref={originRef}
                    onKeyDown={handleKeyDown}
                    className="input-field" 
                    placeholder="Enter starting location"
                  />
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">Destination Address</span>
                <div className="input-with-icon">
                  <Navigation size={16} className="input-field-icon" />
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    ref={destinationRef}
                    onKeyDown={handleKeyDown}
                    className="input-field" 
                    placeholder="Enter ending location"
                  />
                </div>
              </div>

              <button className="btn btn-primary route-submit-btn" type="submit" disabled={calculating}>
                {calculating ? "Calculating Routes..." : "Optimize Trajectory"}
              </button>
            </form>
          </div>

          {/* List of transit options */}
          <div className="transit-options-list">
            {transitMethods.map((m) => {
              const Icon = getIconForMethod(m.id);
              const isSelected = activeMethod === m.id;
              return (
                <div 
                  key={m.id}
                  className={`glass-card transit-option-card ${isSelected ? "active" : ""}`}
                  style={{ borderLeftColor: isSelected ? m.color : "transparent" }}
                  onClick={() => setActiveMethod(m.id)}
                >
                  <div className="option-primary-header">
                    <div className="option-title-wrap">
                      <Icon size={18} style={{ color: m.color }} />
                      <h4>{m.name}</h4>
                    </div>
                    <span className="option-time-lbl">{m.time} mins</span>
                  </div>

                  <div className="option-metrics-summary">
                    <div className="sub-metric">
                      <span className="lbl">CARBON</span>
                      <strong className="val" style={{ color: m.carbon > 2.0 ? "var(--orange-500)" : "var(--text-primary)" }}>
                        {m.carbon} kg
                      </strong>
                    </div>
                    <div className="sub-metric">
                      <span className="lbl">FARE COST</span>
                      <strong className="val">₹{m.cost.toFixed(0)}</strong>
                    </div>
                    {m.carbonSaved > 0 && (
                      <div className="sub-metric flex-end-m">
                        <span className="lbl green">CO₂ SAVED</span>
                        <strong className="val green">-{m.carbonSaved} kg</strong>
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <button 
                      className="btn btn-primary action-redirect-btn" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getRedirectUrl(m.id, origin, destination), "_blank");
                      }}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.4rem 0.8rem",
                        fontSize: "0.75rem",
                        width: "fit-content",
                        alignSelf: "flex-end"
                      }}
                    >
                      {getActionLabel(m.id)} ↗
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="travel-map-panel">
          <div className="glass-card map-display-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "0.5rem" }}>
              <h3>Interactive Routing Workspace</h3>
              {mapsApiKey && (
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
                  onClick={() => setShowRealMap(!showRealMap)}
                >
                  {showRealMap ? "Use SVG Map" : "Use Google Map"}
                </button>
              )}
            </div>
            
            {showRealMap && mapsApiKey ? (
              <div className="real-google-map-iframe">
                {/* Embed actual Google Map Embed if key provided */}
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: "14px" }}
                  loading="lazy"
                  src={`https://www.google.com/maps/embed/v1/directions?key=${mapsApiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${activeMethod === 'car' ? 'driving' : activeMethod === 'bike' ? 'bicycling' : activeMethod === 'walk' ? 'walking' : 'transit'}`}
                ></iframe>
              </div>
            ) : (
              <div className="vector-map-canvas">
                {/* Custom SVG Vector Map representing Brooklyn to Manhattan */}
                <svg viewBox="0 0 300 240" className="vector-map-svg">
                  {/* Water Body Grid */}
                  <path d="M 0 100 Q 150 140 300 120 L 300 240 L 0 240 Z" fill="rgba(59, 130, 246, 0.04)" />
                  <path d="M 0 100 Q 150 140 300 120" stroke="rgba(59, 130, 246, 0.15)" strokeWidth="4" fill="none" />

                  {/* Landmass Outlines */}
                  <text x="20" y="40" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">MANHATTAN</text>
                  <text x="180" y="210" fill="var(--text-tertiary)" fontSize="9" fontFamily="var(--font-mono)">BROOKLYN</text>

                  {/* Pins */}
                  <circle cx="60" cy="70" r="4" fill="var(--brand-500)" />
                  <text x="50" y="60" fill="white" fontSize="8" fontWeight="bold">Destination</text>

                  <circle cx="240" cy="180" r="4" fill="var(--orange-500)" />
                  <text x="220" y="195" fill="white" fontSize="8" fontWeight="bold">Origin</text>

                  {/* Car Route */}
                  <path 
                    d="M 240 180 Q 180 180 150 140 T 60 70" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="3" 
                  />
                  
                  {/* Active Route Highlight with pulses */}
                  <path 
                    d="M 240 180 Q 180 180 150 140 T 60 70" 
                    fill="none" 
                    stroke={activeMethodDetails.color} 
                    strokeWidth="3" 
                    strokeDasharray={activeMethodDetails.pathDash}
                    className="animated-map-route-path"
                    style={{
                      animationDuration: `${activeMethodDetails.time * 0.15}s`
                    }}
                  />
                </svg>

                <div className="map-hud-overlay">
                  <div className="hud-metric">
                    <Clock size={12} />
                    <span>{activeMethodDetails.time} Mins</span>
                  </div>
                  <div className="hud-metric">
                    <Leaf size={12} />
                    <span>{activeMethodDetails.carbon}kg CO₂</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card map-savings-card">
            {/* Audio narration player */}
            <audio id="narrative-audio-player" style={{ display: "none" }} />
            
            <div className="savings-badge-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="badge badge-eco-success">
                  <TrendingDown size={12} />
                  <span>SAVINGS DETECTED</span>
                </span>
                <span>vs Cab Ride baseline</span>
              </div>
              <button 
                type="button" 
                className="narrative-audio-btn" 
                onClick={handlePlayNarrative}
                style={{ 
                  background: playingNarrative ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)",
                  border: playingNarrative ? "1px solid var(--brand-500)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: playingNarrative ? "var(--brand-500)" : "white",
                  transition: "all 0.2s"
                }}
                title="Narrate route optimization report"
              >
                <Volume2 size={14} className={playingNarrative ? "pulse-audio" : ""} />
              </button>
            </div>

            <div className="savings-metrics-grid">
              <div className="save-box">
                <span className="lbl">Carbon Prevented</span>
                <strong className="val green">-{activeMethodDetails.carbonSaved} kg CO₂</strong>
                <span className="sub">Equals charging phone for {Math.round(activeMethodDetails.carbonSaved * 350)} days</span>
              </div>
              
              <div className="save-box">
                <span className="lbl">Financial Savings</span>
                <strong className="val green">+₹{activeMethodDetails.savings.toFixed(0)}</strong>
                <span className="sub">Tolls, fuel, parking avoided</span>
              </div>
            </div>
            
            <div className="maps-keys-note">
              <Info size={12} />
              <span>Register Google Maps API Key in Settings to load live geographic routing paths.</span>
            </div>

            <div className="outbound-actions-row" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={handleExportPDF} 
                style={{ flex: "1 1 100px", padding: "0.6rem 0.4rem", fontSize: "0.75rem", gap: "0.25rem", whiteSpace: "nowrap" }}
              >
                PDF Report 📄
              </button>
              <button 
                type="button"
                className={`btn ${sheetsSynced ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={handleSyncSheets} 
                disabled={syncingSheets}
                style={{ 
                  flex: "1 1 100px", 
                  padding: "0.6rem 0.4rem", 
                  fontSize: "0.75rem", 
                  gap: "0.25rem",
                  whiteSpace: "nowrap",
                  background: sheetsSynced ? "var(--bg-tertiary)" : "linear-gradient(135deg, var(--brand-500) 0%, var(--brand-600) 100%)"
                }}
              >
                {syncingSheets ? "Syncing..." : sheetsSynced ? "Synced ✓" : "Sync Sheets 📊"}
              </button>
              <button 
                type="button"
                className={`btn ${docsSynced ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={handleSyncDocs} 
                disabled={syncingDocs}
                style={{ 
                  flex: "1 1 100px", 
                  padding: "0.6rem 0.4rem", 
                  fontSize: "0.75rem", 
                  gap: "0.25rem",
                  whiteSpace: "nowrap",
                  background: docsSynced ? "var(--bg-tertiary)" : "linear-gradient(135deg, var(--blue-500) 0%, var(--blue-600) 100%)"
                }}
              >
                {syncingDocs ? "Syncing..." : docsSynced ? "Synced ✓" : "Sync Docs 📝"}
              </button>
              <button 
                type="button"
                className={`btn ${mailSent ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={handleSendEmail} 
                disabled={syncingMail}
                style={{ 
                  flex: "1 1 100px", 
                  padding: "0.6rem 0.4rem", 
                  fontSize: "0.75rem", 
                  gap: "0.25rem",
                  whiteSpace: "nowrap",
                  background: mailSent ? "var(--bg-tertiary)" : "linear-gradient(135deg, var(--orange-500) 0%, var(--orange-600) 100%)"
                }}
              >
                {syncingMail ? "Sending..." : mailSent ? (mailSimulated ? "Simulated ✓" : "Sent ✓") : "Send Email 📧"}
              </button>
              <button 
                type="button"
                className={`btn ${calendarSynced ? 'btn-secondary' : 'btn-primary'}`} 
                onClick={handleSyncCalendar} 
                disabled={syncingCalendar}
                style={{ 
                  flex: "1 1 100px", 
                  padding: "0.6rem 0.4rem", 
                  fontSize: "0.75rem", 
                  gap: "0.25rem",
                  whiteSpace: "nowrap",
                  background: calendarSynced ? "var(--bg-tertiary)" : "linear-gradient(135deg, var(--blue-600) 0%, var(--blue-700) 100%)"
                }}
              >
                {syncingCalendar ? "Scheduling..." : calendarSynced ? "Scheduled ✓" : "Sync Calendar 📅"}
              </button>
            </div>

            {(sheetUrl || docUrl || calendarUrl) && (
              <div className="synced-links-container" style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem", fontWeight: "600", letterSpacing: "0.05em" }}>SYNCED GOOGLE WORKSPACE FILES</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {sheetUrl && (
                    <a href={sheetUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--brand-500)", textDecoration: "none", fontWeight: "500" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--brand-500)" }}></span>
                      Open Google Sheet Log ↗
                    </a>
                  )}
                  {docUrl && (
                    <a href={docUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--blue-500)", textDecoration: "none", fontWeight: "500" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--blue-500)" }}></span>
                      Open Google Doc Report ↗
                    </a>
                  )}
                  {calendarUrl && (
                    <a href={calendarUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--blue-600)", textDecoration: "none", fontWeight: "500" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--blue-600)" }}></span>
                      Open Google Calendar Event ↗
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Google Air Quality API Display */}
          {(originAqi || destinationAqi || fetchingAqi) && (
            <div className="glass-card air-quality-card" style={{ marginTop: "1rem" }}>
              <span className="card-pre" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--brand-500)" }}>
                <Wind size={12} />
                GOOGLE AIR QUALITY PLATFORM
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", margin: "0.25rem 0 0.75rem 0", color: "var(--text-primary)" }}>Ambient Air Metrics</h3>
              
              {fetchingAqi ? (
                <div style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", padding: "1rem 0" }}>Fetching real-time AQI data...</div>
              ) : (
                <div className="aqi-comparison-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  {originAqi && (
                    <div className="aqi-box" style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>Origin AQI</span>
                      <strong style={{ fontSize: "1.5rem", color: `rgb(${originAqi.color?.red * 255 || 16}, ${originAqi.color?.green * 255 || 185}, ${originAqi.color?.blue * 255 || 129})`, display: "block", margin: "0.25rem 0" }}>
                        {originAqi.aqi || "N/A"}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: "500" }}>{originAqi.category}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", display: "block", marginTop: "0.25rem" }}>Dominant: {originAqi.dominantPollutant}</span>
                    </div>
                  )}

                  {destinationAqi && (
                    <div className="aqi-box" style={{ padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>Dest AQI</span>
                      <strong style={{ fontSize: "1.5rem", color: `rgb(${destinationAqi.color?.red * 255 || 16}, ${destinationAqi.color?.green * 255 || 185}, ${destinationAqi.color?.blue * 255 || 129})`, display: "block", margin: "0.25rem 0" }}>
                        {destinationAqi.aqi || "N/A"}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: "500" }}>{destinationAqi.category}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-tertiary)", display: "block", marginTop: "0.25rem" }}>Dominant: {destinationAqi.dominantPollutant}</span>
                    </div>
                  )}

                  {(originAqi?.recommendations || destinationAqi?.recommendations) && (
                    <div className="aqi-recommendations" style={{ gridColumn: "span 2", background: "rgba(16, 185, 129, 0.04)", borderLeft: "3px solid var(--brand-500)", padding: "0.65rem", borderRadius: "4px", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      <strong>Health Advice: </strong>
                      {destinationAqi?.recommendations || originAqi?.recommendations}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* YouTube Transit Guide Hub */}
          {(youtubeVideos.length > 0 || loadingYoutube) && (
            <div className="glass-card youtube-guides-card" style={{ marginTop: "1rem" }}>
              <span className="card-pre" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#ef4444" }}>
                <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "2px", backgroundColor: "#ef4444" }}></span>
                GOOGLE YOUTUBE MEDIA HUB
              </span>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", margin: "0.25rem 0 0.75rem 0", color: "var(--text-primary)" }}>Commute Study & Guides</h3>
              
              {loadingYoutube ? (
                <div style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", padding: "1rem 0" }}>Searching YouTube guides...</div>
              ) : (
                <div className="youtube-videos-list" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {youtubeVideos.map((video) => (
                    <a 
                      key={video.id} 
                      href={`https://www.youtube.com/watch?v=${video.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="yt-video-row"
                      style={{ 
                        display: "flex", 
                        gap: "0.75rem", 
                        textDecoration: "none", 
                        padding: "0.5rem", 
                        background: "rgba(255,255,255,0.02)", 
                        borderRadius: "8px", 
                        border: "1px solid rgba(255,255,255,0.04)",
                        transition: "background 0.2s"
                      }}
                    >
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        style={{ width: "90px", height: "60px", borderRadius: "4px", objectFit: "cover" }} 
                      />
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: "600", lineHeight: "1.2", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: video.title }}></span>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-tertiary)", marginTop: "0.25rem" }}>{video.channelTitle}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .travel-page-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
        }

        .travel-controls-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .router-input-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .routing-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-field-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-tertiary);
        }

        .input-with-icon .input-field {
          padding-left: 2.75rem;
          width: 100%;
        }

        .route-submit-btn {
          width: 100%;
        }

        /* Transit options card styling */
        .transit-options-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .transit-option-card {
          border-left: 4px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem !important;
        }

        .transit-option-card:hover {
          background: var(--bg-tertiary);
        }

        .transit-option-card.active {
          background: var(--card-bg);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .option-primary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .option-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .option-title-wrap h4 {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .option-time-lbl {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .option-metrics-summary {
          display: flex;
          gap: 1.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.5rem;
        }

        .sub-metric {
          display: flex;
          flex-direction: column;
        }

        .sub-metric .lbl {
          font-size: 0.6rem;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .sub-metric .lbl.green {
          color: var(--brand-500);
        }

        .sub-metric .val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .sub-metric .val.green {
          color: var(--brand-500);
        }

        .flex-end-m {
          margin-left: auto;
          text-align: right;
        }

        /* SVG Map Panel right side */
        .travel-map-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .map-display-card {
          height: 340px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
        }

        .vector-map-canvas {
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          flex: 1;
          margin-top: 1rem;
          position: relative;
          overflow: hidden;
        }

        .vector-map-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Animated stroke path */
        @keyframes route-travel {
          to {
            stroke-dashoffset: -40;
          }
        }

        :global(.animated-map-route-path) {
          animation: route-travel 4s linear infinite;
          stroke-dashoffset: 0;
          filter: drop-shadow(0 0 3px var(--brand-glow));
        }

        .map-hud-overlay {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 10;
        }

        .hud-metric {
          background: rgba(12, 18, 15, 0.85);
          border: 1px solid var(--border-color);
          padding: 0.3rem 0.65rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        /* Real Google map iframe support */
        .real-google-map-iframe {
          flex: 1;
          margin-top: 1rem;
          border-radius: 14px;
          overflow: hidden;
        }

        /* Savings card styling */
        .map-savings-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .savings-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        .savings-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .save-box {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }

        .save-box .lbl {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .save-box .val {
          font-size: 1.15rem;
          font-weight: 800;
        }
        .save-box .val.green {
          color: var(--brand-500);
        }

        .save-box .sub {
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }

        .maps-keys-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: var(--text-tertiary);
          background: rgba(255, 255, 255, 0.01);
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .travel-page-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .savings-metrics-grid {
            grid-template-columns: 1fr;
          }
          .option-metrics-summary {
            flex-direction: column;
            gap: 0.5rem;
          }
          .flex-end-m {
            margin-left: 0;
            text-align: left;
          }
        }
      `}</style>

      <style jsx global>{`
        .pac-container {
          background-color: rgba(18, 25, 22, 0.98) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 12px !important;
          font-family: inherit !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          margin-top: 4px !important;
          backdrop-filter: blur(8px) !important;
          z-index: 9999 !important;
        }
        .pac-item {
          border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
          padding: 0.65rem 1rem !important;
          color: var(--text-secondary) !important;
          cursor: pointer !important;
          font-size: 0.85rem !important;
          display: flex !important;
          align-items: center !important;
          gap: 0.5rem !important;
        }
        .pac-item:hover {
          background-color: var(--bg-tertiary) !important;
        }
        .pac-item-query {
          color: var(--text-primary) !important;
          font-size: 0.85rem !important;
        }
        .pac-matched {
          color: var(--brand-500) !important;
        }
        .pac-icon {
          display: none !important;
        }
      `}</style>

      {/* Printable PDF Report Container */}
      <div className="print-only-report">
        <div className="report-header">
          <div className="report-logo">CARBONOS</div>
          <div className="report-title">Travel Trajectory Optimization Report</div>
          <div className="report-date">{new Date().toLocaleDateString()}</div>
        </div>
        
        <div className="report-meta">
          <p><strong>Origin Address:</strong> {origin}</p>
          <p><strong>Destination Address:</strong> {destination}</p>
          <p><strong>Baseline Mode:</strong> Auto/Cab Ride (Baseline)</p>
          <p><strong>Generated By:</strong> CarbonOS Climate Twin Network</p>
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th>Transit Option</th>
              <th>Duration</th>
              <th>Carbon Intensity</th>
              <th>Fare Cost</th>
              <th>Carbon Prevented</th>
              <th>Savings vs Baseline</th>
            </tr>
          </thead>
          <tbody>
            {transitMethods.map((m) => (
              <tr key={m.id} className={activeMethod === m.id ? "highlighted-row" : ""}>
                <td>{m.name} {activeMethod === m.id ? "(Selected)" : ""}</td>
                <td>{m.time} mins</td>
                <td>{m.carbon} kg CO₂</td>
                <td>₹{m.cost}</td>
                <td>{m.carbonSaved} kg</td>
                <td>₹{m.savings}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="report-summary">
          <h4>Ecosystem Impact Summary</h4>
          <p>By choosing <strong>{activeMethodDetails.name}</strong> instead of the cab ride baseline, you reduce emissions by <strong>{activeMethodDetails.carbonSaved} kg CO₂</strong> and save <strong>₹{activeMethodDetails.savings}</strong> on this journey.</p>
        </div>
      </div>

      {/* PDF Route Report Preview Modal */}
      {isPdfModalOpen && (
        <div className="pdf-modal-overlay" onClick={() => setIsPdfModalOpen(false)}>
          <div className="pdf-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <h3>PDF Route Certificate Preview</h3>
              <button className="pdf-modal-close-btn" onClick={() => setIsPdfModalOpen(false)}>×</button>
            </div>
            
            <div className="pdf-modal-body">
              <div className="pdf-preview-certificate">
                <div className="cert-border-outer">
                  <div className="cert-border-inner">
                    <div className="cert-header">
                      <div className="cert-logo">CARBONOS</div>
                      <span className="cert-tag">CLIMATE TWIN NETWORK</span>
                    </div>
                    
                    <h2 className="cert-title">OPTIMIZED TRAJECTORY CERTIFICATE</h2>
                    <p className="cert-sub">This certificate confirms the evaluation of the lowest-carbon transit route calculated for the following journey.</p>
                    
                    <div className="cert-meta-grid">
                      <div className="cert-meta-item">
                        <span className="cert-lbl">ORIGIN</span>
                        <strong className="cert-val">{origin}</strong>
                      </div>
                      <div className="cert-meta-item">
                        <span className="cert-lbl">DESTINATION</span>
                        <strong className="cert-val">{destination}</strong>
                      </div>
                      <div className="cert-meta-item">
                        <span className="cert-lbl">DATE METRIC LOGGED</span>
                        <strong className="cert-val">{new Date().toLocaleDateString("en-IN")}</strong>
                      </div>
                    </div>

                    <div className="cert-divider"></div>

                    <div className="cert-metrics-section">
                      <div className="cert-metric-card">
                        <span className="metric-lbl">ACTIVE Trajectory</span>
                        <strong className="metric-val" style={{ color: activeMethodDetails.color }}>{activeMethodDetails.name}</strong>
                      </div>
                      <div className="cert-metric-card">
                        <span className="metric-lbl">CARBON PREVENTED</span>
                        <strong className="metric-val green">-{activeMethodDetails.carbonSaved} kg CO₂</strong>
                      </div>
                      <div className="cert-metric-card">
                        <span className="metric-lbl">FINANCIAL SAVINGS</span>
                        <strong className="metric-val green">₹{activeMethodDetails.savings.toFixed(0)}</strong>
                      </div>
                      <div className="cert-metric-card">
                        <span className="metric-lbl">DURATION</span>
                        <strong className="metric-val">{activeMethodDetails.time} Mins</strong>
                      </div>
                    </div>

                    <div className="cert-divider"></div>

                    <p className="cert-narrative">
                      By prioritizing <strong>{activeMethodDetails.name}</strong> over the baseline cab ride, you have prevented <strong>{activeMethodDetails.carbonSaved} kg of CO₂</strong> emissions. This reduction is equivalent to powering a smartphone for <strong>{Math.round(activeMethodDetails.carbonSaved * 350)} days</strong>. Thank you for your active ecological stewardship.
                    </p>

                    <div className="cert-footer">
                      <div className="cert-sig">
                        <span className="sig-line"></span>
                        <span className="sig-title">CarbonOS Climate Twin network</span>
                      </div>
                      <div className="cert-id-tag">
                        <span className="tag-lbl">VERIFICATION ID</span>
                        <strong className="tag-val">{Math.random().toString(36).substring(2, 10).toUpperCase()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pdf-modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsPdfModalOpen(false)}>Close Preview</button>
              <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF 📄</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .print-only-report {
          display: none;
        }

        /* PDF Modal Styling */
        .pdf-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1rem;
        }

        .pdf-modal-content {
          width: 100%;
          max-width: 750px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          background: rgba(22, 33, 27, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .pdf-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .pdf-modal-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .pdf-modal-close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .pdf-modal-close-btn:hover {
          color: var(--brand-500);
        }

        .pdf-modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
          background: #0f1612;
        }

        .pdf-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(22, 33, 27, 0.95);
        }

        /* Certificate Design */
        .pdf-preview-certificate {
          background: #ffffff;
          color: #111827;
          padding: 2rem;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .cert-border-outer {
          border: 4px double #10b981;
          padding: 4px;
        }

        .cert-border-inner {
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2rem;
          position: relative;
        }

        .cert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .cert-logo {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #047857;
        }

        .cert-tag {
          font-size: 0.7rem;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.1em;
        }

        .cert-title {
          font-size: 1.6rem;
          font-weight: 800;
          text-align: center;
          color: #111827;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .cert-sub {
          font-size: 0.85rem;
          text-align: center;
          color: #4b5563;
          margin-bottom: 2rem;
        }

        .cert-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .cert-meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .cert-meta-item:last-child {
          grid-column: span 2;
        }

        .cert-lbl {
          font-size: 0.65rem;
          font-weight: 700;
          color: #9ca3af;
          letter-spacing: 0.05em;
        }

        .cert-val {
          font-size: 0.9rem;
          color: #1f2937;
          font-weight: 500;
        }

        .cert-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 1.5rem 0;
        }

        .cert-metrics-section {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .cert-metric-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #f3f4f6;
        }

        .metric-lbl {
          font-size: 0.6rem;
          color: #6b7280;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .metric-val {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
        }

        .metric-val.green {
          color: #059669;
        }

        .cert-narrative {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #374151;
          margin-bottom: 2.5rem;
          text-align: justify;
        }

        .cert-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .cert-sig {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sig-line {
          width: 150px;
          height: 1px;
          background: #6b7280;
        }

        .sig-title {
          font-size: 0.7rem;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
        }

        .cert-id-tag {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.15rem;
        }

        .tag-lbl {
          font-size: 0.65rem;
          color: #9ca3af;
          font-weight: 700;
        }

        .tag-val {
          font-size: 0.85rem;
          font-family: monospace;
          color: #111827;
          font-weight: bold;
        }

        @media (max-width: 600px) {
          .cert-metrics-section {
            grid-template-columns: repeat(2, 1fr);
          }
          .cert-meta-grid {
            grid-template-columns: 1fr;
          }
          .cert-meta-item:last-child {
            grid-column: span 1;
          }
        }
      `}</style>

      <style jsx global>{`
        @media print {
          /* Hide all main layouts, overlays, headers, and actions */
          header, aside, nav, main, footer, 
          .layout-container, .app-header, .sidebar-nav, .bottom-nav, .travel-page-grid,
          .pdf-modal-header, .pdf-modal-actions, .pdf-modal-close-btn,
          .print-only-report {
            display: none !important;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .pdf-modal-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: none !important;
            backdrop-filter: none !important;
            display: block !important;
            padding: 0 !important;
            z-index: 9999 !important;
          }

          .pdf-modal-content {
            border: none !important;
            background: white !important;
            box-shadow: none !important;
            max-width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            display: block !important;
          }

          .pdf-modal-body {
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }

          .pdf-preview-certificate {
            box-shadow: none !important;
            padding: 1.5cm !important;
            width: 100% !important;
            background: white !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </AppLayout>
  );
}
