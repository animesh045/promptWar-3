"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Car, 
  Leaf, 
  Utensils, 
  ShoppingBag, 
  Home, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Check, 
  Sparkles,
  Bike
} from "lucide-react";
import { calculateCarbonDNA } from "@/lib/mockAi";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    transportation: "petrol_car",
    commuteMiles: 15, // in km
    foodHabit: "vegetarian",
    shoppingHabits: "moderate",
    flightFrequency: "occasional",
    energyBill: 2000, // in INR
    energySource: "coal_grid",
    householdSize: 4
  });

  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      alert("Please enter your name to personalize your Climate Coach.");
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSelectOption = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    setCalculating(true);
    
    // Simulate complex AI reasoning delay
    setTimeout(() => {
      const generatedProfile = calculateCarbonDNA(formData);
      setResults(generatedProfile);
      setCalculating(false);
      setStep(6); // Go to results display step
    }, 2000);
  };

  const handleFinishOnboarding = () => {
    if (results) {
      localStorage.setItem("carbonos-profile", JSON.stringify(results));
      router.push("/dashboard");
    }
  };

  return (
    <div className="onboard-viewport">
      <div className="onboard-radial-glow"></div>
      
      <div className="onboard-container">
        {/* Progress bar */}
        {step < 6 && (
          <div className="progress-bar-container">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${(step / 5) * 100}%` }}></div>
            </div>
            <div className="progress-step-text">Step {step} of 5</div>
          </div>
        )}

        <div className="glass-card onboard-card">
          {/* Step 1: User Profile */}
          {step === 1 && (
            <div className="step-content">
              <div className="step-icon"><User size={24} /></div>
              <h2>Build your Climate Identity</h2>
              <p>CarbonOS starts by creating a personalized model of your carbon output based on your daily choices.</p>
              
              <div className="input-group">
                <label htmlFor="name-input" className="input-label">What should your Climate Coach call you?</label>
                <input 
                  id="name-input"
                  type="text" 
                  name="name"
                  placeholder="Enter your name" 
                  className="input-field name-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={24}
                />
              </div>

              <div className="step-footer">
                <div></div>
                <button className="btn btn-primary" onClick={nextStep}>
                  Get Started <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Transportation */}
          {step === 2 && (
            <div className="step-content">
              <div className="step-icon"><Car size={24} /></div>
              <h2>How do you commute?</h2>
              <p>Transport forms a significant portion of Indian urban emissions. Select your primary commute method.</p>

              <div className="options-grid">
                <div 
                  className={`opt-card ${formData.transportation === "petrol_car" ? "active" : ""}`}
                  onClick={() => handleSelectOption("transportation", "petrol_car")}
                >
                  <div className="opt-indicator">{formData.transportation === "petrol_car" && <Check size={12} />}</div>
                  <h3>Petrol/Diesel Car</h3>
                  <span>Hatchback, Sedan or SUV</span>
                </div>
                <div 
                  className={`opt-card ${formData.transportation === "electric_car" ? "active" : ""}`}
                  onClick={() => handleSelectOption("transportation", "electric_car")}
                >
                  <div className="opt-indicator">{formData.transportation === "electric_car" && <Check size={12} />}</div>
                  <h3>Electric Car</h3>
                  <span>Battery EV (Nexon, ZS EV)</span>
                </div>
                <div 
                  className={`opt-card ${formData.transportation === "two_wheeler" ? "active" : ""}`}
                  onClick={() => handleSelectOption("transportation", "two_wheeler")}
                >
                  <div className="opt-indicator">{formData.transportation === "two_wheeler" && <Check size={12} />}</div>
                  <h3>Petrol Bike</h3>
                  <span>Motorcycle or scooter</span>
                </div>
                <div 
                  className={`opt-card ${formData.transportation === "ola_scooter" ? "active" : ""}`}
                  onClick={() => handleSelectOption("transportation", "ola_scooter")}
                >
                  <div className="opt-indicator">{formData.transportation === "ola_scooter" && <Check size={12} />}</div>
                  <h3>Electric Scooter</h3>
                  <span>Ola, Ather or TVS iQube</span>
                </div>
                <div 
                  className={`opt-card ${formData.transportation === "metro_train" ? "active" : ""}`}
                  onClick={() => handleSelectOption("transportation", "metro_train")}
                >
                  <div className="opt-indicator">{formData.transportation === "metro_train" && <Check size={12} />}</div>
                  <h3>Metro / Train</h3>
                  <span>Mumbai Local or City Metro</span>
                </div>
                <div 
                  className={`opt-card ${formData.transportation === "auto_rickshaw" ? "active" : ""}`}
                  onClick={() => handleSelectOption("transportation", "auto_rickshaw")}
                >
                  <div className="opt-indicator">{formData.transportation === "auto_rickshaw" && <Check size={12} />}</div>
                  <h3>Auto-Rickshaw</h3>
                  <span>CNG Auto commutes</span>
                </div>
              </div>

              <div className="input-group slide-in">
                <span className="input-label">Daily commute distance: {formData.commuteMiles} km</span>
                <input 
                  type="range" 
                  name="commuteMiles"
                  min="2" 
                  max="120" 
                  value={formData.commuteMiles}
                  onChange={handleInputChange}
                  className="slider-input"
                />
              </div>

              <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Next Section <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Diet */}
          {step === 3 && (
            <div className="step-content">
              <div className="step-icon"><Utensils size={24} /></div>
              <h2>What are your eating habits?</h2>
              <p>Methane output from agricultural food lines is a major contributor to warming trends in India.</p>

              <div className="options-grid">
                <div 
                  className={`opt-card ${formData.foodHabit === "nonveg_heavy" ? "active" : ""}`}
                  onClick={() => handleSelectOption("foodHabit", "nonveg_heavy")}
                >
                  <div className="opt-indicator">{formData.foodHabit === "nonveg_heavy" && <Check size={12} />}</div>
                  <h3>Non-Veg Heavy</h3>
                  <span>Mutton, beef or pork regularly</span>
                </div>
                <div 
                  className={`opt-card ${formData.foodHabit === "nonveg_light" ? "active" : ""}`}
                  onClick={() => handleSelectOption("foodHabit", "nonveg_light")}
                >
                  <div className="opt-indicator">{formData.foodHabit === "nonveg_light" && <Check size={12} />}</div>
                  <h3>Non-Veg Light</h3>
                  <span>Chicken or eggs only</span>
                </div>
                <div 
                  className={`opt-card ${formData.foodHabit === "vegetarian" ? "active" : ""}`}
                  onClick={() => handleSelectOption("foodHabit", "vegetarian")}
                >
                  <div className="opt-indicator">{formData.foodHabit === "vegetarian" && <Check size={12} />}</div>
                  <h3>Vegetarian</h3>
                  <span>Dal, roti, paneer and dairy</span>
                </div>
                <div 
                  className={`opt-card ${formData.foodHabit === "vegan" ? "active" : ""}`}
                  onClick={() => handleSelectOption("foodHabit", "vegan")}
                >
                  <div className="opt-indicator">{formData.foodHabit === "vegan" && <Check size={12} />}</div>
                  <h3>Vegan</h3>
                  <span>Strictly plant-based meals</span>
                </div>
              </div>

              <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Next Section <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Shopping & Flights */}
          {step === 4 && (
            <div className="step-content">
              <div className="step-icon"><ShoppingBag size={24} /></div>
              <h2>Goods & Flight Travel</h2>
              <p>Flight takeoffs represent heavy single-day carbon releases. Shopping frequency controls production supply chains.</p>

              <div className="input-group">
                <span className="input-label">Flight Travel Frequency (Domestic/Intl)</span>
                <div className="options-grid horizontal">
                  <div 
                    className={`opt-card small ${formData.flightFrequency === "never" ? "active" : ""}`}
                    onClick={() => handleSelectOption("flightFrequency", "never")}
                  >
                    <h3>Rarely</h3>
                  </div>
                  <div 
                    className={`opt-card small ${formData.flightFrequency === "occasional" ? "active" : ""}`}
                    onClick={() => handleSelectOption("flightFrequency", "occasional")}
                  >
                    <h3>Occasional</h3>
                  </div>
                  <div 
                    className={`opt-card small ${formData.flightFrequency === "frequent" ? "active" : ""}`}
                    onClick={() => handleSelectOption("flightFrequency", "frequent")}
                  >
                    <h3>Frequent</h3>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">Shopping behavior (goods, fashion)</span>
                <div className="options-grid horizontal">
                  <div 
                    className={`opt-card small ${formData.shoppingHabits === "secondhand_minimal" ? "active" : ""}`}
                    onClick={() => handleSelectOption("shoppingHabits", "secondhand_minimal")}
                  >
                    <h3>Khadi/Eco</h3>
                  </div>
                  <div 
                    className={`opt-card small ${formData.shoppingHabits === "moderate" ? "active" : ""}`}
                    onClick={() => handleSelectOption("shoppingHabits", "moderate")}
                  >
                    <h3>Moderate New</h3>
                  </div>
                  <div 
                    className={`opt-card small ${formData.shoppingHabits === "frequent_new" ? "active" : ""}`}
                    onClick={() => handleSelectOption("shoppingHabits", "frequent_new")}
                  >
                    <h3>Frequent New</h3>
                  </div>
                </div>
              </div>

              <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  Next Section <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Energy & Household size */}
          {step === 5 && (
            <div className="step-content">
              <div className="step-icon"><Home size={24} /></div>
              <h2>Household Energy</h2>
              <p>Indian electricity grids are heavily carbon-intensive due to thermal coal reliance. Your bill directly reflects grid pressure.</p>

              <div className="grid-2-col">
                <div className="input-group">
                  <label htmlFor="energy-bill-input" className="input-label">Monthly Energy Bill (₹)</label>
                  <input 
                    id="energy-bill-input"
                    type="number" 
                    name="energyBill"
                    min="200" 
                    max="45000" 
                    value={formData.energyBill}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="household-size-input" className="input-label">Household size (people)</label>
                  <input 
                    id="household-size-input"
                    type="number" 
                    name="householdSize"
                    min="1" 
                    max="15" 
                    value={formData.householdSize}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="input-group">
                <span className="input-label">Primary Electricity Source</span>
                <div className="options-grid horizontal">
                  <div 
                    className={`opt-card small ${formData.energySource === "coal_grid" ? "active" : ""}`}
                    onClick={() => handleSelectOption("energySource", "coal_grid")}
                  >
                    <h3>Default Coal Grid</h3>
                  </div>
                  <div 
                    className={`opt-card small ${formData.energySource === "mixed_grid" ? "active" : ""}`}
                    onClick={() => handleSelectOption("energySource", "mixed_grid")}
                  >
                    <h3>Mixed Green Pool</h3>
                  </div>
                  <div 
                    className={`opt-card small ${formData.energySource === "solar_roof" ? "active" : ""}`}
                    onClick={() => handleSelectOption("energySource", "solar_roof")}
                  >
                    <h3>Rooftop Solar</h3>
                  </div>
                </div>
              </div>

              <div className="step-footer">
                <button className="btn btn-secondary" onClick={prevStep}>
                  <ArrowLeft size={16} /> Back
                </button>
                
                <button 
                  className="btn btn-primary btn-submit-onboarding" 
                  onClick={handleSubmit}
                  disabled={calculating}
                >
                  {calculating ? "Modeling Footprint..." : "Generate DNA"}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Calculations & DNA Profile Reveal */}
          {step === 6 && results && (
            <div className="step-content reveal-step animate-float">
              <div className="reveal-badge">
                <Sparkles size={16} className="spark-reveal" />
                <span>CARBON DNA PROFILE CREATED</span>
              </div>
              
              <h2>Welcome to CarbonOS, {results.name}!</h2>
              <p>Our algorithms have established your Indian baseline. Your Digital Carbon Twin is ready for activation.</p>

              <div className="results-container">
                <div className="score-reveal-block">
                  <div className="reveal-score-circle">
                    <span className="score-val">{results.score}</span>
                    <span className="score-lbl">Carbon Score</span>
                  </div>
                  <span className="score-desc">
                    {results.score > 75 
                      ? "Excellent! Your footprint is far below urban average." 
                      : results.score > 50 
                        ? "Moderate output. Actionable swaps ahead." 
                        : "High emissions profile. Time to optimize."}
                  </span>
                </div>

                <div className="dna-percentages-block">
                  <h3>Baseline Footprint Drivers</h3>
                  
                  <div className="percentage-list">
                    <div className="perc-item">
                      <span>🚗 Transportation</span>
                      <div className="perc-bar-track"><div className="perc-bar-fill trans" style={{ width: `${results.breakdown.transportation}%` }}></div></div>
                      <span className="perc-num">{results.breakdown.transportation}%</span>
                    </div>
                    <div className="perc-item">
                      <span>🍔 Food & Deliveries</span>
                      <div className="perc-bar-track"><div className="perc-bar-fill food" style={{ width: `${results.breakdown.food}%` }}></div></div>
                      <span className="perc-num">{results.breakdown.food}%</span>
                    </div>
                    <div className="perc-item">
                      <span>🛍️ Shopping goods</span>
                      <div className="perc-bar-track"><div className="perc-bar-fill shop" style={{ width: `${results.breakdown.shopping}%` }}></div></div>
                      <span className="perc-num">{results.breakdown.shopping}%</span>
                    </div>
                    <div className="perc-item">
                      <span>⚡ Grid Electricity</span>
                      <div className="perc-bar-track"><div className="perc-bar-fill energy" style={{ width: `${results.breakdown.energy}%` }}></div></div>
                      <span className="perc-num">{results.breakdown.energy}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="reveal-footer">
                <button className="btn btn-primary finish-btn" onClick={handleFinishOnboarding}>
                  Boot Climate OS <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .onboard-viewport {
          position: relative;
          background: #060907;
          color: #f2f7f4;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          font-family: var(--font-sans);
          overflow: hidden;
        }

        .onboard-radial-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%);
          filter: blur(100px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .onboard-container {
          width: 100%;
          max-width: 580px;
          z-index: 10;
        }

        .progress-bar-container {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-bar-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--brand-500);
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        .progress-step-text {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-align: right;
          font-family: var(--font-mono);
        }

        .onboard-card {
          padding: 3rem;
          border-radius: 24px;
          background: rgba(12, 18, 15, 0.85);
          border-color: rgba(16, 185, 129, 0.12);
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .step-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: var(--brand-glow);
          color: var(--brand-500);
        }

        .step-content h2 {
          font-size: 1.85rem;
          color: white;
        }

        .step-content p {
          color: #a3b8ae;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .name-input {
          font-size: 1.1rem;
          padding: 1rem 1.25rem;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .options-grid.horizontal {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .opt-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .opt-card:hover {
          background: rgba(16, 185, 129, 0.04);
          border-color: var(--brand-400);
        }

        .opt-card.active {
          background: var(--brand-glow);
          border-color: var(--brand-500);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
        }

        .opt-card.small {
          padding: 0.75rem;
          text-align: center;
        }

        .opt-card.small h3 {
          font-size: 0.85rem;
        }

        .opt-indicator {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 18px;
          height: 18px;
          border-radius: 99px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
        }

        .opt-card.active .opt-indicator {
          background: var(--brand-500);
          border-color: var(--brand-500);
          color: white;
        }

        .opt-card h3 {
          font-size: 1.05rem;
          color: white;
          margin-bottom: 0.25rem;
        }

        .opt-card span {
          font-size: 0.75rem;
          color: var(--text-tertiary);
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
          box-shadow: 0 0 10px var(--brand-glow);
        }

        .grid-2-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .step-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 1.5rem;
        }

        /* Results reveal screen */
        .reveal-step {
          align-items: center;
          text-align: center;
        }

        .reveal-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--brand-glow);
          border: 1px solid var(--border-color);
          color: var(--brand-400);
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        :global(.spark-reveal) {
          color: var(--brand-400);
        }

        .results-container {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: 2rem;
          width: 100%;
          text-align: left;
          margin-top: 1rem;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          padding: 1.5rem;
        }

        .score-reveal-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          padding-right: 1.5rem;
          text-align: center;
        }

        .reveal-score-circle {
          width: 110px;
          height: 110px;
          border-radius: 99px;
          border: 6px solid var(--brand-500);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 25px var(--brand-glow);
          margin-bottom: 1rem;
        }

        .score-val {
          font-size: 2.25rem;
          font-weight: 800;
          color: white;
          font-family: var(--font-display);
        }

        .score-desc {
          font-size: 0.8rem;
          color: #a3b8ae;
          font-weight: 500;
        }

        .dna-percentages-block h3 {
          font-size: 1rem;
          color: white;
          margin-bottom: 1rem;
        }

        .percentage-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .perc-item {
          display: grid;
          grid-template-columns: 130px 1fr 40px;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .perc-bar-track {
          height: 5px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 99px;
        }

        .perc-bar-fill {
          height: 100%;
          border-radius: 99px;
        }
        .perc-bar-fill.trans { background: var(--brand-500); }
        .perc-bar-fill.food { background: var(--brand-400); }
        .perc-bar-fill.shop { background: var(--purple-500); }
        .perc-bar-fill.energy { background: var(--blue-500); }

        .perc-num {
          text-align: right;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .reveal-footer {
          width: 100%;
          margin-top: 1rem;
        }

        .finish-btn {
          width: 100%;
          padding: 0.9rem;
          font-size: 1.1rem;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .onboard-card {
            padding: 1.5rem;
          }
          .options-grid {
            grid-template-columns: 1fr;
          }
          .options-grid.horizontal {
            grid-template-columns: 1fr;
          }
          .results-container {
            grid-template-columns: 1fr;
          }
          .score-reveal-block {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-right: 0;
            padding-bottom: 1.5rem;
          }
          .grid-2-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
