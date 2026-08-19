# AgriSense — Project Memory & Progress Log

## Project Overview
AgriSense is an AI-powered farm advisory web app connected to a real-time ESP32 field sensor unit. It provides automated crop and irrigation guidance, disease detection, live sensor dashboards, government scheme access, and multilingual AI text chat.

---

## Completed Tasks

### 1. Repository Setup & Planning
- Created project directory `agrisense-repo/` with initial planning documents:
  - `PRD.md` — Product Requirements Document
  - `architecture.md` — Architecture, Tech Stack, & Firebase Schema
  - `rules.md` — AI Development Guardrails
  - `phases.md` — Phased Implementation Roadmap
  - `design.md` — Visual Design System Specifications
  - `README.md` — Project Readme
- Initialized Git repository in `agrisense-repo/` with initial commit.

### 2. Phase 1: Firebase Setup, Auth (Login / Sign Up / Guest), and Onboarding Flow
- **Frontend Environment**:
  - React (Vite) + Tailwind CSS configured in `frontend/`.
  - Dependencies installed: `firebase`, `react-router-dom`, `react-firebase-hooks`, `recharts`, `@tailwindcss/vite`.
  - Configured design system color variables in `src/index.css` matching `design.md` (`#2D6A4F`, `#1B4332`, `#F8FAF7`, `#F1F7F3`, `#F4A300`, `#D64545`, `#222222`).
- **Services & Context**:
  - `src/services/firebase.js`: Firebase App, Auth, Realtime Database, and Storage initializers.
  - `src/hooks/useFirebaseAuth.js`: Email/password login, email/password signup, anonymous guest login, and logout.
  - `src/hooks/useGeolocation.js`: Browser geolocation API integration with manual state/district fallback.
  - `src/context/UserContext.jsx`: Global user authentication and profile context wrapper.
- **Pages & Components**:
  - `src/pages/Landing.jsx`: Sign in / Sign up form and "Continue as Guest" trigger.
  - `src/pages/Onboarding.jsx`: 2-step onboarding capturing state, district, language, farming type (Seasonal/Plantation/Both), soil type, land area, and crop type. Saves data to `/users/{uid}/profile` and `/users/{uid}/plots/plot_1`.
  - `src/pages/Dashboard.jsx`: Base dashboard showing authenticated/guest user profile details and sign-out option.
- **Build Status**:
  - Verified production build via `npm run build` — 0 errors.

---

## Current Status & Next Steps
- **Completed**: Phase 1
- **Next Phase**: Phase 2 — Dashboard Shell + Crop cards (mock data) + Live Sensor panel wired to Firebase Realtime Database (`/devices/esp32_unit_1/sensors`).
