"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { UserProfile, defaultProfile } from "@/lib/mockAi";
import Card from "@/components/ui/Card";
import { 
  Clock, 
  TrendingDown, 
  DollarSign, 
  Flame, 
  Leaf, 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  Trees,
  CloudLightning
} from "lucide-react";

type Strategy = "current" | "small" | "aggressive";

export default function TimeMachine() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [strategy, setStrategy] = useState<Strategy>("current");
  const [projectionYears, setProjectionYears] = useState<number>(5);

  useEffect(() => {
    const saved = localStorage.getItem("carbonos-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Emissions calculations based on strategy and profile
  const getEmissionsFactor = () => {
    switch (strategy) {
      case "aggressive": return 0.25; // 75% reduction
      case "small": return 0.65; // 35% reduction
      case "current":
      default:
        return 1.0;
    }
  };

  // 1 year baseline output in kg CO2. Average US is ~15,000kg. Let's base it on score.
  const baselineYearlyEmissions = Math.max(2000, (100 - profile.score) * 280); 
  const currentEmissionsTotal = Math.round(baselineYearlyEmissions * projectionYears);
  const projectedEmissionsTotal = Math.round(baselineYearlyEmissions * getEmissionsFactor() * projectionYears);
  
  const carbonSaved = currentEmissionsTotal - projectedEmissionsTotal;
  const moneySaved = Math.round(carbonSaved * 12); // ₹12 saved per kg carbon reduced (fuel/elec savings in India)
  const treesSaved = Math.round(carbonSaved / 22); // average mature tree absorbs 22kg CO2/year

  const strategyDetails = {
    current: {
      title: "Current Lifestyle",
      desc: "Proceeding with current commute distances, meat intake, grid mix, and purchase rates.",
      rating: "Status Quo",
      outcome: "High emissions, continuous soil degradation, and default utility rates.",
      color: "var(--orange-500)",
      sceneryClass: "scenery-barren"
    },
    small: {
      title: "Small Swaps",
      desc: "Introducing Meatless Mondays, reducing deliveries, choosing public transport twice a week, and turning down heating offset points.",
      rating: "Substantial Gain",
      outcome: "35% emissions reduction. Noticeable drops in monthly fuel and electrical invoices.",
      color: "var(--blue-500)",
      sceneryClass: "scenery-stable"
    },
    aggressive: {
      title: "Aggressive Action",
      desc: "Switching to 100% green utility contracts, adopting vegetarian/vegan diet, choosing active transit or EVs, and sourcing secondhand goods.",
      rating: "Net Zero Path",
      outcome: "75% footprint decrease. Extreme financial savings, clean local grid footprints, and maximum carbon sink contributions.",
      color: "var(--brand-500)",
      sceneryClass: "scenery-lush"
    }
  };

  const activeStrategy = strategyDetails[strategy];

  return (
    <AppLayout>
      <div className="timemachine-grid">
        {/* Left Side: Controller and Simulation Scenery */}
        <div className="simulation-stack">
          {/* Card: Controller */}
          <Card className="controller-card">
            <span className="card-pre">PREDICTIVE WORKBENCH</span>
            <h2>Carbon Time Machine</h2>
            <p>Drag sliders and toggle strategy configurations to project your climate impact.</p>

            <div className="strategy-selector-row">
              <button 
                className={`strategy-btn current ${strategy === "current" ? "active" : ""}`}
                onClick={() => setStrategy("current")}
                aria-pressed={strategy === "current"}
              >
                <span>Current</span>
              </button>
              <button 
                className={`strategy-btn small ${strategy === "small" ? "active" : ""}`}
                onClick={() => setStrategy("small")}
                aria-pressed={strategy === "small"}
              >
                <span>Small Swaps</span>
              </button>
              <button 
                className={`strategy-btn aggressive ${strategy === "aggressive" ? "active" : ""}`}
                onClick={() => setStrategy("aggressive")}
                aria-pressed={strategy === "aggressive"}
              >
                <span>Aggressive</span>
              </button>
            </div>

            <div className="input-group range-control">
              <div className="range-label-row">
                <label htmlFor="sim-window-slider" className="input-label">Simulation Window</label>
                <span className="range-val-lbl">{projectionYears} Years</span>
              </div>
              <input 
                id="sim-window-slider"
                type="range" 
                min="1" 
                max="15" 
                value={projectionYears} 
                onChange={(e) => setProjectionYears(Number(e.target.value))}
                className="slider-input"
                aria-valuemin={1}
                aria-valuemax={15}
                aria-valuenow={projectionYears}
              />
              <div className="timeline-ticks">
                <span>1 Year</span>
                <span>5 Years</span>
                <span>10 Years</span>
                <span>15 Years</span>
              </div>
            </div>
          </Card>

          {/* Interactive Environment Scenery Screen */}
          <div className={`glass-card scenery-viewport ${activeStrategy.sceneryClass}`}>
            <div className="scenery-sky">
              <div className="scenery-clouds"></div>
              <div className="scenery-sun-moon"></div>
            </div>
            
            <div className="scenery-mountains"></div>
            
            <div className="scenery-foreground">
              {/* Render dynamic elements based on strategy */}
              {strategy === "current" && (
                <div className="scenery-element barren-ground animate-float">
                  <CloudLightning className="barren-icon" />
                  <span>Ambient Smog Load</span>
                </div>
              )}
              {strategy === "small" && (
                <div className="scenery-element stable-ground">
                  <Trees className="stable-icon" />
                  <span>Suburban Greenways</span>
                </div>
              )}
              {strategy === "aggressive" && (
                <div className="scenery-element lush-ground">
                  <div className="windmill-graphic animate-float">⚙️</div>
                  <div className="windmill-graphic w2">⚙️</div>
                  <Trees className="lush-icon" />
                  <span>Renewable Grid Enabled</span>
                </div>
              )}
            </div>

            <div className="scenery-hud">
              <span className="hud-lbl">SCENARIO VISUALIZATION</span>
              <span className="hud-val" style={{ color: activeStrategy.color }}>{activeStrategy.title}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Projections & Metrics */}
        <div className="projections-panel">
          <div className="glass-card projection-summary-card">
            <h3>Simulation Metrics</h3>
            <p>Projected cumulative returns over {projectionYears} years:</p>

            <div className="simulation-stats-stack">
              <div className="sim-stat-box">
                <div className="sim-stat-icon red"><Flame size={20} /></div>
                <div className="sim-stat-details">
                  <span className="lbl">PROJECTED EMISSIONS</span>
                  <strong className="val">{(projectedEmissionsTotal / 1000).toFixed(1)} tons CO₂</strong>
                  <span className="sub">Baseline: {(currentEmissionsTotal / 1000).toFixed(1)} tons</span>
                </div>
              </div>

              <div className="sim-stat-box">
                <div className="sim-stat-icon green"><Leaf size={20} /></div>
                <div className="sim-stat-details">
                  <span className="lbl">CARBON PREVENTED</span>
                  <strong className="val">{(carbonSaved / 1000).toFixed(1)} tons CO₂</strong>
                  <span className="sub">Reduction of {Math.round((1 - getEmissionsFactor()) * 100)}%</span>
                </div>
              </div>

              <div className="sim-stat-box">
                <div className="sim-stat-icon blue"><DollarSign size={20} /></div>
                <div className="sim-stat-details">
                  <span className="lbl">CUMULATIVE SAVINGS</span>
                  <strong className="val">₹{moneySaved.toLocaleString()} INR</strong>
                  <span className="sub">Fuel & utility cuts</span>
                </div>
              </div>

              <div className="sim-stat-box">
                <div className="sim-stat-icon purple"><Trees size={20} /></div>
                <div className="sim-stat-details">
                  <span className="lbl">FOREST CONSERVATION EQUIV.</span>
                  <strong className="val">{treesSaved.toLocaleString()} seedlings</strong>
                  <span className="sub">growing for 10 years</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card strategy-description-card">
            <span className="lbl-small">DECISION PATHWAYS ANALYSIS</span>
            <h4>{activeStrategy.title} ({activeStrategy.rating})</h4>
            <p className="strategy-desc">{activeStrategy.desc}</p>
            <div className="divider"></div>
            <h5>Expected Bio-Impact:</h5>
            <p className="outcome-text">{activeStrategy.outcome}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .timemachine-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
        }

        .simulation-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .controller-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .strategy-selector-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin: 0.5rem 0;
        }

        .strategy-btn {
          padding: 0.75rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .strategy-btn.current.active {
          border-color: var(--orange-500);
          background: var(--orange-glow);
          color: var(--orange-500);
        }

        .strategy-btn.small.active {
          border-color: var(--blue-500);
          background: var(--blue-glow);
          color: var(--blue-500);
        }

        .strategy-btn.aggressive.active {
          border-color: var(--brand-500);
          background: var(--brand-glow);
          color: var(--brand-500);
        }

        .range-control {
          margin-top: 0.5rem;
        }

        .range-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .range-val-lbl {
          font-weight: 700;
          color: var(--brand-500);
          font-family: var(--font-mono);
        }

        .slider-input {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.08);
          outline: none;
        }

        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 99px;
          background: var(--brand-500);
          cursor: pointer;
        }

        .timeline-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-tertiary);
          margin-top: 0.4rem;
        }

        /* Scenery Visualizer Viewport */
        .scenery-viewport {
          height: 250px;
          position: relative;
          overflow: hidden;
          transition: all var(--transition-slow);
          border: 1px solid var(--border-color);
        }

        .scenery-hud {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          flex-direction: column;
          pointer-events: none;
          z-index: 10;
        }

        .hud-lbl {
          font-size: 0.6rem;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
        }

        .hud-val {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 800;
        }

        /* Interactive scenic environments */
        .scenery-barren {
          background: linear-gradient(180deg, #1e110a 0%, #0d0703 100%);
          border-color: rgba(249, 115, 22, 0.2);
        }
        .scenery-stable {
          background: linear-gradient(180deg, #0e1e24 0%, #060e11 100%);
          border-color: rgba(59, 130, 246, 0.2);
        }
        .scenery-lush {
          background: linear-gradient(180deg, #091e13 0%, #030a06 100%);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .scenery-foreground {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 1.5rem;
          z-index: 5;
        }

        .scenery-element {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .barren-ground {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--red-500);
        }
        :global(.barren-icon) {
          color: var(--red-500);
        }

        .stable-ground {
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: var(--blue-500);
        }
        :global(.stable-icon) {
          color: var(--blue-500);
        }

        .lush-ground {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--brand-500);
          position: relative;
        }
        :global(.lush-icon) {
          color: var(--brand-500);
        }

        .windmill-graphic {
          font-size: 1.5rem;
          position: absolute;
          bottom: 40px;
          left: -40px;
          animation: float 5s linear infinite;
        }
        .windmill-graphic.w2 {
          left: auto;
          right: -40px;
          bottom: 25px;
          animation-duration: 3.5s;
        }

        /* Projections details */
        .projections-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .projection-summary-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .simulation-stats-stack {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .sim-stat-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.85rem;
        }

        .sim-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .sim-stat-icon.red { background: rgba(239, 68, 68, 0.12); color: var(--red-500); }
        .sim-stat-icon.green { background: rgba(16, 185, 129, 0.12); color: var(--brand-500); }
        .sim-stat-icon.blue { background: rgba(59, 130, 246, 0.12); color: var(--blue-500); }
        .sim-stat-icon.purple { background: rgba(139, 92, 246, 0.12); color: var(--purple-500); }

        .sim-stat-details {
          display: flex;
          flex-direction: column;
        }

        .sim-stat-details .lbl {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .sim-stat-details .val {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .sim-stat-details .sub {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        /* Strategy analysis details */
        .strategy-description-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .lbl-small {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .strategy-description-card h4 {
          font-size: 1.15rem;
        }

        .strategy-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.5rem 0;
        }

        .strategy-description-card h5 {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .outcome-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .timemachine-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}
