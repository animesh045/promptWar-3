"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { UserProfile, defaultProfile, getWeeklyMissions } from "@/lib/mockAi";
import { 
  Award, 
  Flame, 
  Zap, 
  CheckCircle, 
  Sparkles, 
  Check, 
  Clock, 
  ChevronRight,
  TrendingDown,
  RotateCw
} from "lucide-react";
import confetti from "canvas-confetti";

interface Mission {
  id: string;
  title: string;
  description: string;
  carbonReduction: number;
  streakIncrement: boolean;
  rewardPoints: number;
  completed: boolean;
}

export default function ClimateMissions() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [totalPoints, setTotalPoints] = useState(450);

  useEffect(() => {
    const saved = localStorage.getItem("carbonos-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
    
    // Check if missions are stored in session or generate presets
    const savedMissions = localStorage.getItem("carbonos-missions");
    if (savedMissions) {
      try {
        setMissions(JSON.parse(savedMissions));
      } catch (e) {
        const presets = getWeeklyMissions();
        setMissions(presets);
        localStorage.setItem("carbonos-missions", JSON.stringify(presets));
      }
    } else {
      const presets = getWeeklyMissions();
      setMissions(presets);
      localStorage.setItem("carbonos-missions", JSON.stringify(presets));
    }
  }, []);

  const handleToggleMission = (missionId: string) => {
    const nextMissions = missions.map((m) => {
      if (m.id === missionId) {
        const nextState = !m.completed;
        
        // Trigger high-fidelity confetti particles explosion if completed
        if (nextState) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#34d399", "#3b82f6", "#f59e0b"]
          });

          // Update streak and points
          const updatedProfile = { 
            ...profile, 
            streakDays: m.streakIncrement ? profile.streakDays + 1 : profile.streakDays,
            score: Math.min(98, profile.score + 2)
          };
          setProfile(updatedProfile);
          localStorage.setItem("carbonos-profile", JSON.stringify(updatedProfile));
          setTotalPoints(prev => prev + m.rewardPoints);
        } else {
          // Subtract metrics if deselected
          const updatedProfile = { 
            ...profile, 
            streakDays: m.streakIncrement ? Math.max(1, profile.streakDays - 1) : profile.streakDays,
            score: Math.max(10, profile.score - 2)
          };
          setProfile(updatedProfile);
          localStorage.setItem("carbonos-profile", JSON.stringify(updatedProfile));
          setTotalPoints(prev => Math.max(0, prev - m.rewardPoints));
        }

        return { ...m, completed: nextState };
      }
      return m;
    });

    setMissions(nextMissions);
    localStorage.setItem("carbonos-missions", JSON.stringify(nextMissions));
  };

  const handleResetMissions = () => {
    const presets = getWeeklyMissions();
    setMissions(presets);
    localStorage.setItem("carbonos-missions", JSON.stringify(presets));
    
    // Reset points
    setTotalPoints(450);
    
    // Reset profile streak
    const resetProf = { ...profile, streakDays: 3 };
    setProfile(resetProf);
    localStorage.setItem("carbonos-profile", JSON.stringify(resetProf));
  };

  const completedCount = missions.filter(m => m.completed).length;

  return (
    <AppLayout>
      <div className="missions-page-grid">
        {/* Left Side: Active Missions List */}
        <div className="active-missions-stack">
          <div className="glass-card header-missions-card">
            <span className="card-pre">DUOLINGO × CARBONOS STYLE</span>
            <h2>Weekly Climate Missions</h2>
            <p>Complete challenges to reinforce carbon-reducing habits. Streaks unlock profile rewards.</p>

            <div className="missions-summary-bar">
              <div className="bar-progress-stats">
                <span>Weekly progress</span>
                <strong>{completedCount} of {missions.length} completed</strong>
              </div>
              <div className="bar-track">
                <div 
                  className="bar-fill" 
                  style={{ width: `${missions.length > 0 ? (completedCount / missions.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Missions Checklist */}
          <div className="missions-checklist-stack">
            {missions.map((m) => (
              <div 
                key={m.id}
                className={`glass-card mission-item-card ${m.completed ? "completed" : ""}`}
              >
                <div 
                  className={`checkbox-circle ${m.completed ? "checked" : ""}`}
                  onClick={() => handleToggleMission(m.id)}
                >
                  {m.completed && <Check size={14} />}
                </div>

                <div className="mission-details">
                  <h4>{m.title}</h4>
                  <p>{m.description}</p>
                  
                  <div className="mission-tags-strip">
                    <span className="badge badge-eco-success">
                      <TrendingDown size={10} />
                      <span>-{m.carbonReduction}kg CO₂</span>
                    </span>
                    <span className="badge badge-eco-info">
                      <Zap size={10} />
                      <span>+{m.rewardPoints} XP</span>
                    </span>
                    {m.streakIncrement && (
                      <span className="badge badge-eco-warning">
                        <Flame size={10} />
                        <span>Streak Booster</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Streaks, Stats and Rewards */}
        <div className="missions-reward-panel">
          {/* Card 1: Flame Streak */}
          <div className="glass-card streak-display-card">
            <div className="streak-flame-orb animate-float">
              <Flame size={44} className="streak-giant-flame" />
              <span className="streak-number">{profile.streakDays}</span>
            </div>
            
            <h3>{profile.streakDays} Day Active Streak</h3>
            <p>You have logged carbon offsets for {profile.streakDays} consecutive days. Keep going to reach the 7-day milestone!</p>
          </div>

          {/* Card 2: Rewards Vault */}
          <div className="glass-card rewards-card">
            <h3>Leaderboard & XP Vault</h3>
            
            <div className="points-display-box">
              <Award size={20} className="award-points-icon" />
              <div className="points-details">
                <span className="lbl">TOTAL EARNED XP</span>
                <strong className="val">{totalPoints} XP</strong>
              </div>
            </div>

            <div className="rewards-milestones">
              <div className="milestone-item achieved">
                <div className="m-icon"><Check size={12} /></div>
                <div className="m-info">
                  <strong>Ecosystem Apprentice</strong>
                  <span>Unlocked at 100 XP</span>
                </div>
              </div>
              
              <div className={`milestone-item ${totalPoints >= 500 ? 'achieved' : ''}`}>
                <div className="m-icon">{totalPoints >= 500 ? <Check size={12} /> : <Clock size={12} />}</div>
                <div className="m-info">
                  <strong>Carbon Interceptor Elite</strong>
                  <span>Unlocks at 500 XP</span>
                </div>
              </div>

              <div className={`milestone-item ${totalPoints >= 1000 ? 'achieved' : ''}`}>
                <div className="m-icon">{totalPoints >= 1000 ? <Check size={12} /> : <Clock size={12} />}</div>
                <div className="m-info">
                  <strong>Atmosphere Guardian</strong>
                  <span>Unlocks at 1,000 XP</span>
                </div>
              </div>
            </div>

            <button className="btn btn-ghost reset-missions-btn" onClick={handleResetMissions}>
              <RotateCw size={12} /> Reset Weekly Cycle
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .missions-page-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
        }

        .active-missions-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .header-missions-card {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .missions-summary-bar {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .bar-progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .bar-track {
          height: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--brand-500);
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        /* Missions Checklist */
        .missions-checklist-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mission-item-card {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          transition: all var(--transition-fast);
        }

        .mission-item-card.completed {
          background: rgba(16, 185, 129, 0.03);
          border-color: rgba(16, 185, 129, 0.25);
        }

        .checkbox-circle {
          width: 24px;
          height: 24px;
          border-radius: 99px;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.2);
          transition: all var(--transition-fast);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .checkbox-circle:hover {
          border-color: var(--brand-500);
          background: var(--brand-glow);
        }

        .checkbox-circle.checked {
          background: var(--brand-500);
          border-color: var(--brand-500);
          color: white;
        }

        .mission-details {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .mission-item-card.completed h4 {
          text-decoration: line-through;
          color: var(--text-tertiary);
        }

        .mission-details h4 {
          font-size: 1.05rem;
          color: white;
        }

        .mission-details p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .mission-tags-strip {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.25rem;
        }

        /* Rewards panel right side */
        .missions-reward-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Streak Display */
        .streak-display-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }

        .streak-flame-orb {
          width: 90px;
          height: 90px;
          border-radius: 99px;
          background: var(--orange-glow);
          border: 1px solid rgba(249,115,22,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        :global(.streak-giant-flame) {
          color: var(--orange-500);
          fill: var(--orange-500);
        }

        .streak-number {
          position: absolute;
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          bottom: 22px;
        }

        /* XP Rewards Vault */
        .rewards-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .points-display-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.85rem;
          border-radius: 12px;
        }

        :global(.award-points-icon) {
          color: var(--brand-500);
        }

        .points-details {
          display: flex;
          flex-direction: column;
        }

        .points-details .lbl {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .points-details .val {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .rewards-milestones {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .milestone-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 8px;
          opacity: 0.5;
        }

        .milestone-item.achieved {
          opacity: 1.0;
          background: rgba(16, 185, 129, 0.02);
        }

        .milestone-item .m-icon {
          width: 20px;
          height: 20px;
          border-radius: 99px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .milestone-item.achieved .m-icon {
          background: var(--brand-500);
          border-color: var(--brand-500);
          color: white;
        }

        .m-info {
          display: flex;
          flex-direction: column;
        }

        .m-info strong {
          font-size: 0.8rem;
          color: var(--text-primary);
        }

        .m-info span {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .reset-missions-btn {
          margin-top: 0.5rem;
          align-self: center;
          font-size: 0.75rem !important;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .missions-page-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}
