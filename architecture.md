# architecture.md — App Flow, Structure & Tech Stack

## Tech stack
- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express (single server.js — advisory, disease-detect,
  chat routes)
- Database: Firebase Realtime Database
- Auth: Firebase Authentication (email/phone + anonymous for guest mode)
- Storage: Firebase Storage (crop/disease photos)
- AI: Gemini 2.5 Flash API (text + vision)
- Weather: OpenWeatherMap API
- Location: browser Geolocation API + manual override
- Hosting: Vercel (frontend) + Render/Railway (backend)

## App flow

Landing -> Login / Sign Up / Guest Mode
  -> Onboarding (state, district, language, farming type) [first-time only]
  -> Dashboard
       - Crop Cards (seasonal + plantation, filter toggle)
       - Live Sensor Panel (Firebase listener)
       - "Get AI Advisory" button -> advisory card
       - Schemes card (static links)
       - Placeholder: Documents, Notifications
       - Complaint button -> simple form -> Firebase log
  -> Disease Detection page (photo upload -> Gemini vision -> analysis)
  -> Chat page (text chat, context-aware via sensor+crop data)

## Folder structure

iterax-cropsync/
  frontend/
    src/
      pages/       (Landing, Onboarding, Dashboard, DiseaseDetection, Chat)
      hooks/       (useSensorData, useFirebaseAuth)
      services/    (firebase.js, api.js)
  backend/
    server.js      (all routes: /api/advisory, /api/disease-detect, /api/chat)
  PRD.md
  architecture.md
  rules.md
  phases.md
  design.md

## Firebase schema (shared contract with ESP32 firmware)

/devices/esp32_unit_1/sensors
    moisture_pct, rain_detected, rain_intensity, air_temp_c,
    humidity_pct, light_pct, tank_level_pct, timestamp
/devices/esp32_unit_1/alerts
    low_moisture, tank_empty, rain_warning
/devices/esp32_unit_1/commands
    pump_override (bool), pump_status (string)

/users/{uid}/profile
    state, district, language, farming_type, is_guest

/users/{uid}/plots/{plotId}
    plot_name, soil_type, land_area, crop_type,
    crop_category (seasonal/plantation), start_date, end_date

/complaints/{complaintId}
    uid, description, status, timestamp

## Backend API routes

| Route | Purpose |
|---|---|
| POST /api/advisory | sensor_data + crop_type + language -> Gemini text advisory |
| POST /api/disease-detect | image_base64 + crop_type + language -> Gemini vision analysis |
| POST /api/chat | message + context + language -> Gemini reply |
 
 