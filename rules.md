# rules.md — Guardrails for AI-Assisted Coding 
 
 ## Use 
 - Prebuilt libraries wherever possible: Firebase SDK, react-firebase-hooks, 
   react-router-dom, Tailwind, Recharts. 
 - Keep components small and single-purpose; reuse SensorCard/CropCard/AlertToast 
   style patterns across pages. 
 - All Gemini/Weather API calls go through the backend only — never call third-party 
   AI/weather APIs directly from the frontend. 
 - Store all user-facing text behind a simple language map/object so translation swap 
   is centralized, not scattered across components. 
 - Firebase field names must exactly match the schema in architecture.md — this is a 
   shared contract with the hardware teammate, do not rename without telling them. 
 
 ## Avoid 
 - No custom auth/session logic — use Firebase Auth as-is. 
 - No custom CSS framework from scratch — Tailwind only. 
 - No hardcoded API keys in frontend code, ever — .env + backend proxy only. 
 - No blocking synchronous calls in the UI thread for AI responses — always show a 
   loading/typing state. 
 - No building live government scheme scraping, real complaint routing, market 
   price/sell-location logic, or tool-inventory management — explicitly out of scope. 
 - No voice/audio features (Web Speech API) — explicitly removed from scope. 
 
 ## Error handling 
 - Every API call (Gemini, Weather, Firebase write) wrapped in try/catch, with a 
   user-friendly fallback message in the user's selected language. 
 - If ESP32 hasn't pushed data in more than 5 minutes, dashboard shows 
   "Sensor offline" instead of stale/blank data. 
 - Guest mode data writes to a temporary path (or local state only) and is explicitly 
   cleared on unmount/refresh — never persisted to permanent user records. 
 
 ## Boundaries for the AI coding tool 
 - One phase at a time (see phases.md) — do not jump ahead and half-build later phases. 
 - After every phase, manually test the specific feature before moving on. 
 - Ask before introducing a new external dependency/library not already listed in 
   architecture.md. 
 - Every feature built must be genuinely functional with real data flow — no 
   placeholder/fake data presented as if it were live or complete. 
 