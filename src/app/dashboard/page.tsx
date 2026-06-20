"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Zap, 
  TrendingDown, 
  ShieldAlert, 
  MapPin, 
  Camera, 
  Award, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Leaf
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { UserProfile, defaultProfile, generateCoachRecommendations } from "@/lib/mockAi";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("carbonos-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const recommendations = generateCoachRecommendations(profile);

  // SVG Radial Ring calculation helper
  // Circumference = 2 * PI * r
  const getStrokeDash = (percentage: number, radius: number) => {
    const circumference = 2 * Math.PI * radius;
    const strokeLength = (percentage / 100) * circumference;
    return `${strokeLength} ${circumference - strokeLength}`;
  };

  // Find the biggest carbon category
  const getBiggestCarbonProblem = () => {
    const { transportation, food, shopping, energy } = profile.breakdown;
    const maxVal = Math.max(transportation, food, shopping, energy);
    if (maxVal === transportation) return { name: "Transportation & Travel", val: transportation, desc: "Mainly driven by gasoline commuting or flight mileage. Take public transit or offset flights.", color: "var(--brand-500)" };
    if (maxVal === food) return { name: "Food & Deliveries", val: food, desc: "Driven by red meat intake or food delivery packaging. Swap to home cooking or green meats.", color: "#34d399" };
    if (maxVal === energy) return { name: "Household Grid Electricity", val: energy, desc: "Mainly coal/fossil fuel electricity usage. Switch to renewable grid pools.", color: "var(--blue-500)" };
    return { name: "Shopping Goods & Fashion", val: shopping, desc: "Driven by buying new goods. Choose vintage, thrift or buy secondhand.", color: "var(--purple-500)" };
  };

  const biggestProblem = getBiggestCarbonProblem();

  return (
    <AppLayout>
      <div className="dashboard-grid">
        {/* Row 1: Header / Carbon DNA Profile */}
        <div className="glass-card dna-profile-card">
          <div className="card-header-group">
            <span className="card-pre">CLIMATE IDENTITY</span>
            <h2>Your Carbon DNA Profile</h2>
            <p>Select any segment in the radial chart or hover to drill down into localized emissions.</p>
          </div>

          <div className="dna-viz-container">
            {/* SVG Interactive Nested Rings */}
            <div className="dna-svg-wrapper">
              <svg 
                viewBox="0 0 220 220" 
                className="dna-svg"
                role="img" 
                aria-label="Interactive Carbon DNA Radial Chart. Circles from outer to inner represent transportation, food, energy, and shopping footprints."
              >
                <title>Carbon DNA Radial breakdown</title>
                {/* Background Track Rings */}
                <circle cx="110" cy="110" r="90" className="track-ring" />
                <circle cx="110" cy="110" r="70" className="track-ring" />
                <circle cx="110" cy="110" r="50" className="track-ring" />
                <circle cx="110" cy="110" r="30" className="track-ring" />

                {/* Transportation Ring */}
                <circle 
                  cx="110" cy="110" r="90" 
                  className={`progress-ring trans ${activeCategory === "transport" ? "focused" : ""}`}
                  strokeDasharray={getStrokeDash(profile.breakdown.transportation, 90)}
                  strokeDashoffset={2 * Math.PI * 90 * 0.25} // start top
                  onMouseEnter={() => setActiveCategory("transport")}
                  onMouseLeave={() => setActiveCategory(null)}
                  tabIndex={0}
                  aria-label={`Transportation footprint: ${profile.breakdown.transportation}%`}
                  onFocus={() => setActiveCategory("transport")}
                  onBlur={() => setActiveCategory(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveCategory("transport");
                    }
                  }}
                />
                
                {/* Food Ring */}
                <circle 
                  cx="110" cy="110" r="70" 
                  className={`progress-ring food ${activeCategory === "food" ? "focused" : ""}`}
                  strokeDasharray={getStrokeDash(profile.breakdown.food, 70)}
                  strokeDashoffset={2 * Math.PI * 70 * 0.25}
                  onMouseEnter={() => setActiveCategory("food")}
                  onMouseLeave={() => setActiveCategory(null)}
                  tabIndex={0}
                  aria-label={`Food choices footprint: ${profile.breakdown.food}%`}
                  onFocus={() => setActiveCategory("food")}
                  onBlur={() => setActiveCategory(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveCategory("food");
                    }
                  }}
                />

                {/* Energy Ring */}
                <circle 
                  cx="110" cy="110" r="50" 
                  className={`progress-ring energy ${activeCategory === "energy" ? "focused" : ""}`}
                  strokeDasharray={getStrokeDash(profile.breakdown.energy, 50)}
                  strokeDashoffset={2 * Math.PI * 50 * 0.25}
                  onMouseEnter={() => setActiveCategory("energy")}
                  onMouseLeave={() => setActiveCategory(null)}
                  tabIndex={0}
                  aria-label={`Home energy footprint: ${profile.breakdown.energy}%`}
                  onFocus={() => setActiveCategory("energy")}
                  onBlur={() => setActiveCategory(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveCategory("energy");
                    }
                  }}
                />

                {/* Shopping Ring */}
                <circle 
                  cx="110" cy="110" r="30" 
                  className={`progress-ring shop ${activeCategory === "shopping" ? "focused" : ""}`}
                  strokeDasharray={getStrokeDash(profile.breakdown.shopping, 30)}
                  strokeDashoffset={2 * Math.PI * 30 * 0.25}
                  onMouseEnter={() => setActiveCategory("shopping")}
                  onMouseLeave={() => setActiveCategory(null)}
                  tabIndex={0}
                  aria-label={`Shopping goods footprint: ${profile.breakdown.shopping}%`}
                  onFocus={() => setActiveCategory("shopping")}
                  onBlur={() => setActiveCategory(null)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveCategory("shopping");
                    }
                  }}
                />
              </svg>

              {/* Core Score Ring Overlay */}
              <div className="dna-center-score">
                <span className="center-score-num">{profile.score}</span>
                <span className="center-score-lbl">ECO SCORE</span>
              </div>
            </div>

            {/* Interactive Legends Panel */}
            <div className="dna-legends">
              <div 
                className={`legend-item trans-color ${activeCategory === "transport" ? "active" : ""}`}
                onMouseEnter={() => setActiveCategory("transport")}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="legend-indicator trans"></div>
                <div className="legend-details">
                  <span className="legend-name">Transportation</span>
                  <span className="legend-val">{profile.breakdown.transportation}%</span>
                </div>
              </div>
              <div 
                className={`legend-item food-color ${activeCategory === "food" ? "active" : ""}`}
                onMouseEnter={() => setActiveCategory("food")}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="legend-indicator food"></div>
                <div className="legend-details">
                  <span className="legend-name">Food Choices</span>
                  <span className="legend-val">{profile.breakdown.food}%</span>
                </div>
              </div>
              <div 
                className={`legend-item energy-color ${activeCategory === "energy" ? "active" : ""}`}
                onMouseEnter={() => setActiveCategory("energy")}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="legend-indicator energy"></div>
                <div className="legend-details">
                  <span className="legend-name">Home Energy</span>
                  <span className="legend-val">{profile.breakdown.energy}%</span>
                </div>
              </div>
              <div 
                className={`legend-item shop-color ${activeCategory === "shopping" ? "active" : ""}`}
                onMouseEnter={() => setActiveCategory("shopping")}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="legend-indicator shop"></div>
                <div className="legend-details">
                  <span className="legend-name">Shopping Goods</span>
                  <span className="legend-val">{profile.breakdown.shopping}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 1 right: Big Problems & Climate Twin Quick card */}
        <div className="dashboard-vertical-stack">
          {/* Card: Biggest Problem */}
          <div className="glass-card problem-card">
            <div className="alert-badge" style={{ background: `${biggestProblem.color}15`, color: biggestProblem.color }}>
              <ShieldAlert size={16} />
              <span>PRIMARY CLIMATE LEVER</span>
            </div>
            
            <h3>{biggestProblem.name} is your biggest carbon problem</h3>
            <p>{biggestProblem.desc}</p>
            
            <div className="problem-metric">
              <span className="metric-val">{biggestProblem.val}%</span>
              <span className="metric-lbl">of your total profile output</span>
            </div>
          </div>

          {/* Card: Digital Twin Status */}
          <Card 
            className="twin-status-card" 
            interactive 
            onClick={() => router.push("/twin")}
            aria-label="Digital carbon twin status. Click to interact."
          >
            <div className="twin-preview-graphic">
              <div className="pulse-orb" style={{ opacity: profile.score / 100 }}></div>
            </div>
            <div className="twin-status-details">
              <span>DIGITAL CARBON TWIN</span>
              <h3>Your Twin is {profile.score > 70 ? 'Flourishing' : profile.score > 50 ? 'Stable' : 'Highly Polluted'}</h3>
              <p>Current ecosystem status is reflecting your {profile.score} score. Click to interact.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2: Personalized AI Climate Coach Recommendations */}
      <h3 className="section-title"><Zap size={18} className="title-icon" /> AI Climate Coach Recommendations</h3>
      <div className="recommendations-grid">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="recommendation-card">
            <div className="rec-badge-group">
              <span className={`badge ${
                rec.category === "Transportation" ? "badge-eco-info" : 
                rec.category === "Food" ? "badge-eco-warning" : 
                "badge-eco-success"
              }`}>
                {rec.category}
              </span>
              <span className="badge badge-eco-info">Effort: {rec.effort}</span>
            </div>

            <h4>{rec.title}</h4>
            <p>{rec.description}</p>

            <div className="rec-metrics-strip">
              <div className="metric">
                <span className="metric-value">-{rec.carbonSaved}kg</span>
                <span className="metric-label">CO₂ / year</span>
              </div>
              {rec.moneySaved > 0 && (
                <div className="metric">
                  <span className="metric-value">+₹{rec.moneySaved}</span>
                  <span className="metric-label">Savings / yr</span>
                </div>
              )}
              <div className="metric">
                <span className="metric-value">{rec.confidence}%</span>
                <span className="metric-label">Confidence</span>
              </div>
            </div>

            <button className="btn btn-primary rec-cta" onClick={() => router.push(rec.category === "Transportation" ? "/travel" : "/missions")}>
              {rec.actionLabel}
            </button>
          </Card>
        ))}
      </div>

      {/* Row 3: Quick Navigation Shortcuts */}
      <h3 className="section-title">Carbon Operating Subsystems</h3>
      <div className="subsystems-grid">
        <Card 
          className="subsystem-item" 
          interactive 
          onClick={() => router.push("/time-machine")}
          aria-label="Time Machine subsystem: Simulate lifestyle adjustments over futures."
        >
          <Clock size={24} className="sub-icon" />
          <h4>Time Machine</h4>
          <p>Simulate lifestyle adjustments over 1, 5, and 10 year futures.</p>
        </Card>
        <Card 
          className="subsystem-item" 
          interactive 
          onClick={() => router.push("/scanner")}
          aria-label="Carbon Lens subsystem: Scan bills, receipts, or packaging."
        >
          <Camera size={24} className="sub-icon" />
          <h4>Carbon Lens</h4>
          <p>Scan bills, receipts, or packaging to parse carbon scores.</p>
        </Card>
        <Card 
          className="subsystem-item" 
          interactive 
          onClick={() => router.push("/travel")}
          aria-label="Travel Engine subsystem: Compare commuter routes."
        >
          <MapPin size={24} className="sub-icon" />
          <h4>Travel Engine</h4>
          <p>Compare routes using Google Maps API for lowest transport footprint.</p>
        </Card>
        <Card 
          className="subsystem-item" 
          interactive 
          onClick={() => router.push("/coach")}
          aria-label="Climate Coach subsystem: Chat with Gemini AI Coach."
        >
          <MessageSquare size={24} className="sub-icon" />
          <h4>Climate Coach</h4>
          <p>Talk to Gemini directly for customized carbon reasoning advice.</p>
        </Card>
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .dna-profile-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card-header-group {
          display: flex;
          flex-direction: column;
        }

        .card-pre {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--brand-500);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .card-header-group h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
        }

        .card-header-group p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .dna-viz-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: center;
        }

        .dna-svg-wrapper {
          position: relative;
          width: 100%;
          max-width: 180px;
          margin: 0 auto;
        }

        .dna-svg {
          width: 100%;
          height: 100%;
        }

        .track-ring {
          fill: none;
          stroke: var(--bg-tertiary);
          stroke-width: 8;
        }

        .progress-ring {
          fill: none;
          stroke-width: 10;
          stroke-linecap: round;
          transform-origin: 50% 50%;
          transform: rotate(-90deg);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .progress-ring.trans { stroke: var(--brand-500); }
        .progress-ring.food { stroke: #34d399; }
        .progress-ring.energy { stroke: var(--blue-500); }
        .progress-ring.shop { stroke: var(--purple-500); }

        .progress-ring.focused {
          stroke-width: 14;
          filter: drop-shadow(0 0 4px var(--brand-glow));
        }

        .dna-center-score {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .center-score-num {
          font-family: var(--font-display);
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .center-score-lbl {
          font-size: 0.55rem;
          font-weight: 700;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .dna-legends {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .legend-item:hover, .legend-item.active {
          background: var(--bg-tertiary);
          border-color: var(--border-color);
        }

        .legend-indicator {
          width: 12px;
          height: 12px;
          border-radius: 4px;
        }

        .legend-indicator.trans { background: var(--brand-500); }
        .legend-indicator.food { background: #34d399; }
        .legend-indicator.energy { background: var(--blue-500); }
        .legend-indicator.shop { background: var(--purple-500); }

        .legend-details {
          display: flex;
          flex: 1;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .legend-name {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .legend-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .dashboard-vertical-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Biggest Problem Card */
        .problem-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .alert-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          align-self: flex-start;
        }

        .problem-card h3 {
          font-size: 1.15rem;
          color: var(--text-primary);
        }

        .problem-card p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .problem-metric {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        .metric-val {
          font-size: 2rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: var(--text-primary);
        }

        .metric-lbl {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Digital Twin Card */
        .twin-status-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          cursor: pointer;
        }

        .twin-preview-graphic {
          width: 60px;
          height: 60px;
          border-radius: 99px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .pulse-orb {
          width: 24px;
          height: 24px;
          border-radius: 99px;
          background: radial-gradient(circle, var(--brand-300) 0%, var(--brand-600) 100%);
          box-shadow: 0 0 15px var(--brand-500);
          animation: float 4s ease-in-out infinite;
        }

        .twin-status-details {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .twin-status-details span {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .twin-status-details h3 {
          font-size: 1.1rem;
        }

        .twin-status-details p {
          font-size: 0.75rem;
        }

        /* Recommendations Rows */
        .section-title {
          font-size: 1.25rem;
          margin: 2.5rem 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        :global(.title-icon) {
          color: var(--brand-500);
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .recommendation-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          justify-content: space-between;
        }

        .rec-badge-group {
          display: flex;
          gap: 0.5rem;
        }

        .recommendation-card h4 {
          font-size: 1.15rem;
          color: var(--text-primary);
        }

        .recommendation-card p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .rec-metrics-strip {
          display: flex;
          justify-content: space-between;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.75rem;
        }

        .rec-metrics-strip .metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .rec-metrics-strip .metric:not(:last-child) {
          border-right: 1px solid var(--border-color);
        }

        .metric-value {
          font-family: var(--font-mono);
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .metric-label {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }

        .rec-cta {
          width: 100%;
        }

        /* Subsystems Nav Shortcuts */
        .subsystems-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .subsystem-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .subsystem-item:hover {
          transform: translateY(-4px);
        }

        :global(.sub-icon) {
          color: var(--brand-500);
        }

        .subsystem-item h4 {
          font-size: 1rem;
        }

        .subsystem-item p {
          font-size: 0.75rem;
          line-height: 1.3;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .subsystems-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .dna-viz-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .recommendations-grid {
            grid-template-columns: 1fr;
          }
          .subsystems-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}
