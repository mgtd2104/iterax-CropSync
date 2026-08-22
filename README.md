# 🌾 IteraX-CropSync

**AI-powered farm advisory platform with real-time IoT soil & climate monitoring — built for the underserved Indian farmer.**

Built for **OOSC 4.0 Hackathon**, IIIT Allahabad — Problem Statement 5: *AI for Public Good*

---

## 🎯 The Problem

Small and marginal farmers in India make high-stakes agricultural decisions — when to irrigate, what to plant, how to respond to crop stress — with limited resources and incomplete information. Existing advisory tools rarely connect to real, on-ground field conditions, leaving farmers dependent on guesswork or delayed expert visits.

## 💡 Our Solution

IteraX-CropSync combines a **real-time ESP32 field sensor unit** with an **AI advisory layer** (Gemini 2.5 Flash) to give farmers timely, localized, actionable guidance — through a web app designed for low digital literacy, in their own language.

---

## ✨ Features

### 🔐 Access
- **Login / Sign Up** — full account with persistent crop and farm data
- **Demo Mode** (guest access) — try the full app instantly with sample data, no signup required. AI features (Advisory, Chat, Disease Detection) are available **once per feature** in Demo Mode — a banner encourages login for full, unlimited access.

### 🌱 Farm Dashboard
- **Crop Cards** — track seasonal and plantation crops (coffee, mango, etc.) with a quick filter toggle (All / Seasonal / Plantation)
- **Live Sensor Panel** — real-time field data pushed from an ESP32 hardware unit via Firebase: rain status, air temperature, humidity, light intensity, and water tank level
- **AI Smart Advisory** — on-demand, plain-language crop and irrigation guidance generated from live sensor data + crop type, powered by Gemini 2.5 Flash

### 🤖 AI Tools
- **AI Chat Assistant** — conversational assistant aware of the farmer's live sensor data and crop context, responds in the farmer's selected language
- **Disease & Pest Detection** — upload or capture a crop/leaf photo via phone camera; Gemini Vision identifies visible pest, disease, or deficiency signs and suggests next steps

### 📄 Farm Management
- **Documents Vault** — securely store and access farm-related documents (land records, certificates, etc.)
- **Government Schemes** — curated list of real, official government scheme portals (PM-KISAN, myScheme, Soil Health Card Scheme, PMFBY) — one click to the official site

### 🌍 Accessibility
- Multilingual AI responses (Gemini natively handles regional languages)
- Mobile-first, plain UI design — bordered cards, large touch targets, minimal jargon

### 🔜 Upcoming (Post-Hackathon Roadmap)
- Price prediction & market intelligence
- Smart notifications (rain/irrigation/climate alerts from live sensor thresholds)
- Live government scheme auto-updates
- Cost & profit estimation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | Firebase Realtime Database |
| Auth | Firebase Authentication (Email/Password + Anonymous for Demo Mode) |
| Storage | Firebase Storage |
| AI | Google Gemini 2.5 Flash (text + vision) |
| Hardware | ESP32 microcontroller |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 🔌 Hardware Integration

An ESP32 field unit continuously monitors:
- **Rain detection** (FC-37 rain sensor)
- **Air temperature & humidity** (DHT11)
- **Light intensity** (LDR)
- **Water tank level** (HC-SR04 ultrasonic sensor, repurposed)

Sensor data pushes to Firebase Realtime Database every 30–60 seconds, which the web app reads live and feeds directly into the AI advisory engine — closing the loop between physical field conditions and AI-driven decisions.

> Note: A dedicated soil moisture/pH sensor is planned as future hardware scope — this prototype focuses on rain, climate, and tank-level monitoring as core real-time indicators.

---

## 🚀 Live Demo

**Prototype link:** [Add Vercel URL here]

**Demo video:** [Watch on Google Drive](add-your-drive-link-here)

---

## 💻 Run Locally

### Prerequisites
- Node.js (v18+)
- A Firebase project with Realtime Database + Authentication enabled
- A Gemini API key ([aistudio.google.com](https://aistudio.google.com/apikey))
- An OpenWeatherMap API key (optional, for weather-aware advisory)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd iterax-cropsync
```

### 2. Backend setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
GEMINI_API_KEY=your_gemini_key
WEATHER_API_KEY=your_openweather_key
PORT=5000

Run the backend:
```bash
node server.js
```

### 3. Frontend setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/`:
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id

Run the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`, with the backend running on `http://localhost:5000`.

---

## 👥 Team
- [Your Name]
- [Teammate Name]

---

## 📂 Project Docs

Planning documents used to build this project are included in the repo root:
- `PRD.md` — requirements and scope
- `architecture.md` — tech stack, app flow, Firebase schema
- `rules.md` — coding standards
- `phases.md` — build phases
- `design.md` — visual design system

---

## 🙏 Acknowledgements

Built for OOSC 4.0 Hackathon, IIIT Allahabad. Thanks to the organizing team for the platform and problem statement.
 
 