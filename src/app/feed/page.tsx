"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { UserProfile, defaultProfile, getImpactFeed } from "@/lib/mockAi";
import { 
  Activity, 
  Leaf, 
  MapPin, 
  Utensils, 
  ShoppingBag, 
  Zap, 
  Clock, 
  Plus,
  Send,
  MessageSquare
} from "lucide-react";

interface FeedItem {
  id: string;
  timestamp: string;
  userName: string;
  actionText: string;
  carbonReduced: number;
  equivalenceText: string;
  type: "transport" | "food" | "shopping" | "energy";
}

export default function ImpactFeed() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [newActionText, setNewActionText] = useState("");
  const [newActionType, setNewActionType] = useState<"transport" | "food" | "shopping" | "energy">("transport");

  useEffect(() => {
    const saved = localStorage.getItem("carbonos-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }

    const savedFeed = localStorage.getItem("carbonos-feed");
    if (savedFeed) {
      try {
        setFeed(JSON.parse(savedFeed));
      } catch (e) {
        const presets = getImpactFeed();
        setFeed(presets);
        localStorage.setItem("carbonos-feed", JSON.stringify(presets));
      }
    } else {
      const presets = getImpactFeed();
      setFeed(presets);
      localStorage.setItem("carbonos-feed", JSON.stringify(presets));
    }
  }, []);

  const handlePostAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    let carbonVal = 1.2;
    let equiv = "";

    switch (newActionType) {
      case "transport":
        carbonVal = 2.3;
        equiv = "Driving 6 miles in a gas-powered SUV";
        break;
      case "food":
        carbonVal = 1.8;
        equiv = "Cooking 4 vegetarian home meals";
        break;
      case "energy":
        carbonVal = 0.5;
        equiv = "Running a refrigerator for 12 days";
        break;
      case "shopping":
        carbonVal = 4.2;
        equiv = "Water saved by skipping 1 new cotton shirt";
        break;
    }

    const newItem: FeedItem = {
      id: `user-feed-${Date.now()}`,
      timestamp: "Just now",
      userName: "You",
      actionText: newActionText,
      carbonReduced: carbonVal,
      equivalenceText: equiv,
      type: newActionType
    };

    const nextFeed = [newItem, ...feed];
    setFeed(nextFeed);
    localStorage.setItem("carbonos-feed", JSON.stringify(nextFeed));
    setNewActionText("");

    // Minor profile updates to reinforce gamified score
    const nextScore = Math.min(98, profile.score + 1);
    const updatedProf = { ...profile, score: nextScore };
    setProfile(updatedProf);
    localStorage.setItem("carbonos-profile", JSON.stringify(updatedProf));
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "transport": return <MapPin size={16} />;
      case "food": return <Utensils size={16} />;
      case "shopping": return <ShoppingBag size={16} />;
      case "energy":
      default:
        return <Zap size={16} />;
    }
  };

  return (
    <AppLayout>
      <div className="feed-page-grid">
        {/* Left Side: Feed Feed list */}
        <div className="feed-timeline-stack">
          {/* Post Action card */}
          <div className="glass-card post-card">
            <span className="card-pre">COMMUNITY & PERSONAL DIARY</span>
            <h2>Log an Environmental Save</h2>
            <p>Tell the system what action you took. CarbonOS maps immediate equivalences.</p>

            <form onSubmit={handlePostAction} className="post-form">
              <div className="post-input-row">
                <input 
                  type="text"
                  value={newActionText}
                  onChange={(e) => setNewActionText(e.target.value)}
                  placeholder="Example: I skipped the laundry dryer and line-dried my clothes today..."
                  className="input-field post-input"
                  maxLength={100}
                />
              </div>

              <div className="post-footer-row">
                <div className="post-category-selector">
                  <button 
                    type="button"
                    className={`cat-select-btn ${newActionType === "transport" ? "active" : ""}`}
                    onClick={() => setNewActionType("transport")}
                  >
                    <span>Commute</span>
                  </button>
                  <button 
                    type="button"
                    className={`cat-select-btn ${newActionType === "food" ? "active" : ""}`}
                    onClick={() => setNewActionType("food")}
                  >
                    <span>Food</span>
                  </button>
                  <button 
                    type="button"
                    className={`cat-select-btn ${newActionType === "energy" ? "active" : ""}`}
                    onClick={() => setNewActionType("energy")}
                  >
                    <span>Energy</span>
                  </button>
                  <button 
                    type="button"
                    className={`cat-select-btn ${newActionType === "shopping" ? "active" : ""}`}
                    onClick={() => setNewActionType("shopping")}
                  >
                    <span>Shopping</span>
                  </button>
                </div>

                <button className="btn btn-primary post-submit-btn" type="submit">
                  <Send size={14} /> Log Action
                </button>
              </div>
            </form>
          </div>

          {/* Timeline feeds */}
          <div className="timeline-items">
            {feed.map((item) => (
              <div key={item.id} className="glass-card timeline-card">
                <div className="timeline-card-header">
                  <div className="sender-group">
                    <div className="sender-avatar">
                      {item.userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="sender-details">
                      <strong>{item.userName}</strong>
                      <span className="time-lbl"><Clock size={10} /> {item.timestamp}</span>
                    </div>
                  </div>

                  <div className={`feed-type-badge ${item.type}`}>
                    {getCategoryIcon(item.type)}
                  </div>
                </div>

                <div className="timeline-card-body">
                  <p className="action-desc">
                    {item.userName === "You" ? "You " : ""}
                    {item.actionText}
                  </p>

                  <div className="feed-offset-callout">
                    <div className="offset-metrics">
                      <Leaf size={14} className="leaf-val-icon" />
                      <span>Carbon Reduction: <strong>-{item.carbonReduced}kg CO₂</strong></span>
                    </div>
                    <p className="offset-equiv">
                      Equivalent to: {item.equivalenceText}.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Community Leaderboard and Fun Stats */}
        <div className="feed-stats-panel">
          <div className="glass-card statistics-card">
            <h3>Carbon Intercept Impact</h3>
            <p>Aggregated carbon prevented across your local circle this week:</p>

            <div className="big-stat-display">
              <strong className="val">155.1 kg</strong>
              <span className="lbl">CO₂ PREVENTED</span>
            </div>

            <div className="equivalents-list">
              <div className="equiv-item">
                <span>🚘 Vehicle miles avoided</span>
                <strong>380 miles</strong>
              </div>
              <div className="equiv-item">
                <span>🌲 Trees preserved</span>
                <strong>7 mature trees</strong>
              </div>
              <div className="equiv-item">
                <span>💡 Electricity saved</span>
                <strong>410 kWh</strong>
              </div>
            </div>
          </div>

          <div className="glass-card ranking-card">
            <h3>Eco Leaderboard</h3>
            <div className="rankings-list">
              <div className="rank-item podium">
                <span className="rank-num">1</span>
                <span className="rank-name">You (CarbonOS console)</span>
                <span className="rank-score">62 pts</span>
              </div>
              <div className="rank-item">
                <span className="rank-num">2</span>
                <span className="rank-name">Sarah Jenkins</span>
                <span className="rank-score">58 pts</span>
              </div>
              <div className="rank-item">
                <span className="rank-num">3</span>
                <span className="rank-name">Alex Mercer</span>
                <span className="rank-score">41 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .feed-page-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        .feed-timeline-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Post Action Card */
        .post-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .post-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .post-input {
          width: 100%;
          font-size: 0.95rem;
          padding: 0.85rem 1rem;
        }

        .post-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .post-category-selector {
          display: flex;
          gap: 0.4rem;
        }

        .cat-select-btn {
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .cat-select-btn:hover {
          border-color: var(--brand-400);
          color: var(--text-primary);
        }

        .cat-select-btn.active {
          background: var(--brand-glow);
          border-color: var(--brand-500);
          color: var(--brand-500);
        }

        .post-submit-btn {
          padding: 0.5rem 1.25rem;
          font-size: 0.85rem;
        }

        /* Timeline Card */
        .timeline-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sender-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .sender-avatar {
          width: 32px;
          height: 32px;
          border-radius: 99px;
          background: linear-gradient(135deg, var(--brand-500) 0%, var(--blue-500) 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .sender-details {
          display: flex;
          flex-direction: column;
        }

        .sender-details strong {
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .time-lbl {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .feed-type-badge {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feed-type-badge.transport { background: var(--brand-glow); color: var(--brand-500); }
        .feed-type-badge.food { background: rgba(52, 211, 153, 0.08); color: #34d399; }
        .feed-type-badge.energy { background: var(--blue-glow); color: var(--blue-500); }
        .feed-type-badge.shopping { background: rgba(139, 92, 246, 0.08); color: var(--purple-500); }

        .timeline-card-body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-desc {
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .feed-offset-callout {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .offset-metrics {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        :global(.leaf-val-icon) {
          color: var(--brand-500);
        }

        .offset-metrics strong {
          color: var(--brand-500);
        }

        .offset-equiv {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        /* Right panel feed stats */
        .feed-stats-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .statistics-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .big-stat-display {
          display: flex;
          flex-direction: column;
          margin: 0.5rem 0;
        }

        .big-stat-display .val {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--brand-500);
          font-family: var(--font-display);
        }

        .big-stat-display .lbl {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .equivalents-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        }

        .equiv-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .equiv-item strong {
          color: var(--text-primary);
        }

        /* Leaderboard rank list */
        .ranking-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rankings-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .rank-item {
          display: grid;
          grid-template-columns: 24px 1fr 50px;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          font-size: 0.8rem;
        }

        .rank-item.podium {
          border-color: var(--brand-500);
          background: var(--brand-glow);
        }

        .rank-num {
          font-family: var(--font-mono);
          font-weight: bold;
          color: var(--text-tertiary);
        }

        .rank-item.podium .rank-num {
          color: var(--brand-500);
        }

        .rank-name {
          color: var(--text-primary);
          font-weight: 500;
        }

        .rank-score {
          text-align: right;
          font-weight: bold;
          color: var(--text-secondary);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .feed-page-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}
