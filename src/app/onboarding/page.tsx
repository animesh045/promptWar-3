"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Sparkles, ArrowRight } from "lucide-react";
import { calculateCarbonDNA } from "@/lib/mockAi";

const transportOptions = [
  { value: "petrol_car", label: "🚗 Petrol / Diesel Car" },
  { value: "electric_car", label: "⚡ Electric Car" },
  { value: "two_wheeler", label: "🏍️ Petrol Bike / Scooter" },
  { value: "ola_scooter", label: "🛵 Electric Scooter" },
  { value: "metro_train", label: "🚇 Metro / Train" },
  { value: "auto_rickshaw", label: "🛺 Auto-Rickshaw (CNG)" },
];

const foodOptions = [
  { value: "nonveg_heavy", label: "🍖 Non-Veg Heavy" },
  { value: "nonveg_light", label: "🍗 Non-Veg Light" },
  { value: "vegetarian", label: "🥗 Vegetarian" },
  { value: "vegan", label: "🌱 Vegan" },
];

const energySourceOptions = [
  { value: "coal_grid", label: "🏭 Coal Grid (Default)" },
  { value: "mixed_grid", label: "🌤️ Mixed Green Pool" },
  { value: "solar_roof", label: "☀️ Rooftop Solar" },
];

const shoppingOptions = [
  { value: "secondhand_minimal", label: "♻️ Eco / Khadi" },
  { value: "moderate", label: "🛍️ Moderate" },
  { value: "frequent_new", label: "🛒 Frequent New" },
];

const flightOptions = [
  { value: "never", label: "✈️ Rarely" },
  { value: "occasional", label: "🛫 Occasional" },
  { value: "frequent", label: "🌍 Frequent" },
];

export default function Onboarding() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    transportation: "petrol_car",
    commuteMiles: 15,
    foodHabit: "vegetarian",
    shoppingHabits: "moderate",
    flightFrequency: "occasional",
    energyBill: 2000,
    energySource: "coal_grid",
    householdSize: 4,
  });
  const [calculating, setCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");

  const handleAutofill = () => {
    setFormData({
      name: "Riya Sharma",
      transportation: "ola_scooter",
      commuteMiles: 12,
      foodHabit: "vegetarian",
      shoppingHabits: "moderate",
      flightFrequency: "occasional",
      energyBill: 1500,
      energySource: "mixed_grid",
      householdSize: 3,
    });
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setError("");
    setCalculating(true);
    setTimeout(() => {
      const profile = calculateCarbonDNA(formData);
      setResults(profile);
      setCalculating(false);
    }, 1500);
  };

  const handleFinish = () => {
    if (results) {
      localStorage.setItem("carbonos-profile", JSON.stringify(results));
      router.push("/dashboard");
    }
  };

  return (
    <div className="ob-page">
      <div className="ob-glow" />

      <main className="ob-main">
        {/* Header */}
        <div className="ob-header">
          <div className="ob-logo">
            <Leaf size={20} />
            CarbonOS
          </div>
          <h1 className="ob-title">Initialize Your Carbon DNA</h1>
          <p className="ob-subtitle">
            Tell us about your lifestyle and we&apos;ll compute your personal carbon
            baseline — your Digital Climate Twin.
          </p>
        </div>

        {!results ? (
          <form
            className="ob-form"
            onSubmit={handleSubmit}
            aria-label="Carbon DNA initialization form"
          >
            {/* Name */}
            <div className="ob-field">
              <label htmlFor="ob-name" className="ob-label">
                Your Name
              </label>
              <input
                id="ob-name"
                name="name"
                type="text"
                className="ob-input"
                placeholder="e.g. Riya Sharma"
                value={formData.name}
                onChange={handleChange}
                maxLength={32}
                autoComplete="given-name"
              />
              {error && (
                <span className="ob-error" role="alert">
                  {error}
                </span>
              )}
            </div>

            <div className="ob-divider" />

            {/* Transport + Commute distance */}
            <div className="ob-row">
              <div className="ob-field">
                <label htmlFor="ob-transport" className="ob-label">
                  Primary Transport
                </label>
                <select
                  id="ob-transport"
                  name="transportation"
                  className="ob-select"
                  value={formData.transportation}
                  onChange={handleChange}
                  aria-label="Primary transport method"
                >
                  {transportOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ob-field">
                <label htmlFor="ob-commute" className="ob-label">
                  Daily Commute — {formData.commuteMiles} km
                </label>
                <input
                  id="ob-commute"
                  name="commuteMiles"
                  type="range"
                  className="ob-range"
                  min={2}
                  max={120}
                  value={formData.commuteMiles}
                  onChange={handleChange}
                  aria-valuenow={formData.commuteMiles}
                  aria-valuemin={2}
                  aria-valuemax={120}
                />
              </div>
            </div>

            {/* Food + Flights */}
            <div className="ob-row">
              <div className="ob-field">
                <label htmlFor="ob-food" className="ob-label">
                  Diet Habit
                </label>
                <select
                  id="ob-food"
                  name="foodHabit"
                  className="ob-select"
                  value={formData.foodHabit}
                  onChange={handleChange}
                  aria-label="Diet habit"
                >
                  {foodOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ob-field">
                <label htmlFor="ob-flights" className="ob-label">
                  Flight Frequency
                </label>
                <select
                  id="ob-flights"
                  name="flightFrequency"
                  className="ob-select"
                  value={formData.flightFrequency}
                  onChange={handleChange}
                  aria-label="Flight frequency"
                >
                  {flightOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Shopping + Energy Source */}
            <div className="ob-row">
              <div className="ob-field">
                <label htmlFor="ob-shopping" className="ob-label">
                  Shopping Habits
                </label>
                <select
                  id="ob-shopping"
                  name="shoppingHabits"
                  className="ob-select"
                  value={formData.shoppingHabits}
                  onChange={handleChange}
                  aria-label="Shopping habits"
                >
                  {shoppingOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ob-field">
                <label htmlFor="ob-energy-source" className="ob-label">
                  Electricity Source
                </label>
                <select
                  id="ob-energy-source"
                  name="energySource"
                  className="ob-select"
                  value={formData.energySource}
                  onChange={handleChange}
                  aria-label="Electricity source"
                >
                  {energySourceOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Energy bill + Household size */}
            <div className="ob-row">
              <div className="ob-field">
                <label htmlFor="ob-bill" className="ob-label">
                  Monthly Energy Bill (₹)
                </label>
                <input
                  id="ob-bill"
                  name="energyBill"
                  type="number"
                  className="ob-input"
                  min={200}
                  max={50000}
                  value={formData.energyBill}
                  onChange={handleChange}
                  aria-label="Monthly energy bill in rupees"
                />
              </div>
              <div className="ob-field">
                <label htmlFor="ob-household" className="ob-label">
                  Household Size (people)
                </label>
                <input
                  id="ob-household"
                  name="householdSize"
                  type="number"
                  className="ob-input"
                  min={1}
                  max={15}
                  value={formData.householdSize}
                  onChange={handleChange}
                  aria-label="Number of people in household"
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "1rem" }}>
              <button
                type="button"
                className="ob-submit"
                onClick={handleAutofill}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#10b981"
                }}
                aria-label="Autofill a demo carbon profile"
              >
                Autofill Demo DNA
              </button>
              <button
                type="submit"
                className="ob-submit"
                disabled={calculating}
                style={{ flex: 2, margin: 0 }}
                aria-busy={calculating}
                aria-label="Generate your Carbon DNA profile"
              >
                {calculating ? (
                  <>
                    <span className="ob-spinner" aria-hidden="true" /> Calculating...
                  </>
                ) : (
                  <>
                    Generate Carbon DNA <ArrowRight size={18} aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Results */
          <div className="ob-results" role="region" aria-label="Carbon DNA results">
            <div className="ob-results-badge">
              <Sparkles size={14} aria-hidden="true" /> DNA PROFILE READY
            </div>
            <h2 className="ob-results-title">
              Welcome, {results.name}!
            </h2>
            <p className="ob-results-sub">
              Your Digital Climate Twin has been calibrated.
            </p>

            <div className="ob-score-row">
              <div className="ob-score-circle" aria-label={`Carbon score: ${results.score} out of 100`}>
                <span className="ob-score-num">{results.score}</span>
                <span className="ob-score-lbl">/ 100</span>
              </div>
              <div className="ob-score-desc">
                <p>
                  {results.score > 75
                    ? "🌿 Excellent — well below urban average!"
                    : results.score > 50
                    ? "⚡ Moderate — solid improvement headroom."
                    : "🔥 High emissions — time to optimise."}
                </p>
              </div>
            </div>

            <div className="ob-bars" aria-label="Footprint breakdown">
              {[
                { label: "🚗 Transport", key: "transportation", cls: "bar-trans" },
                { label: "🍔 Food", key: "food", cls: "bar-food" },
                { label: "🛍️ Shopping", key: "shopping", cls: "bar-shop" },
                { label: "⚡ Energy", key: "energy", cls: "bar-energy" },
              ].map(({ label, key, cls }) => (
                <div key={key} className="ob-bar-row">
                  <span className="ob-bar-label">{label}</span>
                  <div className="ob-bar-track" role="progressbar" aria-valuenow={results.breakdown[key]} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${results.breakdown[key]}%`}>
                    <div
                      className={`ob-bar-fill ${cls}`}
                      style={{ width: `${results.breakdown[key]}%` }}
                    />
                  </div>
                  <span className="ob-bar-pct">{results.breakdown[key]}%</span>
                </div>
              ))}
            </div>

            <button
              className="ob-submit"
              onClick={handleFinish}
              aria-label="Enter CarbonOS dashboard"
            >
              Boot Climate OS <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </main>

      <style jsx>{`
        .ob-page {
          min-height: 100vh;
          background: #060907;
          color: #f2f7f4;
          font-family: var(--font-sans, system-ui, sans-serif);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .ob-glow {
          position: absolute;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16,185,129,0.13) 0%, transparent 70%);
          filter: blur(80px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .ob-main {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 700px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Header */
        .ob-header {
          text-align: center;
        }

        .ob-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #10b981;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.04em;
          margin-bottom: 1rem;
        }

        .ob-title {
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 0.6rem;
          line-height: 1.2;
        }

        .ob-subtitle {
          color: #8aab9e;
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto;
        }

        /* Form card */
        .ob-form,
        .ob-results {
          background: rgba(12, 18, 15, 0.88);
          border: 1px solid rgba(16, 185, 129, 0.14);
          border-radius: 24px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          backdrop-filter: blur(12px);
        }

        .ob-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
        }

        .ob-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .ob-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .ob-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #a3b8ae;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .ob-input,
        .ob-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          color: #f2f7f4;
          font-size: 0.95rem;
          padding: 0.75rem 1rem;
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
        }

        .ob-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238aab9e' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }

        .ob-input:focus,
        .ob-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
        }

        .ob-input::placeholder {
          color: #4a5e57;
        }

        .ob-select option {
          background: #0c120f;
        }

        /* Range slider */
        .ob-range {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 99px;
          background: rgba(255,255,255,0.08);
          outline: none;
          cursor: pointer;
          margin-top: 0.35rem;
        }

        .ob-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(16,185,129,0.5);
        }

        /* Error */
        .ob-error {
          font-size: 0.8rem;
          color: #f87171;
          margin-top: 0.25rem;
        }

        /* Submit */
        .ob-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          background: #10b981;
          color: #050d09;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          border-radius: 14px;
          padding: 0.9rem 1.5rem;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s, box-shadow 0.2s;
          margin-top: 0.5rem;
        }

        .ob-submit:hover {
          background: #0ea271;
          box-shadow: 0 0 20px rgba(16,185,129,0.3);
        }

        .ob-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .ob-submit:focus-visible {
          outline: 2px solid #10b981;
          outline-offset: 2px;
        }

        /* Spinner */
        .ob-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #050d09;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Results */
        .ob-results-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2);
          color: #10b981;
          padding: 0.3rem 0.9rem;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          align-self: flex-start;
        }

        .ob-results-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
        }

        .ob-results-sub {
          color: #8aab9e;
          font-size: 0.9rem;
          margin: 0;
        }

        .ob-score-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 1.25rem;
        }

        .ob-score-circle {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 5px solid #10b981;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 20px rgba(16,185,129,0.2);
        }

        .ob-score-num {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
        }

        .ob-score-lbl {
          font-size: 0.7rem;
          color: #8aab9e;
        }

        .ob-score-desc p {
          font-size: 0.95rem;
          color: #c1d9d0;
          line-height: 1.5;
          margin: 0;
        }

        .ob-bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .ob-bar-row {
          display: grid;
          grid-template-columns: 110px 1fr 40px;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.82rem;
        }

        .ob-bar-label {
          color: #a3b8ae;
        }

        .ob-bar-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          overflow: hidden;
        }

        .ob-bar-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.6s ease;
        }

        .bar-trans { background: #10b981; }
        .bar-food  { background: #34d399; }
        .bar-shop  { background: #a78bfa; }
        .bar-energy { background: #60a5fa; }

        .ob-bar-pct {
          text-align: right;
          color: #c1d9d0;
          font-weight: 600;
          font-size: 0.8rem;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .ob-form,
          .ob-results { padding: 1.5rem; }

          .ob-row { grid-template-columns: 1fr; }

          .ob-score-row { flex-direction: column; text-align: center; }

          .ob-bar-row { grid-template-columns: 90px 1fr 36px; }
        }
      `}</style>
    </div>
  );
}
