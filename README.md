# CarbonOS: Climate Operating System 🌍🔋

**CarbonOS** is a state-of-the-art, AI-powered Climate Operating System designed to help users measure, predict, and systematically reduce their daily carbon footprint. Built during the AMD Ideathon, it combines advanced AI coaching, real-time transportation routing, and dynamic data synchronizations.

---

## 🚀 Live Demonstration
The application is deployed and running on Google Cloud Run:
* **URL**: [https://carbonos-190654234167.asia-south1.run.app](https://carbonos-190654234167.asia-south1.run.app)

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

## 🐳 Running with Docker

You can build and run the production-ready Next.js standalone container locally:
```bash
docker build -t carbonos .
docker run -p 8080:8080 --env-file .env.local carbonos
```
