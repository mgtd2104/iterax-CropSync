# AgriSense — Memory & Progress Log

## Project Summary
AgriSense is an AI-powered farm advisory web application connected to a real-time ESP32 field sensor unit.

---

## What Is Done & Included in Project

### 1. Planning & Specifications (`agrisense-repo/`)
- `PRD.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`
- `README.md` & `memory.md`

### 2. Phase 1: Firebase, Auth & Onboarding (`agrisense-repo/frontend/`)
- **Frontend Stack**: React (Vite), Tailwind CSS, React Router DOM, Firebase SDK, Recharts
- **Design System**: Configured theme colors in `src/index.css`
- **Firebase Services**: Realtime Database, Auth, Storage
- **Authentication**: Email/password sign up/login + Anonymous Guest mode
- **Location**: Geolocation API with manual fallback
- **Pages**: Landing, Onboarding, and Dashboard shell

---

## Current Status
- **Completed**: Phase 1
- **Next Phase**: Phase 2 — Dashboard shell + Crop cards + Live Sensor panel (ESP32 Firebase integration)
