# rules.md — Guardrails for AI-Assisted Coding

## Use
- Prebuilt SDKs only: Firebase SDK, official Gemini SDK, Express, dotenv, cors.
- Single-file backend (server.js) for speed — no over-engineering routes into
  separate files unless it gets unmanageable.
- Tailwind only for styling, match design.md tokens.
- Firebase field names must match architecture.md exactly.

## Avoid
- No hardcoded API keys anywhere in frontend code.
- No voice/audio features.
- No live government scheme scraping, real complaint routing, cost/profit
  estimation, or market price logic — out of scope.
- No new libraries without asking first.
- No fake/placeholder data shown as if it's real or complete in the demo.

## Error handling
- Every API call wrapped in try/catch, clear fallback message.
- "Sensor offline" shown if ESP32 data timestamp is older than 5 minutes.
- Guest mode data is temporary, cleared on refresh/exit.

## Speed rules (1-day build)
- One task per prompt, test before moving to next.
- Keep components/files minimal — combine into fewer files where reasonable
  instead of over-splitting, to save build time today.
- Don't reload full file context every prompt if already loaded this session.
