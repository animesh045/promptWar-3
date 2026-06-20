"use client";

import React, { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { UserProfile, defaultProfile, Recommendation } from "@/lib/mockAi";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Sparkles, 
  TrendingDown, 
  DollarSign, 
  Check, 
  Zap,
  Info,
  Mic
} from "lucide-react";

interface Message {
  role: "user" | "coach";
  content: string;
  recommendations?: Recommendation[];
}

export default function ClimateCoach() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // English (India) works great for local accents

    recognition.onstart = () => {
      setRecognizing(true);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInputVal(speechToText);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setRecognizing(false);
    };

    recognition.onend = () => {
      setRecognizing(false);
    };

    recognition.start();
  };

  // Sync profile & load initial coach greeting
  useEffect(() => {
    const saved = localStorage.getItem("carbonos-profile");
    let currentProfile = defaultProfile;
    if (saved) {
      try {
        currentProfile = JSON.parse(saved);
        setProfile(currentProfile);
      } catch (e) {}
    }

    // Set initial custom greeting based on profile category
    const { transportation, food, energy } = currentProfile.breakdown;
    const maxVal = Math.max(transportation, food, energy);
    let focusMsg = "";
    if (maxVal === transportation) {
      focusMsg = `I notice that **Transportation** makes up **${transportation}%** of your footprint (driven by daily travel patterns). Small adjustments here (like replacing 2 commutes with transit) will cut down emissions faster than editing home utilities.`;
    } else if (maxVal === food) {
      focusMsg = `Your **Food choices** represent **${food}%** of your footprint. Did you know that food deliveries generate 3x the carbon weight of home cooking due to packaging and shipping? Reducing takeout twice per week saves more carbon than swapping to eco lightbulbs!`;
    } else {
      focusMsg = `Your **Home Energy usage** makes up **${energy}%** of your emissions. Switching your electricity pool to a 100% Wind or Solar tariff is one of the easiest 'zero-effort' actions you can take.`;
    }

    setMessages([
      {
        role: "coach",
        content: `Hello **${currentProfile.name}**! I am your CarbonOS AI Climate Coach. I have analyzed your Carbon DNA profile. 

${focusMsg}

Ask me anything about lifestyle optimization, cost savings, or commuting paths. What would you like to tackle today?`
      }
    ]);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || inputVal;
    if (!messageText.trim()) return;

    if (!textToSend) setInputVal("");
    setLoading(true);

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);

    try {
      const apiKey = localStorage.getItem("carbonos-gemini-key") || "";
      
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-gemini-key": apiKey
        },
        body: JSON.stringify({
          message: messageText,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          profile
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "coach",
        content: data.text,
        recommendations: data.recommendedActions
      }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: "coach",
        content: "I encountered a minor atmospheric sync error. Please check your connection or retry in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRecommendation = (rec: Recommendation) => {
    // Add to completed missions or save as active mission in profile
    const saved = localStorage.getItem("carbonos-profile");
    if (saved) {
      try {
        const p: UserProfile = JSON.parse(saved);
        if (!p.missionsCompleted.includes(rec.id)) {
          // Temporarily simulate accepting a mission
          alert(`"${rec.title}" added to your Active Climate Missions!`);
        }
      } catch (e) {}
    }
  };

  const quickPrompts = [
    { label: "Analyze my food delivery footprint", query: "Can you analyze how food delivery impacts my food emissions?" },
    { label: "Transit switch recommendations", query: "Give me public transport recommendations for my gas commute." },
    { label: "Green energy provider switch", query: "How do I switch utility grids to a renewable green pool?" },
    { label: "Fast fashion environmental costs", query: "What is the carbon cost of fast fashion shopping?" }
  ];

  return (
    <AppLayout>
      <div className="coach-page-grid">
        {/* Left Side: Notion-like chat console */}
        <div className="glass-card chat-viewport-card">
          <div className="chat-card-header">
            <div className="coach-avatar-badge">
              <Bot size={18} className="bot-head-icon" />
              <span>GEMINI CLIMATE COACH</span>
            </div>
            <span className="api-badge">Gemini 2.5 Active</span>
          </div>

          {/* Messages Area */}
          <div className="chat-messages-container">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-bubble-wrapper ${m.role}`}>
                <div className="message-sender-avatar">
                  {m.role === "coach" ? <Bot size={16} /> : <UserIcon size={16} />}
                </div>

                <div className="message-content-wrapper">
                  <div className="message-text-bubble">
                    {/* Render basic markdown bold replacements */}
                    {m.content.split("\n").map((para, pIdx) => {
                      // Basic bold styling parser **text**
                      const parsedText = para.split("**").map((chunk, cIdx) => {
                        return cIdx % 2 === 1 ? <strong key={cIdx}>{chunk}</strong> : chunk;
                      });
                      return <p key={pIdx} className="chat-para">{parsedText}</p>;
                    })}
                  </div>

                  {/* If recommendations present inside bubble */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="chat-embedded-recommendations">
                      {m.recommendations.map((rec) => (
                        <div key={rec.id} className="glass-card embedded-rec-card">
                          <div className="card-top-tag">
                            <span className="badge badge-eco-info">{rec.category}</span>
                            <span className="val-saved">-{rec.carbonSaved}kg CO₂/yr</span>
                          </div>
                          <h5>{rec.title}</h5>
                          <p>{rec.description}</p>
                          <div className="card-metrics-strip">
                            <span>Money: <strong>+₹{rec.moneySaved}/yr</strong></span>
                            <span>Confidence: <strong>{rec.confidence}%</strong></span>
                          </div>
                          <button className="btn btn-primary add-mission-btn" onClick={() => handleAcceptRecommendation(rec)}>
                            <Zap size={12} /> Add to Active Missions
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-bubble-wrapper coach">
                <div className="message-sender-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content-wrapper">
                  <div className="message-text-bubble shimmer-bg chat-loading-bubble">
                    <span>Coach is reasoning...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Form */}
          <div className="chat-input-bar">
            <input 
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask your climate coach a question..."
              className="input-field chat-input-element"
              disabled={loading}
              aria-label="Ask your climate coach a question"
            />
            <button 
              className={`btn btn-secondary mic-btn ${recognizing ? "recording" : ""}`} 
              onClick={startSpeechRecognition} 
              disabled={loading}
              title="Voice query (powered by Google Speech)"
              aria-label="Voice query (powered by Google Speech)"
              style={{
                width: "44px",
                height: "44px",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: recognizing ? "rgba(239, 68, 68, 0.15)" : "var(--bg-primary)",
                borderColor: recognizing ? "var(--red-500)" : "var(--border-color)",
                color: recognizing ? "var(--red-500)" : "var(--text-secondary)"
              }}
            >
              <Mic size={16} className={recognizing ? "animate-pulse" : ""} />
            </button>
            <button className="btn btn-primary chat-send-btn" onClick={() => handleSend()} disabled={loading} aria-label="Send message">
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Right Side: Quick Action Prompts & Coach Stats */}
        <div className="coach-utility-stack">
          {/* Quick Prompts */}
          <div className="glass-card prompts-card">
            <h3>Suggested Dialogues</h3>
            <p>Select a quick-prompt to launch deep analytics on your DNA indicators.</p>

            <div className="prompt-buttons-list">
              {quickPrompts.map((p, idx) => (
                <button 
                  key={idx}
                  className="btn btn-secondary prompt-item-btn"
                  onClick={() => handleSend(p.query)}
                  disabled={loading}
                >
                  <Sparkles size={12} className="btn-icon-green" />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coach stats summary */}
          <div className="glass-card coach-stats-card">
            <h3>Coach Intelligence Context</h3>
            <div className="context-list">
              <div className="context-item">
                <span>Model Base</span>
                <strong>Gemini 2.5 Flash</strong>
              </div>
              <div className="context-item">
                <span>Temperature</span>
                <strong>0.7 (Balanced Swaps)</strong>
              </div>
              <div className="context-item">
                <span>System Tone</span>
                <strong>Encouraging / Gamified</strong>
              </div>
            </div>
            
            <div className="coach-info-notice">
              <Info size={12} />
              <span>You can configure a custom Gemini API Key in the Settings page to bypass rate limits.</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .coach-page-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 2rem;
        }

        .chat-viewport-card {
          height: 520px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
        }

        .chat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .coach-avatar-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-family: var(--font-display);
        }

        :global(.bot-head-icon) {
          color: var(--brand-500);
        }

        .api-badge {
          font-size: 0.7rem;
          background: var(--brand-glow);
          color: var(--brand-500);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-weight: 600;
        }

        /* Message Bubbles layout */
        .chat-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .message-bubble-wrapper {
          display: flex;
          gap: 0.75rem;
          max-width: 85%;
        }

        .message-bubble-wrapper.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-sender-avatar {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-bubble-wrapper.coach .message-sender-avatar {
          background: var(--brand-glow);
          color: var(--brand-500);
        }

        .message-bubble-wrapper.user .message-sender-avatar {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .message-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .message-text-bubble {
          padding: 0.75rem 1rem;
          border-radius: 14px;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .message-bubble-wrapper.coach .message-text-bubble {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          border-top-left-radius: 0;
        }

        .message-bubble-wrapper.user .message-text-bubble {
          background: linear-gradient(135deg, var(--brand-500) 0%, var(--brand-600) 100%);
          color: white;
          border-top-right-radius: 0;
        }

        :global(.chat-para) {
          margin-bottom: 0.4rem;
          font-size: 0.85rem !important;
          color: inherit !important;
        }

        .chat-loading-bubble {
          display: flex;
          align-items: center;
          color: var(--text-tertiary) !important;
        }

        /* Embedded Recommendations */
        .chat-embedded-recommendations {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .embedded-rec-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.85rem !important;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card-top-tag {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .val-saved {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--brand-500);
          font-family: var(--font-mono);
        }

        .embedded-rec-card h5 {
          font-size: 0.9rem;
          color: white;
        }

        .embedded-rec-card p {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .card-metrics-strip {
          display: flex;
          gap: 1.5rem;
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .add-mission-btn {
          width: 100%;
          font-size: 0.75rem !important;
          padding: 0.4rem !important;
        }

        /* Input Form */
        .chat-input-bar {
          display: flex;
          gap: 0.75rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
        }

        .chat-input-element {
          flex: 1;
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          padding: 0;
          flex-shrink: 0;
        }

        /* Utilities right stack */
        .coach-utility-stack {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .prompts-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prompts-card h3 {
          font-size: 1.15rem;
        }

        .prompts-card p {
          font-size: 0.8rem;
          color: var(--text-tertiary);
        }

        .prompt-buttons-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .prompt-item-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-align: left;
          padding: 0.65rem 0.85rem !important;
          font-size: 0.75rem !important;
          background: var(--bg-primary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 10px;
        }

        .prompt-item-btn:hover {
          border-color: var(--brand-500) !important;
          background: var(--brand-glow) !important;
        }

        /* Stats Context */
        .coach-stats-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .coach-stats-card h3 {
          font-size: 1.15rem;
        }

        .context-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .context-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .context-item strong {
          color: var(--text-primary);
        }

        .coach-info-notice {
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
          .coach-page-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}
