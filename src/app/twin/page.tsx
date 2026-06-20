"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { UserProfile, defaultProfile } from "@/lib/mockAi";
import { 
  Sparkles, 
  Wind, 
  Flame, 
  Leaf, 
  Zap, 
  Smile, 
  RefreshCw, 
  Coffee, 
  Trash2,
  TrendingDown
} from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: "leaf" | "smog" | "energy" | "default";
}

export default function DigitalTwin() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [localScore, setLocalScore] = useState(62);
  const [pulseScale, setPulseScale] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("carbonos-profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setProfile(p);
        setLocalScore(p.score);
      } catch (e) {}
    }
  }, []);

  // Update profile in localStorage when score changes locally
  const updateLocalProfileScore = (newScore: number) => {
    const updated = { ...profile, score: newScore };
    setProfile(updated);
    setLocalScore(newScore);
    localStorage.setItem("carbonos-profile", JSON.stringify(updated));
  };

  // Particles animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initial particles population
    particlesRef.current = [];

    const getTwinTheme = (score: number) => {
      if (score > 75) return { color: "#10b981", speed: 0.8, type: "green" as const };
      if (score > 50) return { color: "#3b82f6", speed: 1.2, type: "stable" as const };
      return { color: "#f97316", speed: 2.2, type: "polluted" as const };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const theme = getTwinTheme(localScore);

      // 1. Draw glowing background behind twin core
      const gradientGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 120);
      gradientGlow.addColorStop(0, `${theme.color}25`);
      gradientGlow.addColorStop(1, "transparent");
      ctx.fillStyle = gradientGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw core twin body (morphing orb)
      const time = Date.now() * 0.002 * theme.speed;
      ctx.beginPath();
      
      // Calculate morphing radius
      const numPoints = 8;
      const baseRadius = 50 + Math.sin(Date.now() * 0.001) * 3;
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        // Morphs more aggressively if polluted
        const morphIntensity = localScore < 50 ? 12 : 5;
        const radiusOffset = Math.sin(angle * 3 + time) * morphIntensity;
        const r = baseRadius + radiusOffset;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Core styling
      const coreGradient = ctx.createRadialGradient(
        centerX - 10, centerY - 10, 10,
        centerX, centerY, baseRadius
      );
      if (theme.type === "green") {
        coreGradient.addColorStop(0, "#a7f3d0");
        coreGradient.addColorStop(0.5, "#10b981");
        coreGradient.addColorStop(1, "#064e3b");
      } else if (theme.type === "stable") {
        coreGradient.addColorStop(0, "#93c5fd");
        coreGradient.addColorStop(0.5, "#3b82f6");
        coreGradient.addColorStop(1, "#1e3a8a");
      } else {
        coreGradient.addColorStop(0, "#fed7aa");
        coreGradient.addColorStop(0.5, "#f97316");
        coreGradient.addColorStop(1, "#7c2d12");
      }

      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Core border outline
      ctx.strokeStyle = `${theme.color}aa`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Process & Draw Particles
      // Spawn new particles
      if (particlesRef.current.length < 60) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 40;
        const pType = theme.type === "green" ? "leaf" : theme.type === "polluted" ? "smog" : "default";
        
        particlesRef.current.push({
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * theme.speed * 0.5 + Math.cos(angle + Math.PI/2) * 0.3 * theme.speed,
          vy: (Math.random() - 0.5) * theme.speed * 0.5 + Math.sin(angle + Math.PI/2) * 0.3 * theme.speed,
          size: Math.random() * (pType === "leaf" ? 6 : 4) + 1.5,
          color: theme.color,
          alpha: Math.random() * 0.5 + 0.3,
          life: 0,
          maxLife: 100 + Math.random() * 80,
          type: pType
        });
      }

      particlesRef.current.forEach((p, idx) => {
        p.life++;
        
        // Behavior based on type
        if (p.type === "leaf") {
          // Floating leaf swing
          p.x += p.vx + Math.sin(p.life * 0.05) * 0.2;
          p.y += p.vy - 0.1; // slow lift
        } else if (p.type === "smog") {
          // erratic jittery float
          p.x += p.vx + (Math.random() - 0.5) * 0.6;
          p.y += p.vy - 0.3; // rises like smoke
        } else {
          // simple orbital float
          p.x += p.vx;
          p.y += p.vy;
        }

        p.alpha = 1 - (p.life / p.maxLife);

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        
        if (p.type === "leaf") {
          // Draw leaf shape
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size / 2, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "smog") {
          // fuzzy smoke particles
          const smogGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
          smogGrad.addColorStop(0, "rgba(100, 100, 100, 0.4)");
          smogGrad.addColorStop(1, "transparent");
          ctx.fillStyle = smogGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      // Filter dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [localScore]);

  // Quick actions to "feed" or clean the twin
  const performEcoAction = (actionType: string) => {
    let carbonCredit = 0;
    let desc = "";

    switch (actionType) {
      case "commute":
        carbonCredit = 2;
        desc = "Rode transit instead of cab (-2.3kg CO₂)";
        break;
      case "diet":
        carbonCredit = 3;
        desc = "Opted for plant-based lunch (-1.8kg CO₂)";
        break;
      case "energy":
        carbonCredit = 1;
        desc = "Unplugged 5 standby devices (-0.4kg CO₂)";
        break;
      case "shopping":
        carbonCredit = 2;
        desc = "Declined bag/packaging (-0.8kg CO₂)";
        break;
    }

    const newScore = Math.min(98, localScore + carbonCredit);
    updateLocalProfileScore(newScore);

    // Trigger visual confetti explosion of leaves/particles in canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < 25; i++) {
        const speed = 2 + Math.random() * 4;
        const angle = Math.random() * Math.PI * 2;
        
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 3,
          color: "#34d399",
          alpha: 1.0,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          type: "leaf"
        });
      }
    }
  };

  const getEcosystemHealthStatus = () => {
    if (localScore > 75) return { label: "FLOURISHING", class: "status-green", details: "Oxygen outputs are high, ambient carbon concentration is low. Bio-networks are fully operational." };
    if (localScore > 50) return { label: "BALANCED", class: "status-blue", details: "System loads are stable, but transit reliance is preventing full soil regeneration." };
    return { label: "ATMOSPHERIC STRESS", class: "status-orange", details: "Emissions volume exceeds local sink capacity. Jittery orbits reveal particulate matter accumulation." };
  };

  const healthStatus = getEcosystemHealthStatus();

  return (
    <AppLayout>
      <div className="twin-page-grid">
        {/* Left Side - Visual Twin Canvas */}
        <div className="glass-card twin-viewport-card">
          <div className="twin-card-header">
            <span className="card-pre">CLIMATE TWIN GATEWAY</span>
            <h2>Digital Carbon Twin</h2>
            <div className={`twin-health-badge ${healthStatus.class}`}>
              <Wind size={12} />
              <span>{healthStatus.label}</span>
            </div>
          </div>

          <div className="canvas-wrapper">
            <canvas ref={canvasRef} className="twin-canvas-element" />
            
            {/* Overlay indicators inside canvas */}
            <div className="canvas-score-overlay">
              <span className="overlay-score">{localScore}</span>
              <span className="overlay-label">BIOSPHERE LEVEL</span>
            </div>
          </div>

          <div className="twin-card-footer">
            <p className="health-details-text">{healthStatus.details}</p>
          </div>
        </div>

        {/* Right Side - Actions & Metrics */}
        <div className="twin-control-panel">
          <div className="glass-card metrics-summary-card">
            <h3>Ecosystem Diagnostics</h3>
            <div className="diagnostic-row">
              <span>Soil Regeneration</span>
              <div className="stat-progress-bar"><div className="bar-val" style={{ width: `${localScore}%`, background: "var(--brand-500)" }}></div></div>
              <span>{localScore}%</span>
            </div>
            <div className="diagnostic-row">
              <span>Atmospheric Clearance</span>
              <div className="stat-progress-bar"><div className="bar-val" style={{ width: `${Math.min(100, localScore + 5)}%`, background: "var(--blue-500)" }}></div></div>
              <span>{Math.min(100, localScore + 5)}%</span>
            </div>
            <div className="diagnostic-row">
              <span>Carbon Sinks Capacity</span>
              <div className="stat-progress-bar"><div className="bar-val" style={{ width: `${Math.max(10, localScore - 8)}%`, background: "var(--purple-500)" }}></div></div>
              <span>{Math.max(10, localScore - 8)}%</span>
            </div>
          </div>

          <div className="glass-card actions-card">
            <h3>Feed your Twin</h3>
            <p>Log immediate eco-actions to repair biosphere health and release carbon reduction particles.</p>

            <div className="action-button-list">
              <button className="btn btn-secondary action-item-btn" onClick={() => performEcoAction("commute")}>
                <Wind size={16} className="btn-icon-green" />
                <div className="action-label-desc">
                  <strong>Rode Public Transit Today</strong>
                  <span>Leaves car at home (-2.3kg CO₂)</span>
                </div>
                <div className="action-points">+2 Score</div>
              </button>

              <button className="btn btn-secondary action-item-btn" onClick={() => performEcoAction("diet")}>
                <Leaf size={16} className="btn-icon-green" />
                <div className="action-label-desc">
                  <strong>Plant-Based Meals</strong>
                  <span>Zero red meat ingredients (-1.8kg CO₂)</span>
                </div>
                <div className="action-points">+3 Score</div>
              </button>

              <button className="btn btn-secondary action-item-btn" onClick={() => performEcoAction("energy")}>
                <Zap size={16} className="btn-icon-green" />
                <div className="action-label-desc">
                  <strong>Standby Power Cutoff</strong>
                  <span>Unplugged phantom chargers (-0.4kg CO₂)</span>
                </div>
                <div className="action-points">+1 Score</div>
              </button>

              <button className="btn btn-secondary action-item-btn" onClick={() => performEcoAction("shopping")}>
                <RefreshCw size={16} className="btn-icon-green" />
                <div className="action-label-desc">
                  <strong>Refused Single-use Bag</strong>
                  <span>Brought reusable containers (-0.8kg CO₂)</span>
                </div>
                <div className="action-points">+2 Score</div>
              </button>
            </div>

            <button className="btn btn-ghost reset-btn" onClick={() => updateLocalProfileScore(62)}>
              <RefreshCw size={14} /> Reset Twin Baseline
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .twin-page-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
        }

        .twin-viewport-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
          height: 520px;
        }

        .twin-card-header {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .twin-card-header h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .twin-health-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.65rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          align-self: flex-start;
          margin-top: 0.25rem;
        }

        .twin-health-badge.status-green {
          background: rgba(16, 185, 129, 0.12);
          color: var(--brand-500);
        }
        .twin-health-badge.status-blue {
          background: rgba(59, 130, 246, 0.12);
          color: var(--blue-500);
        }
        .twin-health-badge.status-orange {
          background: rgba(249, 115, 22, 0.12);
          color: var(--orange-500);
        }

        .canvas-wrapper {
          position: relative;
          flex: 1;
          margin: 1.5rem 0;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
        }

        .twin-canvas-element {
          width: 100%;
          height: 100%;
          display: block;
        }

        .canvas-score-overlay {
          position: absolute;
          bottom: 1.25rem;
          left: 1.25rem;
          display: flex;
          flex-direction: column;
          pointer-events: none;
        }

        .overlay-score {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .overlay-label {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .twin-card-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }

        .health-details-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .twin-control-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Metrics list */
        .metrics-summary-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .metrics-summary-card h3 {
          font-size: 1.15rem;
        }

        .diagnostic-row {
          display: grid;
          grid-template-columns: 140px 1fr 40px;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .diagnostic-row span:last-child {
          text-align: right;
          font-weight: bold;
          color: var(--text-primary);
        }

        .stat-progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .stat-progress-bar .bar-val {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s ease;
        }

        /* Actions feed list */
        .actions-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .actions-card h3 {
          font-size: 1.15rem;
        }

        .actions-card p {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        .action-button-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-item-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1rem !important;
          text-align: left;
          background: var(--bg-primary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-item-btn:hover {
          border-color: var(--brand-500) !important;
          background: var(--brand-glow) !important;
        }

        :global(.btn-icon-green) {
          color: var(--brand-500);
          flex-shrink: 0;
        }

        .action-label-desc {
          display: flex;
          flex-direction: column;
          margin-left: 0.75rem;
          flex: 1;
        }

        .action-label-desc strong {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .action-label-desc span {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .action-points {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--brand-500);
          background: var(--brand-glow);
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          font-family: var(--font-mono);
        }

        .reset-btn {
          margin-top: 0.5rem;
          align-self: center;
          font-size: 0.75rem !important;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .twin-page-grid {
            grid-template-columns: 1fr;
          }
          .twin-viewport-card {
            height: 400px;
          }
        }
      `}</style>
    </AppLayout>
  );
}
