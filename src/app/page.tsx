"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Leaf, 
  ArrowRight, 
  Cpu, 
  Eye, 
  Clock, 
  Map, 
  Users, 
  TrendingDown, 
  Sparkles,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Carbon DNA",
      description: "Analyze your habits across transport, diet, home, and energy to compile a multi-dimensional footprint profile.",
      icon: Cpu,
      stats: "4-dimensional core scoring profile",
      color: "var(--brand-500)"
    },
    {
      title: "Digital Carbon Twin",
      description: "A living visual representation of your climate pressure. It heals or decays in real-time as your habits shift.",
      icon: Users,
      stats: "SVG particles morphing interface",
      color: "var(--purple-500)"
    },
    {
      title: "Carbon Time Machine",
      description: "Project your footprint over 1, 5, and 10 years. Drag sliders to simulate lifestyle adjustments and visualize green futures.",
      icon: Clock,
      stats: "Predictive carbon forecast curves",
      color: "var(--blue-500)"
    },
    {
      title: "Carbon Lens Scanner",
      description: "Point your camera or upload electricity bills, grocery receipts, menus, and products to extract instant carbon parameters.",
      icon: Eye,
      stats: "Gemini Vision Multimodal OCR",
      color: "var(--brand-400)"
    },
    {
      title: "Travel Impact Engine",
      description: "Compare paths across metro, walking, train, biking, and cars using Google Maps API. Optimize cost and carbon simultaneously.",
      icon: Map,
      stats: "Real-time travel route calculator",
      color: "var(--orange-500)"
    }
  ];

  // Auto transition features preview
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="landing-viewport">
      {/* Background glow effects */}
      <div className="radial-glow glow-1"></div>
      <div className="radial-glow glow-2"></div>

      {/* Navigation Header */}
      <nav className="landing-nav">
        <div className="logo-group">
          <div className="logo-icon-container">
            <Leaf className="logo-leaf" />
          </div>
          <span className="logo-text">CARBON<span className="logo-accent">OS</span></span>
        </div>
        
        <button className="btn btn-secondary nav-cta" onClick={() => router.push("/dashboard")}>
          Launch Console
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge animate-float">
          <Sparkles size={14} className="badge-spark" />
          <span>The World's First Climate Operating System</span>
        </div>
        
        <h1 className="hero-title">
          See your impact.<br />
          Predict your future.<br />
          <span className="gradient-text">Change your next choice.</span>
        </h1>
        
        <p className="hero-subtitle">
          CarbonOS is an AI-powered Climate Operating System that actively helps you understand, predict, and reduce your carbon footprint through personalized intelligence, simulations, and behavioral nudges.
        </p>

        <div className="cta-group">
          <button className="btn btn-primary cta-btn" onClick={() => router.push("/onboarding")}>
            Initialize Carbon DNA <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary cta-btn" onClick={() => router.push("/dashboard")}>
            Skip to Dashboard
          </button>
        </div>

        {/* Dashboard Preview Mock */}
        <div className="dashboard-preview-container glass-card">
          <div className="preview-header">
            <div className="preview-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="preview-address-bar">carbonos.io/console/dna</div>
          </div>
          
          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="p-nav-item active"><Cpu size={16} /> DNA</div>
              <div className="p-nav-item"><Users size={16} /> Twin</div>
              <div className="p-nav-item"><Clock size={16} /> Forecast</div>
              <div className="p-nav-item"><Eye size={16} /> Scanner</div>
            </div>
            
            <div className="preview-content">
              <div className="preview-grid">
                <div className="preview-stat-card">
                  <span className="card-label">Current Carbon DNA</span>
                  <div className="dna-visual-bars">
                    <div className="dna-bar-item">
                      <span>Transport</span>
                      <div className="bar-track"><div className="bar-fill trans" style={{width: "42%"}}></div></div>
                      <span className="bar-val">42%</span>
                    </div>
                    <div className="dna-bar-item">
                      <span>Food</span>
                      <div className="bar-track"><div className="bar-fill food" style={{width: "28%"}}></div></div>
                      <span className="bar-val">28%</span>
                    </div>
                    <div className="dna-bar-item">
                      <span>Energy</span>
                      <div className="bar-track"><div className="bar-fill energy" style={{width: "18%"}}></div></div>
                      <span className="bar-val">18%</span>
                    </div>
                    <div className="dna-bar-item">
                      <span>Shopping</span>
                      <div className="bar-track"><div className="bar-fill shop" style={{width: "12%"}}></div></div>
                      <span className="bar-val">12%</span>
                    </div>
                  </div>
                </div>

                <div className="preview-stat-card flex-center">
                  <div className="preview-score-circle">
                    <span className="circle-score">62</span>
                    <span className="circle-lbl">Eco Score</span>
                  </div>
                  <div className="preview-recs">
                    <span className="rec-title"><Zap size={14} /> AI Recommendation</span>
                    <span className="rec-text">Avoid one food delivery this week. Saves 3.2kg CO₂.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="features-section">
        <h2 className="section-title">Beyond simple calculators.</h2>
        <p className="section-subtitle">CarbonOS utilizes Gemini AI to continuously monitor, adapt, and intercept decisions before they generate footprint.</p>

        <div className="features-showcase-grid">
          <div className="features-list">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isActive = activeFeature === idx;
              return (
                <div 
                  key={feature.title} 
                  className={`feature-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveFeature(idx)}
                >
                  <div className="feature-icon-wrap" style={{ background: `rgba(${isActive ? '16,185,129,0.15' : '255,255,255,0.02'})` }}>
                    <Icon size={20} style={{ color: isActive ? feature.color : "var(--text-tertiary)" }} />
                  </div>
                  <div className="feature-details">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    {isActive && <span className="feature-meta">{feature.stats}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="feature-preview-display glass-card">
            <div className="interactive-display-inner">
              <span className="preview-tag" style={{ borderLeft: `3px solid ${features[activeFeature].color}` }}>
                Live System Demonstration
              </span>
              <h3 className="display-title">{features[activeFeature].title}</h3>
              <p className="display-desc">{features[activeFeature].description}</p>

              {/* Dynamic Mock Previews based on selected item */}
              {activeFeature === 0 && (
                <div className="dynamic-demo-canvas dna-canvas">
                  <div className="radial-dna-mock">
                    <div className="ring ring-out"><span className="ring-num">42%</span><span className="ring-name">Transport</span></div>
                    <div className="ring ring-mid"><span className="ring-num">28%</span><span className="ring-name">Food</span></div>
                    <div className="ring ring-in"><span className="ring-num">18%</span><span className="ring-name">Energy</span></div>
                  </div>
                </div>
              )}

              {activeFeature === 1 && (
                <div className="dynamic-demo-canvas twin-canvas">
                  <div className="twin-orb-mock animate-pulse-glow">
                    <div className="orb-nucleus"></div>
                    <div className="orb-shell"></div>
                    <div className="orb-particle p1"></div>
                    <div className="orb-particle p2"></div>
                    <div className="orb-particle p3"></div>
                  </div>
                </div>
              )}

              {activeFeature === 2 && (
                <div className="dynamic-demo-canvas machine-canvas">
                  <div className="timeline-mock">
                    <div className="timeline-node active"><span>Now</span><strong className="score-red">12,400kg</strong></div>
                    <div className="timeline-arrow">→</div>
                    <div className="timeline-node"><span>Small Swaps</span><strong className="score-orange">9,100kg</strong></div>
                    <div className="timeline-arrow">→</div>
                    <div className="timeline-node green"><span>Aggressive</span><strong className="score-green">3,200kg</strong></div>
                  </div>
                  <div className="machine-savings-badge">Money saved: +$1,240/yr</div>
                </div>
              )}

              {activeFeature === 3 && (
                <div className="dynamic-demo-canvas scan-canvas">
                  <div className="scan-viewport-mock">
                    <div className="scan-laser-line"></div>
                    <div className="bill-receipt-graphic">
                      <span>POWER BILL</span>
                      <span>Usage: 640 kWh</span>
                      <span>Total: $128.50</span>
                    </div>
                    <div className="scan-results-pop">
                      <TrendingDown size={14} /> Carbon Score: 35/100 (High Coal Mix)
                    </div>
                  </div>
                </div>
              )}

              {activeFeature === 4 && (
                <div className="dynamic-demo-canvas map-canvas">
                  <div className="route-compare-mock">
                    <div className="map-route transit">
                      <span>🚆 Metro</span>
                      <span>18 mins • 0.2kg CO₂ • $2.75</span>
                    </div>
                    <div className="map-route ride">
                      <span>🚗 Cab</span>
                      <span>25 mins • 4.1kg CO₂ • $24.00</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 CarbonOS. Powered by Google Gemini AI & Google Cloud.</p>
      </footer>

      {/* Styles for Landing Page (Vanilla CSS) */}
      <style jsx>{`
        .landing-viewport {
          position: relative;
          background: #050806;
          color: #f2f7f4;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          font-family: var(--font-sans);
          display: flex;
          flex-direction: column;
        }

        .radial-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(140px);
          opacity: 0.15;
          z-index: 1;
          pointer-events: none;
        }

        .glow-1 {
          width: 600px;
          height: 600px;
          top: -200px;
          right: -100px;
          background: radial-gradient(circle, var(--brand-500) 0%, rgba(16,185,129,0) 70%);
        }

        .glow-2 {
          width: 500px;
          height: 500px;
          bottom: -100px;
          left: -100px;
          background: radial-gradient(circle, var(--blue-500) 0%, rgba(59,130,246,0) 70%);
        }

        .landing-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 4rem;
          position: relative;
          z-index: 10;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--brand-400) 0%, var(--brand-600) 100%);
          box-shadow: 0 4px 15px var(--brand-glow);
        }

        :global(.logo-leaf) {
          color: white;
          width: 20px;
          height: 20px;
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.5rem;
          letter-spacing: 0.05em;
          color: white;
        }

        .logo-accent {
          color: var(--brand-400);
        }

        .nav-cta {
          padding: 0.5rem 1.25rem;
          font-size: 0.9rem;
        }

        /* Hero Section Styling */
        .hero-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 5rem 2rem;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
          flex: 1;
        }

        .hero-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: var(--brand-400);
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
        }

        :global(.badge-spark) {
          color: var(--brand-400);
        }

        .hero-title {
          font-size: 4rem;
          line-height: 1.1;
          font-weight: 800;
          margin-bottom: 1.5rem;
          color: white;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--brand-400) 0%, var(--brand-500) 50%, var(--blue-500) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #a3b8ae;
          max-width: 680px;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .cta-group {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 5rem;
        }

        .cta-btn {
          padding: 0.9rem 2rem;
          font-size: 1.05rem;
        }

        /* Console Graphic Mockup */
        .dashboard-preview-container {
          width: 100%;
          max-width: 780px;
          padding: 0;
          background: rgba(12, 18, 15, 0.8);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
        }

        .preview-header {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .preview-dots {
          display: flex;
          gap: 0.4rem;
        }

        .dot {
          width: 9px;
          height: 9px;
          border-radius: 99px;
        }
        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }

        .preview-address-bar {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.25rem 2rem;
          border-radius: 6px;
          font-size: 0.7rem;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .preview-body {
          display: flex;
          height: 260px;
          text-align: left;
        }

        .preview-sidebar {
          width: 130px;
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          padding: 1.25rem 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .p-nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .p-nav-item.active {
          background: rgba(16, 185, 129, 0.08);
          color: var(--brand-400);
          font-weight: 600;
        }

        .preview-content {
          flex: 1;
          padding: 1.5rem;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 1.25rem;
          height: 100%;
        }

        .preview-stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .flex-center {
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
        }

        .card-label {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .dna-visual-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          justify-content: center;
        }

        .dna-bar-item {
          display: grid;
          grid-template-columns: 70px 1fr 30px;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
        }

        .bar-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: 99px;
        }
        .bar-fill.trans { background: var(--brand-500); }
        .bar-fill.food { background: var(--brand-400); }
        .bar-fill.energy { background: var(--blue-500); }
        .bar-fill.shop { background: var(--purple-500); }

        .bar-val {
          text-align: right;
          color: var(--text-secondary);
        }

        .preview-score-circle {
          width: 80px;
          height: 80px;
          border-radius: 99px;
          border: 4px solid var(--brand-500);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px var(--brand-glow);
        }

        .circle-score {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
        }
        .circle-lbl {
          font-size: 0.6rem;
          color: var(--brand-400);
          text-transform: uppercase;
        }

        .preview-recs {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .rec-title {
          font-size: 0.7rem;
          color: var(--brand-400);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.2rem;
        }
        .rec-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Features Section */
        .features-section {
          padding: 6rem 4rem;
          background: #020402;
          position: relative;
          z-index: 10;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          color: white;
        }

        .section-subtitle {
          text-align: center;
          font-size: 1.1rem;
          color: #a3b8ae;
          max-width: 600px;
          margin: 0 auto 4rem auto;
          line-height: 1.5;
        }

        .features-showcase-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1100px;
          margin: 0 auto;
          align-items: center;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .feature-item {
          display: flex;
          gap: 1.25rem;
          padding: 1.25rem;
          border-radius: 16px;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .feature-item.active {
          background: rgba(12, 18, 15, 0.6);
          border-color: rgba(16, 185, 129, 0.15);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .feature-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          align-self: flex-start;
          transition: all var(--transition-fast);
        }

        .feature-details h3 {
          font-size: 1.15rem;
          color: white;
          margin-bottom: 0.4rem;
        }

        .feature-details p {
          font-size: 0.9rem;
          color: #a3b8ae;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .feature-meta {
          font-size: 0.75rem;
          color: var(--brand-400);
          font-weight: 600;
          font-family: var(--font-mono);
          text-transform: uppercase;
        }

        /* Display Panel right side */
        .feature-preview-display {
          height: 380px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
        }

        .interactive-display-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          justify-content: space-between;
        }

        .preview-tag {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          padding-left: 0.5rem;
          margin-bottom: 1rem;
        }

        .display-title {
          font-size: 1.75rem;
          color: white;
          margin-bottom: 0.5rem;
        }

        .display-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .dynamic-demo-canvas {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          position: relative;
          overflow: hidden;
        }

        /* Demo graphics presets */
        .radial-dna-mock {
          display: flex;
          gap: 1rem;
        }
        .ring {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 75px;
          height: 75px;
          border-radius: 99px;
          font-weight: bold;
        }
        .ring-out { border: 4px solid var(--brand-500); background: var(--brand-glow); }
        .ring-mid { border: 4px solid var(--brand-400); background: rgba(52, 211, 153, 0.05); }
        .ring-in { border: 4px solid var(--blue-500); background: var(--blue-glow); }
        
        .ring-num { font-size: 0.95rem; color: white; }
        .ring-name { font-size: 0.55rem; color: var(--text-secondary); text-transform: uppercase; }

        .twin-orb-mock {
          position: relative;
          width: 90px;
          height: 90px;
        }
        .orb-nucleus {
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, var(--brand-300) 0%, var(--brand-600) 100%);
          border-radius: 99px;
          position: absolute;
          top: 25px;
          left: 25px;
          box-shadow: 0 0 20px var(--brand-500);
        }
        .orb-shell {
          width: 80px;
          height: 80px;
          border: 1px dashed var(--brand-400);
          border-radius: 99px;
          position: absolute;
          top: 5px;
          left: 5px;
          animation: float 8s linear infinite;
        }
        .orb-particle {
          width: 6px;
          height: 6px;
          border-radius: 99px;
          position: absolute;
        }
        .orb-particle.p1 { background: var(--brand-300); top: 10px; left: 10px; }
        .orb-particle.p2 { background: var(--blue-500); bottom: 10px; right: 15px; }
        .orb-particle.p3 { background: var(--purple-500); top: 50%; left: 80px; }

        .timeline-mock {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .timeline-node {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 0.75rem;
        }
        .timeline-node.active {
          border-color: var(--red-500);
          background: rgba(239, 68, 68, 0.05);
        }
        .timeline-node.green {
          border-color: var(--brand-500);
          background: var(--brand-glow);
        }
        .timeline-node span {
          font-size: 0.6rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }
        .score-red { color: var(--red-500); }
        .score-orange { color: var(--orange-500); }
        .score-green { color: var(--brand-400); }
        .timeline-arrow {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }
        .machine-savings-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          font-size: 0.65rem;
          font-weight: bold;
          color: var(--brand-400);
          background: var(--brand-glow);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .scan-viewport-mock {
          width: 140px;
          height: 140px;
          border: 2px solid var(--brand-500);
          border-radius: 12px;
          position: relative;
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: 0 0 20px var(--brand-glow);
        }
        .scan-laser-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--brand-400);
          box-shadow: 0 0 8px var(--brand-500);
          animation: scan-laser 2s linear infinite;
        }
        .bill-receipt-graphic {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.5rem;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
          text-align: center;
        }
        .scan-results-pop {
          position: absolute;
          bottom: -10px;
          font-size: 0.6rem;
          background: var(--brand-600);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          white-space: nowrap;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .route-compare-mock {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 90%;
        }
        .map-route {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.7rem;
          display: flex;
          justify-content: space-between;
        }
        .map-route.transit {
          border-color: var(--brand-500);
          background: var(--brand-glow);
        }

        .landing-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 2rem 4rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-tertiary);
          position: relative;
          z-index: 10;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .features-showcase-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .feature-preview-display {
            height: 300px;
          }
        }

        @media (max-width: 768px) {
          .landing-nav {
            padding: 1rem 1.5rem;
          }
          .hero-section {
            padding: 3rem 1rem;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-subtitle {
            font-size: 1rem;
          }
          .cta-group {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }
          .cta-btn {
            width: 100%;
          }
          .features-section {
            padding: 4rem 1.5rem;
          }
          .feature-item {
            padding: 0.75rem;
          }
          .landing-footer {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
