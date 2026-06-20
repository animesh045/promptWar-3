"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { 
  Camera, 
  Upload, 
  TrendingDown, 
  DollarSign, 
  Award, 
  AlertCircle,
  FileText,
  Utensils,
  ShoppingBag,
  Zap,
  Check,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export default function CarbonLensScanner() {
  const [scanType, setScanType] = useState<string>("receipt");
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<string>("");
  const [results, setResults] = useState<any>(null);
  const [customFile, setCustomFile] = useState<string | null>(null);

  const scanTemplates = [
    { id: "receipt", label: "Grocery Receipt", icon: FileText },
    { id: "electricity", label: "Utility Bill", icon: Zap },
    { id: "product", label: "Shopping Product", icon: ShoppingBag },
    { id: "menu", label: "Restaurant Menu", icon: Utensils }
  ];

  const handleStartScan = async (type: string, fileData?: string) => {
    setScanning(true);
    setResults(null);

    // Progressive status reveals
    const statuses = [
      "Initializing Carbon Lens Engine...",
      "Reading document OCR text...",
      "Sending payload to Gemini Vision...",
      "Mapping impact drivers...",
      "Calculating cost swaps..."
    ];

    let currentStatusIdx = 0;
    setScanProgress(statuses[0]);

    const statusInterval = setInterval(() => {
      currentStatusIdx++;
      if (currentStatusIdx < statuses.length) {
        setScanProgress(statuses[currentStatusIdx]);
      }
    }, 700);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanType: type,
          image: fileData || null,
          filename: fileData ? "user_upload.png" : `${type}_template.jpg`
        })
      });

      const data = await response.json();
      
      clearInterval(statusInterval);
      setTimeout(() => {
        setResults(data);
        setScanning(false);
      }, 500);

    } catch (error) {
      console.error(error);
      clearInterval(statusInterval);
      setScanProgress("Scan failed. Reconnecting...");
      setTimeout(() => setScanning(false), 1000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanProgress("Uploading file to Google Cloud Storage...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadRes.json();
      
      let finalImgUrl = "";
      if (uploadData.success && uploadData.url) {
        finalImgUrl = uploadData.url;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Result = event.target?.result as string;
        setCustomFile(finalImgUrl || base64Result);
        handleStartScan("receipt", base64Result);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("GCS Upload failed, falling back to local:", err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Result = event.target?.result as string;
        setCustomFile(base64Result);
        handleStartScan("receipt", base64Result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout>
      <div className="scanner-page-grid">
        {/* Left Side: Scan Camera Interface */}
        <div className="glass-card camera-viewport-card">
          <span className="card-pre">GEMINI VISION CAPABILITIES</span>
          <h2>Carbon Lens Scanner</h2>
          <p>Scan real-world receipts, electricity bills, packaging, or menus to reveal climate implications.</p>

          {/* Preset Selector */}
          <div className="template-row">
            {scanTemplates.map((t) => {
              const Icon = t.icon;
              return (
                <button 
                  key={t.id}
                  className={`template-tab-btn ${scanType === t.id ? "active" : ""}`}
                  onClick={() => setScanType(t.id)}
                  disabled={scanning}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Camera Box / Scan Animation Port */}
          <div className="scanner-frame">
            {scanning ? (
              <div className="scanning-container">
                <div className="scan-laser-line"></div>
                <div className="scanning-loader">
                  <div className="spinner"></div>
                  <span className="progress-text">{scanProgress}</span>
                </div>
              </div>
            ) : customFile ? (
              <div className="uploaded-preview">
                <img src={customFile} alt="User upload preview" className="preview-img" />
                <button className="btn btn-secondary clear-file-btn" onClick={() => setCustomFile(null)}>Clear Image</button>
              </div>
            ) : (
              <div className="scan-placeholder-graphics">
                <Camera size={44} className="placeholder-icon animate-float" />
                <span>Camera Feed Inactive</span>
                <p>Select a template below or upload an image file of your bill/receipt.</p>
                
                <button className="btn btn-primary trigger-btn" onClick={() => handleStartScan(scanType)}>
                  Simulate Gemini Lens Scan
                </button>

                <div className="upload-input-wrap">
                  <label htmlFor="lens-upload" className="btn btn-secondary upload-btn">
                    <Upload size={16} /> Upload receipt/bill image
                  </label>
                  <input 
                    type="file" 
                    id="lens-upload" 
                    accept="image/*" 
                    style={{ display: "none" }} 
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Results progressive reveal */}
        <div className="scanner-results-panel">
          {results ? (
            <div className="results-reveal-container">
              {/* Card 1: Score & Title */}
              <div className="glass-card score-reveal-card animate-float">
                <div className="card-top-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "0.5rem" }}>
                  <span className="scanned-badge"><ShieldCheck size={12} /> VERIFIED OCR DATA</span>
                  {customFile && customFile.startsWith("https://storage.googleapis.com") && (
                    <a 
                      href={customFile} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="scanned-badge" 
                      style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid var(--brand-500)", color: "var(--brand-500)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                    >
                      Cloud Vault ↗
                    </a>
                  )}
                  <h4 style={{ width: "100%", marginTop: "0.5rem" }}>{results.extractedTitle}</h4>
                </div>
                
                <div className="score-summary-split">
                  <div className="mini-score-circle" style={{ borderColor: results.carbonScore > 60 ? "var(--brand-500)" : results.carbonScore > 40 ? "var(--blue-500)" : "var(--orange-500)" }}>
                    <span className="val">{results.carbonScore}</span>
                    <span className="lbl">Lens Score</span>
                  </div>
                  
                  <div className="annual-savings-callout">
                    <span className="lbl">EXPECTED SAVINGS</span>
                    <strong className="val">-{results.expectedAnnualImpact} kg CO₂/yr</strong>
                    <span className="sub">if green alternatives adopted</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Impact Drivers */}
              <div className="glass-card drivers-card">
                <h5>Primary Footprint Drivers</h5>
                <ul className="driver-list">
                  {results.impactDrivers.map((driver: string, idx: number) => (
                    <li key={idx}>
                      <span className="driver-bullet">•</span>
                      <p>{driver}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 3: Swaps & Alternatives */}
              <div className="glass-card swaps-card">
                <h5>Climate Swaps Recommended</h5>
                
                <div className="swap-group-stack">
                  {results.greenerAlternatives.map((alt: string, idx: number) => (
                    <div key={idx} className="swap-item-box">
                      <div className="swap-indicator"><Check size={10} /></div>
                      <div className="swap-details">
                        <strong>Greener Alternative {idx + 1}</strong>
                        <p>{alt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Cost Comparison */}
              <div className="glass-card cost-compare-card">
                <h5>Financial Impact Comparison</h5>
                
                <div className="cost-bars-stack">
                  <div className="cost-bar-item">
                    <span className="lbl">Current Cost</span>
                    <div className="bar-track"><div className="bar-fill current" style={{ width: "100%" }}></div></div>
                    <span className="val">₹{results.costComparison.current.toFixed(0)}</span>
                  </div>
                  <div className="cost-bar-item">
                    <span className="lbl">Sustainable Cost</span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill green" 
                        style={{ width: `${(results.costComparison.green / results.costComparison.current) * 100}%` }}
                      ></div>
                    </div>
                    <span className="val">₹{results.costComparison.green.toFixed(0)}</span>
                  </div>
                </div>
                <p className="cost-summary-notes">
                  {results.costComparison.green < results.costComparison.current 
                    ? `Switching saves you roughly ₹${(results.costComparison.current - results.costComparison.green).toFixed(0)} immediately.` 
                    : `Adds a minor premium of ₹${(results.costComparison.green - results.costComparison.current).toFixed(0)} to support clean sources.`}
                </p>
              </div>

            </div>
          ) : (
            <div className="glass-card empty-results-card">
              <AlertCircle size={32} className="empty-icon" />
              <h4>Awaiting Scan Data</h4>
              <p>Run a lens simulation or upload an image on the left. Gemini will process thermal tags, shipping logistics, and carbon-coefficients in seconds.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scanner-page-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
        }

        .camera-viewport-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .template-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .template-tab-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          padding: 0.75rem 0.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .template-tab-btn:hover {
          border-color: var(--brand-400);
          color: var(--text-primary);
        }

        .template-tab-btn.active {
          border-color: var(--brand-500);
          background: var(--brand-glow);
          color: var(--brand-500);
        }

        .template-tab-btn span {
          font-size: 0.7rem;
          font-weight: 600;
        }

        /* Camera Frame / Scanning Screen */
        .scanner-frame {
          height: 300px;
          background: rgba(0, 0, 0, 0.25);
          border: 1px dashed var(--border-color);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .scan-placeholder-graphics {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          padding: 1.5rem;
        }

        :global(.placeholder-icon) {
          color: var(--text-tertiary);
        }

        .scan-placeholder-graphics span {
          font-size: 1rem;
          font-weight: bold;
        }

        .scan-placeholder-graphics p {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          max-width: 320px;
          margin-bottom: 0.5rem;
        }

        .upload-input-wrap {
          margin-top: 0.5rem;
        }

        .upload-btn {
          font-size: 0.8rem !important;
          padding: 0.5rem 1rem !important;
        }

        .uploaded-preview {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .clear-file-btn {
          position: absolute;
          bottom: 10px;
          font-size: 0.8rem !important;
          padding: 0.4rem 0.85rem !important;
        }

        /* Scanning State */
        .scanning-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .scanning-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          z-index: 10;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(16, 185, 129, 0.15);
          border-top-color: var(--brand-500);
          border-radius: 99px;
          animation: float 1.5s linear infinite;
        }

        .progress-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brand-500);
          font-family: var(--font-mono);
        }

        /* Results Panel CSS */
        .scanner-results-panel {
          min-height: 380px;
        }

        .empty-results-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1rem;
          color: var(--text-secondary);
        }

        :global(.empty-icon) {
          color: var(--border-color);
        }

        .empty-results-card h4 {
          font-size: 1.15rem;
          color: var(--text-primary);
        }

        .empty-results-card p {
          font-size: 0.85rem;
          max-width: 280px;
        }

        /* Result Cards Fades */
        .results-reveal-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .score-reveal-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border-color: var(--brand-500);
        }

        .card-top-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .scanned-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background: var(--brand-glow);
          color: var(--brand-500);
          font-size: 0.65rem;
          font-weight: bold;
          align-self: flex-start;
        }

        .score-summary-split {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .mini-score-circle {
          width: 70px;
          height: 70px;
          border: 4px solid var(--brand-500);
          border-radius: 99px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .mini-score-circle .val {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .mini-score-circle .lbl {
          font-size: 0.55rem;
          color: var(--text-tertiary);
        }

        .annual-savings-callout {
          display: flex;
          flex-direction: column;
        }

        .annual-savings-callout .lbl {
          font-size: 0.65rem;
          color: var(--text-tertiary);
          letter-spacing: 0.05em;
        }

        .annual-savings-callout .val {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--brand-500);
        }

        .annual-savings-callout .sub {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        /* Drivers list */
        .drivers-card h5, .swaps-card h5, .cost-compare-card h5 {
          font-size: 0.9rem;
          color: white;
          margin-bottom: 0.75rem;
        }

        .driver-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .driver-list li {
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .driver-bullet {
          color: var(--orange-500);
          font-weight: bold;
        }

        .driver-list p {
          font-size: 0.8rem;
          line-height: 1.4;
        }

        /* Swaps recommended */
        .swap-group-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .swap-item-box {
          display: flex;
          gap: 0.75rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 0.75rem;
          border-radius: 12px;
        }

        .swap-indicator {
          width: 18px;
          height: 18px;
          border-radius: 99px;
          background: var(--brand-glow);
          color: var(--brand-500);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .swap-details strong {
          font-size: 0.8rem;
          color: var(--brand-500);
        }

        .swap-details p {
          font-size: 0.75rem;
          line-height: 1.3;
        }

        /* Cost Comparison */
        .cost-bars-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .cost-bar-item {
          display: grid;
          grid-template-columns: 100px 1fr 60px;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
        }

        .cost-bar-item .lbl {
          color: var(--text-secondary);
        }

        .cost-bar-item .bar-track {
          height: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 99px;
          overflow: hidden;
        }

        .cost-bar-item .bar-fill {
          height: 100%;
          border-radius: 99px;
        }

        .cost-bar-item .bar-fill.current {
          background: var(--orange-500);
        }
        .cost-bar-item .bar-fill.green {
          background: var(--brand-500);
        }

        .cost-bar-item .val {
          text-align: right;
          font-weight: bold;
          font-family: var(--font-mono);
        }

        .cost-summary-notes {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          line-height: 1.3;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .scanner-page-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .template-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </AppLayout>
  );
}
