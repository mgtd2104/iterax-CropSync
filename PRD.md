# PRD.md — IteraX-CropSync Project Requirements Document

## What we're building
IteraX-CropSync is an AI-powered farm advisory web app connected to a real-time
ESP32 field sensor unit. It gives farmers automatic, sensible defaults for crop
and irrigation decisions, with manual override. Supports seasonal crops and
plantation crops (coffee, mango, etc.) in a simplified single view. Includes
AI crop/sensor advisory, photo-based disease detection, and an AI chat
assistant — all powered by Gemini 2.5 Flash.

## Target users
- Primary: small/marginal Indian farmers, low-to-moderate tech literacy.
- Secondary: OOSC 4.0 hackathon judges — live hardware-AI interaction matters
  as much as farmer usability.

## Core features (submission scope)
- Login / Sign up / Guest mode (Firebase Auth).
- Onboarding: state/district, language, farming type.
- Dashboard: Crop Cards (seasonal + plantation, filterable by type).
- Live Sensor Panel fed by ESP32 via Firebase (moisture, rain, temp,
  humidity, light, tank level), "Sensor offline" fallback if stale.
- AI Advisory: button-triggered Gemini text advisory based on live sensor
  data + crop type, shown on Dashboard.
- Disease Detection: photo upload/capture, sent to Gemini vision, returns
  plain-language analysis.
- AI Chat: text chat assistant with awareness of current sensor data +
  crop type as context.
- Government Schemes card: static list of real official scheme links,
  opens in new tab. No filtering/live data.
- Placeholder cards for Documents and Notifications (empty, no logic).
- Complaint form: saves to Firebase with status field, no real routing.

## Explicitly out of scope
- Voice input/output.
- Tool inventory management.
- Market "where to sell" / best-price suggestions.
- Live government scheme auto-notifications.
- Complaint routing to actual departments.
- Cost/profit estimation (cut for time — future scope).

## Plantation tracking (simplified)
Plantation crops use the same CropCard component and same mock/live data
array as seasonal crops, distinguished only by a crop_category field
("seasonal" / "plantation") and a client-side filter toggle
(All / Seasonal / Plantation). No separate multi-year tracking system.

## Success criteria for submission
- Dashboard, live sensor panel, AI advisory, disease detection, and chat all
  functionally working end-to-end with real ESP32 data.
- Every feature shown in the demo video is real and functional.
- Anything not finished in time is left out of the video, not shown as if
  working.
