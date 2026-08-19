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
- **Frontend Stack**: React (Vite) + Tailwind CSS + React Router DOM + Firebase SDK + Recharts
- **Design System**: Configured theme colors in `src/index.css` (#2D6A4F, #1B4332, #F8FAF7, #F1F7F3, #F4A300, #D64545, #222222)
- **Firebase Services (`src/services/firebase.js`)**: Realtime Database, Auth, Storage
- **Authentication (`src/hooks/useFirebaseAuth.js` & `src/context/UserContext.jsx`)**: Email/password sign up & login + Anonymous Guest mode
- **Location Detection (`src/hooks/useGeolocation.js`)**: Geolocation API with manual state/district fallback
- **Landing Page (`src/pages/Landing.jsx`)**: Auth form and guest entry
- **Onboarding Page (`src/pages/Onboarding.jsx`)**: State, district, language, farming type, soil type, land area, and crop setup. Saves to `/users/{uid}/profile` and `/users/{uid}/plots/plot_1`
- **Dashboard Shell (`src/pages/Dashboard.jsx`)**: Main profile display & sign out

---

## Current Status
- **Completed**: Phase 1
- **Next Phase**: Phase 2 — Dashboard shell + Crop cards + Live Sensor panel (ESP32 Firebase integration)
