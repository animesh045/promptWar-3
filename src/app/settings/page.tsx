"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { UserProfile, defaultProfile } from "@/lib/mockAi";
import { 
  Settings as SettingsIcon, 
  Key, 
  User, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  Info,
  Sliders,
  Trash2
} from "lucide-react";

export default function Settings() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [geminiKey, setGeminiKey] = useState("");
  const [mapsKey, setMapsKey] = useState("");
  const [showGemini, setShowGemini] = useState(false);
  const [showMaps, setShowMaps] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("carbonos-profile");
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }

    // Load API Keys if they exist in localStorage
    const savedGemini = localStorage.getItem("carbonos-gemini-key") || "";
    const savedMaps = localStorage.getItem("carbonos-maps-key") || "";
    setGeminiKey(savedGemini);
    setMapsKey(savedMaps);
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save API keys to local storage
    localStorage.setItem("carbonos-gemini-key", geminiKey);
    localStorage.setItem("carbonos-maps-key", mapsKey);

    // Save profile updates
    const updated = { 
      ...profile, 
      name: profile.name,
      // Store API keys in profile parameters if needed by Travel Engine
      mapsApiKey: mapsKey 
    };
    setProfile(updated);
    localStorage.setItem("carbonos-profile", JSON.stringify(updated));

    setSavedStatus("Console parameters saved successfully!");
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const handleResetProfile = () => {
    if (confirm("Are you sure you want to delete your Carbon DNA baseline? This will wipe your simulated history and route you back to onboarding.")) {
      localStorage.removeItem("carbonos-profile");
      localStorage.removeItem("carbonos-missions");
      localStorage.removeItem("carbonos-feed");
      localStorage.removeItem("carbonos-theme");
      localStorage.removeItem("carbonos-gemini-key");
      localStorage.removeItem("carbonos-maps-key");
      router.push("/onboarding");
    }
  };

  return (
    <AppLayout>
      <div className="settings-container-grid">
        <div className="glass-card settings-card">
          <div className="settings-header">
            <SettingsIcon size={24} className="settings-icon-header" />
            <div>
              <h2>System Settings</h2>
              <p>Configure credentials, toggle themes, and manage local storage databases.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="settings-form">
            {/* Section 1: User Details */}
            <div className="settings-section">
              <div className="section-title-row">
                <User size={16} />
                <h3>User Profile</h3>
              </div>
              <div className="input-group">
                <label htmlFor="identity-name-input" className="input-label">Identity Name</label>
                <input 
                  id="identity-name-input"
                  type="text" 
                  value={profile.name} 
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter name"
                />
              </div>
            </div>

            <div className="divider"></div>

            {/* Section 2: API Credentials */}
            <div className="settings-section">
              <div className="section-title-row">
                <Key size={16} />
                <h3>Google Cloud & AI Keys</h3>
              </div>
              <p className="section-help-text">
                Input your credentials to enable real-world processing. If keys are omitted, CarbonOS executes in simulated mock mode automatically.
              </p>

              <div className="input-group">
                <div className="key-input-label-row">
                  <label htmlFor="gemini-key-input" className="input-label">Gemini API Key</label>
                  <button 
                    type="button" 
                    className="visibility-toggle-btn"
                    onClick={() => setShowGemini(!showGemini)}
                    aria-label={showGemini ? "Hide Gemini API key" : "Show Gemini API key"}
                  >
                    {showGemini ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input 
                  id="gemini-key-input"
                  type={showGemini ? "text" : "password"} 
                  value={geminiKey} 
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="input-field key-input"
                  placeholder="AIzaSy..."
                />
              </div>

              <div className="input-group">
                <div className="key-input-label-row">
                  <label htmlFor="maps-key-input" className="input-label">Google Maps Javascript API Key</label>
                  <button 
                    type="button" 
                    className="visibility-toggle-btn"
                    onClick={() => setShowMaps(!showMaps)}
                    aria-label={showMaps ? "Hide Google Maps API key" : "Show Google Maps API key"}
                  >
                    {showMaps ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input 
                  id="maps-key-input"
                  type={showMaps ? "text" : "password"} 
                  value={mapsKey} 
                  onChange={(e) => setMapsKey(e.target.value)}
                  className="input-field key-input"
                  placeholder="AIzaSy..."
                />
              </div>
            </div>

            <div className="divider"></div>

            {/* Section 3: Reset Actions */}
            <div className="settings-section">
              <div className="section-title-row">
                <Sliders size={16} />
                <h3>Console Reset</h3>
              </div>
              <p className="section-help-text">
                Wipes all localized databases (Carbon DNA, mission completions, feed history) and boots back to step-1 onboarding.
              </p>
              
              <button 
                type="button" 
                className="btn btn-secondary reset-danger-btn" 
                onClick={handleResetProfile}
              >
                <Trash2 size={16} /> Reset Carbon DNA Baseline
              </button>
            </div>

            <div className="divider"></div>

            {/* Save Buttons */}
            <div className="form-submit-row">
              {savedStatus && (
                <div className="saved-badge">
                  <Check size={14} />
                  <span>{savedStatus}</span>
                </div>
              )}
              <button className="btn btn-primary save-btn" type="submit">
                <Save size={16} /> Save Parameters
              </button>
            </div>

          </form>
        </div>

        {/* Sidebar Info Panel */}
        <div className="glass-card info-panel-card">
          <h3>Ecosystem Details</h3>
          <p>CarbonOS operates locally on client browsers. API calls to Gemini and Google Maps occur directly from your browser when keys are configured, securing your credential keys.</p>
          
          <div className="info-badge-strip">
            <span className="badge badge-eco-success">Core: React / Next.js</span>
            <span className="badge badge-eco-info">AI: Gemini 2.5</span>
            <span className="badge badge-eco-warning">Theme: Variable CSS</span>
          </div>

          <div className="gcp-cloudrun-note">
            <Info size={14} className="note-icon" />
            <div>
              <strong>Cloud Run Readiness</strong>
              <p>This CarbonOS build is configured with a multi-stage production Dockerfile located at the workspace root, ready for instant Google Cloud Run container deploys.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-container-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        .settings-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        :global(.settings-icon-header) {
          color: var(--brand-500);
        }

        .settings-header h2 {
          font-size: 1.5rem;
        }

        .settings-header p {
          font-size: 0.85rem;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--brand-500);
        }

        .section-title-row h3 {
          font-size: 1.05rem;
          color: white;
        }

        .section-help-text {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          line-height: 1.4;
        }

        .key-input-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .visibility-toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        
        .visibility-toggle-btn:hover {
          color: var(--brand-500);
        }

        .key-input {
          font-family: var(--font-mono);
        }

        .reset-danger-btn {
          align-self: flex-start;
          border-color: var(--red-500) !important;
          color: var(--red-500) !important;
        }
        .reset-danger-btn:hover {
          background: rgba(239, 68, 68, 0.08) !important;
        }

        .divider {
          height: 1px;
          background: var(--border-color);
        }

        .form-submit-row {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 1rem;
        }

        .saved-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--brand-500);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .save-btn {
          padding: 0.75rem 1.5rem;
        }

        /* Sidebar info panel styling */
        .info-panel-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          height: fit-content;
        }

        .info-panel-card p {
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .info-badge-strip {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .gcp-cloudrun-note {
          display: flex;
          gap: 0.75rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 0.85rem;
          border-radius: 12px;
          margin-top: 0.5rem;
        }

        :global(.note-icon) {
          color: var(--brand-500);
          flex-shrink: 0;
          margin-top: 0.15rem;
        }

        .gcp-cloudrun-note strong {
          font-size: 0.85rem;
          color: white;
        }

        .gcp-cloudrun-note p {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: 0.15rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .settings-container-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}
