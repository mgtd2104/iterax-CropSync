# PRD.md — AgriSense Project Requirements Document 
 
 ## What we're building 
 AgriSense is an AI-powered farm advisory web app connected to a real-time ESP32 field 
 sensor unit. It gives farmers — who may have low tech literacy — automatic, sensible 
 defaults for crop and irrigation decisions, with the option to override manually. It 
 supports both seasonal crops and long-term plantation crops (coffee, tea, mango etc.), 
 gives cost/profit estimates, surfaces government schemes, detects pests/disease from 
 photos, and responds via text chat in the farmer's own language. 
 
 ## Target users 
 - Primary: small/marginal Indian farmers, varying literacy and tech comfort, regional 
   language speakers. 
 - Secondary: hackathon judges/demo evaluators (OOSC 4.0) — UI clarity and live 
   hardware–AI interaction matter as much as farmer usability. 
 
 ## Core features (MVP — must work for submission) 
 - Guest mode + Sign up / Login (Firebase Auth), one-time onboarding: state/district, 
   language, farming type (organic/inorganic). 
 - Location capture (navigator.geolocation, with manual override dropdown). 
 - Seasonal crop recommendation: user gives soil type + land area → AI uses 
   weather/climate API + season/date → recommends crops + irrigation plan + precautions. 
 - Live sensor dashboard fed by ESP32 (moisture, rain, temp, humidity, light, tank 
   level) with local-language AI advisory. 
 - Manual irrigation trigger (relay override) reflected live from hardware. 
 - Disease/pest detection via photo upload (phone camera) using Gemini vision. 
 - AI chat assistant that has context of the farmer's data (location, crops, sensor 
   history), multilingual (text only, no voice). 
 - Hardware alert → AI explains the alert in plain language, shown as an in-app 
   notification. 
 
 ## Extended features (build where time allows, kept 100% real — no fake data) 
 - Plantation (multi-year crop) tracking across multiple land plots (Land A/B/C). 
 - Cost estimate: seed/fertilizer/water cost vs expected yield → rough regional profit 
   estimate. No tool-inventory check, no "where to sell" suggestion (needs real mandi 
   data — out of scope). 
 - Government schemes directory: static curated dataset (~10–15 real schemes with 
   working links), filtered by user's state/district. Clicking a scheme redirects to 
   the actual official government portal in a new tab. No live auto-notification on 
   new schemes (needs a real government data feed — out of scope). 
 - Complaint/query form: logs submission to Firebase with a status field. No real 
   routing/notification to any government department (not buildable without official 
   system access). 
 - Document storage box (farmer's certificates/records, Firebase Storage). 
 - Post-harvest soil recovery guidance (Gemini prompt using existing crop history). 
 - Toll-free central govt farmer helpline number shown in dashboard (static). 
 
 ## Explicitly removed from scope 
 - Voice input/output (Web Speech API / mic button) — removed, text-only chat instead. 
 - Tool inventory management. 
 - Market "where to sell" / best-price-location suggestions. 
 - Live government scheme scraping / auto-notifications. 
 - Complaint routing to actual department officials. 
 
 ## Non-goals for this hackathon round 
 - No native mobile app — responsive web app only (works on phone browser). 
 - No payment/marketplace transactions — only price/profit *estimates*. 
 - No real-time government scheme API integration — curated dataset + manual links. 
 
 ## Success criteria for submission 
 - Phases 1–5 (see phases.md) fully working end-to-end with real ESP32 hardware data. 
 - Every feature shown in the demo video is real and functional — nothing faked. 
 - Extended features either genuinely working or clearly out of the demo, not 
   half-built and shown as complete. 
 