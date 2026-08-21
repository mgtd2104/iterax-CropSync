# AgriSense — Memory & Progress Log

## Project Summary
AgriSense is an AI-powered farm advisory web application connected to a real-time ESP32 field sensor unit.

---

## What Is Done & Included in Project

### 1. Planning & Specifications (`agrisense-repo/`)
- `PRD.md` — Requirements and scope definition
- `architecture.md` — Flow, folder structure, API list, and Firebase schema
- `rules.md` — AI coding guardrails
- `phases.md` — Phased development roadmap
- `design.md` — Visual design system specs
- `README.md` & `memory.md` — Project docs and progress log

### 2. Phase 1: Firebase, Auth & Onboarding (`agrisense-repo/frontend/`)
- **Frontend Stack**: React (Vite) for component-based UI, styled with Tailwind CSS; React Router DOM for navigation; Firebase SDK for backend integration; Recharts for data visualization.
- **Design System**: Configured theme colors in `src/index.css` (#2D6A4F, #1B4332, #F8FAF7, #F1F7F3, #F4A300, #D64545, #222222)
- **Firebase Services**: Initialized Realtime Database, Authentication, and Cloud Storage in `src/services/firebase.js` for data persistence, user management, and asset storage.
- **Authentication (`src/hooks/useFirebaseAuth.js` & `src/context/UserContext.jsx`)**: Email/password sign up & login + Anonymous Guest mode
- **Location Detection (`src/hooks/useGeolocation.js`)**: Geolocation API with manual state/district fallback
- **Landing Page (`src/pages/Landing.jsx`)**: Auth form and guest entry
- **Onboarding Page (`src/pages/Onboarding.jsx`)**: State, district, language, farming type, soil type, land area, and crop setup. Saves to `/users/{uid}/profile` and `/users/{uid}/plots/plot_1`

### 3. Phase 2: Live Sensor Dashboard & Controls (`agrisense-repo/frontend/`)
- **Live Sensor Sync Hook (`src/hooks/useSensorData.js`)**: Listeners for Realtime Database: `/devices/esp32_unit_1/sensors`, `/devices/esp32_unit_1/alerts`, and `/devices/esp32_unit_1/commands`. Calculates "Sensor offline" if the last timestamp is >5 minutes.
- **Interactive Pump Control**: Seamless write for `pump_override` to Realtime Database with visual status sync with ESP32-written `pump_status`.
- **Sensor Cards (`src/components/SensorCard.jsx`)**: Reusable and high-contrast, representing soil moisture, temperature, light, water level, humidity, and rain status.
- **Alert Toast notifications (`src/components/AlertToast.jsx`)**: Automatically displays in-app banners for critical water levels, rain updates, low soil moisture, and offline sensors.
- **Crop Plot Cards (`src/components/CropCard.jsx`)**: Visual representation of active crops (either real database plots or in-memory temporary plots for guest sessions).
- **Multilingual Support (`src/services/translations.js`)**: Centralized translation maps for English, Hindi, and Punjabi, accessible via a persistent header language-switcher on the Dashboard.

### 4. Phase 3: Backend Development & Gemini Integration (`agrisense-repo/backend/`)
- **Backend Stack**: Express.js server (`server.js`) with CORS, dotenv, and `@google/generative-ai` SDK.
- **`/api/advisory` endpoint**: Accepts `sensor_data`, `crop_type`, `soil_type`, `language`, `state`, `district`. Calls Gemini 2.5 Flash to produce ~100 word agricultural advisory.
- **Weather fetch (OpenWeatherMap)**: Before Gemini call, fetches current weather from `https://api.openweathermap.org/data/2.5/weather` using `WEATHER_API_KEY` from `.env`, passing `state,district` as `q` query param with `units=metric`. Extracts temperature and weather condition, appends to Gemini prompt context. Wrapped in try/catch — advisory continues without weather data if fetch fails.
- **`/api/disease-detect` endpoint**: Accepts `image_base64`, `crop_type`, `language`. Passes base64 image to Gemini with a prompt to identify pests, diseases, or nutrient deficiencies.
- **`/api/chat` endpoint**: Accepts `message`, `context`, `language`. Uses Gemini with a system instruction embedding farmer context for conversational assistance.
- **Environment config**: `[backend/.env](backend/.env)` holds `GEMINI_API_KEY` and `WEATHER_API_KEY` (gitignored). Frontend `[frontend/.env](frontend/.env)` holds Firebase config keys (gitignored). `.env.example` files were removed as not needed.
- **Gitignore**: `backend/.gitignore` (created) and `frontend/.gitignore` both exclude `.env` and `node_modules`.

### 5. Dev Environment Setup
- Backend dependencies installed and running on port 5000 (`npm run dev` via `node --watch server.js`).
- Frontend dependencies installed and running on port 5174 (`npm run dev` via Vite). Note: port 5173 was in use.

---

## Current Status
- **Completed**: Phase 1, Phase 2, and Phase 3 (Backend APIs, Gemini advisory, weather integration, prodisease detectionn, chat)
- **Running**: Backend dev server (`http://localhost:5000`) and Frontend Vite dev server (`http://localhost:5174`)

---

## Task Log

### Completed Tasks
- [2026-08-19] Initial project setup and Phase 1 completion documented.
- [2026-08-19] Phase 2: Dashboard shell, crop plot cards, live ESP32 sensor integration, alert toaster, centralized multilingual switcher, and manual pump override controls completed.
- [2026-08-20] Phase 3: Backend `server.js` created with `/api/advisory`, `/api/disease-detect`, and `/api/chat` endpoints using Gemini 2.5 Flash.
- [2026-08-20] Weather fetch added to `/api/advisory` — calls OpenWeatherMap current weather API with state/district, extracts temp & condition, appends to Gemini prompt. Try/catch ensures advisory proceeds without weather if fetch fails.
- [2026-08-20] `.gitignore` created for backend with `node_modules` and `.env`. Frontend `.gitignore` already had `.env`. Verified `.env` files are gitignored in both.
- [2026-08-20] Removed `.env.example` files from frontend and backend (not needed).
- [2026-08-20] Backend & frontend dependencies installed; both dev servers running (backend on :5000, frontend on :5174).

### Next Task
- Add backend `.env` with real `GEMINI_API_KEY` and `WEATHER_API_KEY` values (currently missing).
- Wire frontend pages (`Dashboard.jsx`, `DiseaseDetection.jsx`) to call backend APIs.
- Integrate chat UI component for `/api/chat`.
