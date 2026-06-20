# CarbonOS: Climate Operating System 🌍🔋

**CarbonOS** is a state-of-the-art, AI-powered Climate Operating System designed to help users measure, predict, and systematically reduce their daily carbon footprint. Built during the AMD Ideathon, it combines advanced AI coaching, real-time transportation routing, and dynamic data synchronizations.

This codebase has been refactored and optimized to achieve **production-grade quality, hardened security, ARIA-accessible styling, and comprehensive unit tests coverage** with **0 build errors or warnings**.

---

## 🚀 Live Demonstration
The application is deployed and running on Google Cloud Run:
* **URL**: [https://carbonos-190654234167.asia-south1.run.app](https://carbonos-190654234167.asia-south1.run.app)

---

## ✨ Production-Grade Upgrades

### 1. Code Quality & Modular Architecture
- **Reusable Component Library (`src/components/ui/`)**: Replaced ad-hoc components with strongly-typed, ARIA-accessible layout controls:
  - `Button`: Clean custom variants (`primary`, `secondary`, `ghost`) and full prop safety.
  - `ProgressBar`: Accessible progress tracker (`role="progressbar"`, `aria-valuenow`).
  - `Card`: Focusable and keyboard-triggerable interactive cards.
  - `Badge`: Harmonic category status markers.
- **Decoupled Business Logic**: Extracted distance matrix math and link redirections out of UI pages into a pure, testable module (`src/lib/travelHelpers.ts`).

### 2. Enterprise-Grade Security Hardening
- **Cross-Site Scripting (XSS) Defense**: Centralized HTML escaping (`sanitizeString` in `src/lib/security.ts`) to prevent XSS payloads in dynamically generated documents, calendar events, and emails.
- **CSV/Spreadsheet Formula Injection Defense**: Implemented formula escaping (`sanitizeFormula`) to automatically prepend a single quote (`'`) to any string starting with `=`, `+`, `-`, or `@` before appending logs to Google Sheets.
- **Input Validation**: Hardened all API endpoints (Docs, Mail, Calendar, Scan, Sheets, Air Quality, Coach) with address length filters, script tag blocks, and numeric type coersions.
- **Robust AI Prompts**: Reconfigured Gemini integration to utilize `responseMimeType: "application/json"`, enforcing structured JSON responses and eliminating parser regex errors.

### 3. A11Y Accessibility Compliance
- **ARIA & Semantics**: Associated labels with inputs, added focus states (`tabIndex={0}`), and configured keyboard navigation (Enter/Space handlers) on all interactive cards.
- **Render Purity**: Fixed React 19 render warnings by generating stable verification IDs inside event handlers rather than calling `Math.random()` during the component render pass.

### 4. Comprehensive Testing Suite
- Configured **Vitest + JSDOM** runner.
- **Unit Tests**:
  - `travelHelpers.test.ts`: Validates transit mode estimations, fare calculations, and Indian regional naming overrides (Delhi Metro, BMTC Bus, Namma Metro, etc.).
  - `security.test.ts`: Validates XSS string sanitizers, Google Sheets Formula Injection filters, and geocoding address bounds.
- All **24/24 tests pass successfully** with clean exit codes.

---

## 🛠️ Google API Ecosystem Integration

CarbonOS integrates a massive suite of **Google APIs** to provide high-fidelity, contextual experiences:

1. **Google Maps Places API**: Powering place auto-suggestions in the route inputs.
2. **Google Maps Distance Matrix API**: Calculating physical commuting distances and times dynamically.
3. **Google Maps Embed API**: Visualizing optimal routes in real-time.
4. **Google Air Quality API**: Fetching real-time AQI values for both origin and destination cities to display live environmental badges.
5. **Google Cloud Text-to-Speech API**: Synthesizing custom, natural spoken narratives of commuter savings.
6. **Google Cloud Storage (GCS) API**: Storing scanned bills and receipts in a secure receipt vault.
7. **Google Sheets API**: Logging commuter carbon savings dynamically onto a shared Google Sheet.
8. **Google Docs API**: Generating comprehensive Carbon Optimization Certificates and reports.
9. **Google Drive API**: Organizing files and managing sharing permissions of Sheets and Docs.
10. **Google Mail (Gmail) API**: Dispatched carbon certificates and commute summaries directly to user inboxes.
11. **Google Calendar API**: Injecting optimized low-carbon travel events into Google Calendar automatically.
12. **Google YouTube Data API**: Recommending travel guides and EV review vlogs in the media recommendation hub.
13. **Google Gemini API**: Powering the carbon auditor, receipt scanner, and the virtual AI climate coach.

---

## 📦 Tech Stack & Architecture

* **Frontend Framework**: Next.js 16 (Turbopack, App Router)
* **Styling**: Modern, responsive CSS with glassmorphism effects and custom HSL color palettes.
* **Testing Runner**: Vitest with jsdom
* **Backend**: Serverless Next.js API endpoints.
* **Deployment**: Hosted on **Google Cloud Run** in `asia-south1` (Mumbai).
* **Containerization**: Optimized multi-stage Docker build (`Dockerfile` provided).

---

## ⚙️ Local Development

### 1. Configure Environment Variables
Create a `.env.local` file in the root folder:
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GCP_PROJECT_ID=your_gcp_project_id
GOOGLE_SHEETS_CLIENT_SECRET=your_sheets_secret
GOOGLE_MAIL_CLIENT_SECRET=your_mail_secret
GOOGLE_CALENDAR_CLIENT_SECRET=your_calendar_secret
GOOGLE_YOUTUBE_API_KEY=your_youtube_api_key
```

### 2. Service Account Key
Save your GCP service account JSON key as `keys.json` in the root directory.

### 3. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the console.

---

## 🧪 Running Tests
To execute the test suite:
```bash
npm run test
```

---

## 🐳 Running with Docker

You can build and run the production-ready Next.js standalone container locally:
```bash
docker build -t carbonos .
docker run -p 8080:8080 --env-file .env.local carbonos
```
