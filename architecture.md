# architecture.md — App Flow, Structure & Tech Stack 
 
 ## Tech stack 
 - Frontend: React (Vite) + Tailwind CSS 
 - Backend: Node.js + Express (proxy for Gemini/weather calls, keeps API keys server-side) 
 - Database: Firebase Realtime Database 
 - Auth: Firebase Authentication (email/phone + anonymous auth for guest mode) 
 - Storage: Firebase Storage (crop photos, documents) 
 - AI: Gemini 2.5 Flash API (text + vision, multimodal, multilingual by prompt) 
 - Weather/Climate: OpenWeatherMap API (current + forecast, free tier) 
 - Location: browser Geolocation API (navigator.geolocation) + manual 
   state/district dropdown fallback 
 - Hosting: Vercel (frontend) + Render/Railway (backend) 
 
 ## High-level app flow 
 
 Landing Page 
   -> [Login] / [Sign Up] / [Guest Mode] 
        (Guest: Firebase anonymous auth, session data cleared on exit/refresh) 
 
 First-time only (skipped if profile exists): 
   -> Select State + District (geolocation autofill, editable) 
   -> Select Language (used for all AI text responses) 
   -> Select Farming Type: Seasonal / Plantation / Both 
   -> Seasonal: enter soil type + land area (per plot) 
   -> Plantation: enter plantation type(s) + land plot IDs (A/B/C) 
   -> AI auto-generates first recommendation set (editable later) 
 
 Main Dashboard (after onboarding): 
   -> Crop cards (organic/inorganic tag, start-end date, land plot) 
   -> Click crop -> Crop Detail Page (history, fertilizers, diseases, 
      irrigation log, manual water trigger, yield/profit estimate, next-step advisory) 
   -> Live Sensor Panel (from ESP32 via Firebase) 
   -> AI Chat box (left) + Documents box (right) 
   -> Govt Schemes box (below, filtered by location, click -> redirects to official portal) 
   -> Notifications (hardware alerts explained in plain language) 
   -> Complaint/Query button (logs to Firebase, status shown, no real routing) 
   -> Side menu: Profile, Settings, Disease Detection, Weather Alerts 
   -> Language switcher available anytime (not locked to onboarding choice) 
 
 ## Folder structure 
 
 agrisense/ 
   frontend/ 
     src/ 
       pages/          (Landing, Onboarding, Dashboard, CropDetail, 
                         Chat, DiseaseDetection, Schemes, Profile, Settings) 
       components/      (SensorCard, CropCard, ChatBox, DocBox, 
                         SchemeCard, AlertToast, LanguageSwitcher, MapPicker) 
       hooks/           (useFirebaseAuth, useSensorData, useGeolocation) 
       services/        (api.js, firebase.js) 
       context/         (UserContext, LanguageContext) 
       App.jsx, main.jsx 
     package.json 
 
   backend/ 
     routes/            (advisory.js, weather.js, disease.js, chat.js, 
                          irrigation.js, schemes.js, complaints.js) 
     services/          (geminiService.js, weatherService.js, firebaseAdmin.js) 
     server.js 
     package.json 
 
   PRD.md 
   architecture.md 
   rules.md 
   phases.md 
   design.md 
 
 ## Firebase schema (shared contract with ESP32 firmware — do not rename fields) 
 
 /devices/esp32_unit_1/sensors 
     moisture_pct, rain_detected, rain_intensity, air_temp_c, 
     humidity_pct, light_pct, tank_level_pct, timestamp 
 /devices/esp32_unit_1/alerts 
     low_moisture, tank_empty, rain_warning 
 /devices/esp32_unit_1/commands 
     pump_override (bool, written by app), pump_status (string, written by ESP32) 
 
 /users/{uid}/profile 
     state, district, language, farming_type, is_guest 
 
 /users/{uid}/plots/{plotId} 
     plot_name, soil_type, land_area, crop_type, crop_category (seasonal/plantation), 
     start_date, end_date, fertilizers_used[], disease_history[], irrigation_log[] 
 
 /users/{uid}/advisory_logs/{timestamp} 
     advisory_text, image_url, sensor_snapshot 
 
 /schemes/{schemeId} 
     title, state, category, description, link, posted_date 
 
 /complaints/{complaintId} 
     uid, department, description, status, timestamp 
 
 ## API list 
 
 | API / Service | Purpose | Cost | 
 |---|---|---| 
 | Gemini API (2.5 Flash) | Crop recommendation, sensor advisory, disease detection (vision), chat | Free tier | 
 | OpenWeatherMap API | Current weather + forecast | Free tier | 
 | Firebase Realtime Database | Sensor data, user profiles, plots, advisory logs, complaints | Free (Spark) | 
 | Firebase Authentication | Login/signup/guest (anonymous auth) | Free | 
 | Firebase Storage | Crop/leaf photos, farmer documents | Free tier | 
 | Browser Geolocation API | Auto-detect location, manual override dropdown | Free, built-in | 
 
 