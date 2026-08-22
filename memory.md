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

### 2. Phase 1: Firebase, Auth & Onboarding (`cropsync/frontend/`) ✅ **COMPLETED**
- **Frontend Stack**: React (Vite) for component-based UI, styled with Tailwind CSS; React Router DOM for navigation; Firebase SDK for backend integration; Recharts for data visualization.
- **Design System**: Configured theme colors in `src/index.css` (#2D6A4F, #1B4332, #F8FAF7, #F1F7F3, #F4A300, #D64545, #222222)
- **Firebase Services**: Initialized Realtime Database, Authentication, and Cloud Storage in `src/services/firebase.js` for data persistence, user management, and asset storage.
- **Authentication (`src/hooks/useFirebaseAuth.js` & `src/context/UserContext.jsx`)**: Email/password sign up & login + Anonymous Guest mode
- **Location Detection (`src/hooks/useGeolocation.js`)**: Geolocation API with manual state/district fallback
- **Landing Page (`src/pages/Landing.jsx`)**: Auth form and guest entry
- **Onboarding Page (`src/pages/Onboarding.jsx`)**: State, district, language, farming type, soil type, land area, and crop setup. Saves to `/users/{uid}/profile` and `/users/{uid}/plots/plot_1`

### 3. Phase 2: Live Sensor Dashboard & Controls (`cropsync/frontend/`) ✅ **COMPLETED**
- **Live Sensor Sync Hook (`src/hooks/useSensorData.js`)**: Listeners for Realtime Database: `/devices/esp32_unit_1/sensors`. Calculates "Sensor offline" if the last timestamp is >5 minutes.
- **Sensor Cards (`src/components/SensorCard.jsx`)**: Reusable high-contrast cards for soil moisture, temperature, light, water level, humidity, and rain status.
- **Alert Toast notifications (`src/components/AlertToast.jsx`)**: Displays banners for critical water levels, rain updates, low soil moisture, and offline sensors.
- **Crop Plot Cards (`src/components/CropCard.jsx`)**: Visual representation of active crops with Seasonal/Plantation filter toggle.
- **Multilingual Support (`src/services/translations.js`)**: Translation maps for English, Hindi, and Punjabi with header language switcher.
- **Add Crop Modal**: Form with plot name, crop type, category (Seasonal/Plantation), start/end dates. Saves to Firebase RTDB at `users/{uid}/plots`.
- **Soil Moisture Sensor**: Added to Live Sensor Panel reading `soil_moisture_pct` from ESP32.
- **Documents Vault (`src/pages/DocumentsVault.jsx`)**: Firebase Storage upload/view/delete for user documents.
- **Animations**: `animate-slide-up` keyframe for modal entrance in `src/index.css`.

### 4. Phase 3: Backend Development & Gemini Integration (`cropsync/backend/`) ✅ **COMPLETED**
- **Backend Stack**: Express.js server (`server.js`) with CORS, dotenv, and `@google/generative-ai` SDK.
- **`/api/advisory` endpoint**: Accepts `sensor_data`, `crop_type`, `soil_type`, `language`, `state`, `district`. Calls Gemini 2.5 Flash (~100 word advisory).
- **Weather fetch (OpenWeatherMap)**: Fetches current weather by state/district, appends temp & condition to Gemini prompt. Try/catch fallback.
- **`/api/disease-detect` & `/api/disease-detection` endpoints**: Accepts base64 image, crop_type, language. Returns pest/disease/nutrient analysis via Gemini Vision.
- **`/api/chat` endpoint**: Accepts message, context, language. Uses Gemini with system instruction for contextual farm assistant.
- **Environment config**: `backend/.env` (`GEMINI_API_KEY`, `WEATHER_API_KEY`), `frontend/.env` (Firebase config) — both gitignored.
- **Gitignore**: Both exclude `.env` and `node_modules`.

### 5. Phase 4: Frontend API Integration ✅ **COMPLETED**
- **Dashboard (`src/pages/Dashboard.jsx`)**: Calls `/api/advisory` with live sensor data + active crop type.
- **Disease Detection (`src/pages/DiseaseDetection.jsx`)**: Drag-drop/paste/camera upload → `/api/disease-detection` → displays AI analysis.
- **Chat (`src/pages/Chat.jsx`)**: Conversational UI calling `/api/chat` with sensor/crop context. Guest usage limit (1 use).

### 6. Phase 5: Plantation Filter Toggle ✅ **COMPLETED**
- Filter buttons: All / Seasonal / Plantation in Dashboard crop section.
- CropCard uses `crop_category` field ("seasonal" | "plantation").

### 7. Phase 6: Government Schemes & Documents ✅ **COMPLETED**
- **Government Schemes card** on Dashboard: PM-KISAN, myScheme, Soil Health Card, PMFBY — static links opening in new tab.
- **Documents Vault** page: Firebase Storage upload/view/delete (authenticated users only).

### 8. Dev Environment & Deployment ✅ **COMPLETED**
- Backend: `node --watch server.js` on port 5000
- Frontend: Vite dev server on port 5174
- **GitHub**: Pushed to `https://github.com/mgtd2104/iterax-CropSync.git` (main branch)

---

## Current Status
- **Completed**: All Phases 1–8 (Firebase Auth, Onboarding, Live Dashboard, Sensor Panel, Add Crop Modal, Soil Moisture, Backend APIs, Gemini Advisory, Disease Detection, Chat, Plantation Filter, Government Schemes, Documents Vault, GitHub push)
- **Running**: Backend dev server (`http://localhost:5000`) and Frontend Vite dev server (`http://localhost:5174`)
- **Deployed**: Code on GitHub `main` branch

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
- [2026-08-22] Added **Add Crop Modal** to Dashboard with form fields: plot name, crop type, category (Seasonal/Plantation), start date, end date (optional). Saves to Firebase RTDB at `users/{uid}/plots` with `created_at` timestamp.
- [2026-08-22] Added **Soil Moisture** sensor card to Live Sensor Panel — reads `soil_moisture_pct` from ESP32 sensor data and displays in grid with other sensors.
- [2026-08-22] Added `animate-slide-up` CSS keyframe animation for modal entrance in `src/index.css`.
- [2026-08-22] Pushed all code to GitHub `https://github.com/mgtd2104/iterax-CropSync.git` (main branch).
- [2026-08-22] **All Phases 1-8 completed**: Frontend API integration (Dashboard advisory, Disease Detection, Chat), Plantation filter toggle, Government Schemes card, Documents Vault, dev environment setup, GitHub deployment.

### Next Task
- Add backend `.env` with real `GEMINI_API_KEY` and `WEATHER_API_KEY` values (currently missing — required for production/demo).
- Full hardware integration test with real ESP32 data (depends on teammate).
- Deploy to hosting (Vercel/Netlify frontend, Render/Railway backend), record demo video, finalize README.
