# Honda Safe Journey — PRD

## Original Problem Statement
Connected-mobility safety web app for Honda 2-wheeler & 4-wheeler owners (India). User logs in with Google, picks vehicle type, enters vehicle details, connects Bluetooth (simulated) for energy levels, manages a Document Wallet (Aadhaar, Insurance, PUC, Medical, RC, License) with per-document sharing settings (Police/112, Family, Dealer, Insurer), sets emergency family contacts, then starts a journey (Point A→B, distance/ETA, optional pre-check) with a live navigation cockpit (real map + moving marker). Simulated safety events: accident detection, route deviation, ETA delay → "Are you safe?" check-in → SOS to 112 VSSR + family + Honda dealer (shares Aadhaar + live location). On arrival, family auto-notified and journey closes. One-tap insurance claim pulls wallet data to an insurer. Separate Dealer (Honda Service Center) login = command center for all vehicle activity/SOS/incidents. Production-grade UI, full E2E flow.

## Architecture
- Frontend: React 19 + react-router-dom, Tailwind + shadcn/ui, lucide-react, Leaflet (keyless OSM tiles + CSS dark filter). Honda dark automotive theme.
- Backend: FastAPI (`/api` prefix) + MongoDB (motor). Routing via OSRM, geocoding via Nominatim (both with fallbacks).
- Auth: Emergent-managed Google OAuth; session_token httpOnly cookie (7d) + Bearer fallback. Role on user record (`user` | `dealer`), chosen on landing page.

## User Personas
- Rider/Driver (Vehicle Owner): sets up vehicle & safety net, takes safe journeys.
- Honda Service Center Dealer: monitors fleet, responds to SOS/incidents.

## Implemented (2026-06)
- Google login with role split (user/dealer) + role-gated routes.
- Vehicle onboarding (2W/4W, model, reg, VIN, powertrain).
- Simulated Bluetooth telemetry sync (energy %, range, diagnostics).
- Document Wallet: add/delete docs + optional image upload, 4 per-doc sharing toggles (persisted).
- Emergency family contacts CRUD + test-alert preview.
- Start Journey: preset + Nominatim search locations, OSRM route/distance/ETA, optional readiness pre-check.
- Live cockpit: real map, animated moving marker, telemetry cluster, event feed, pause/resume.
- Simulations: route deviation (raises dealer incident), ETA delay, accident. Safety check-in modal w/ 15s countdown → confirm safe or escalate SOS.
- SOS panel: dispatch to 112 ERSS/VSSR + family + Honda dealer, broadcast payload (Aadhaar/medical/location/contacts), cancel.
- Safe arrival: auto family notification + trip summary + close journey.
- One-tap insurance claim (FNOL) auto-assembled from wallet + telematics, insurer selection, claim ref.
- Dealer command center: stats, filterable incident feed, incident detail (shared data + journey activity timeline + map), acknowledge/resolve.

## Verified
- Backend E2E via curl (all flows incl. SOS Aadhaar/112/family/dealer sharing, claim, dealer stats, 403 role gating).
- Frontend E2E via testing agent: 21/22 checks passed; map tiles fixed (Carto→OSM).

## Update (Jun 2026) — Vehicle OEM/Model catalog
- Added Indian-market OEM catalog in `/app/frontend/src/lib/vehicleData.js` (2W + 4W, brand → models).
- Onboarding now cascades: Type → Manufacturer (OEM, searchable dropdown) → Model (filtered by OEM).
- Backend `VehicleIn` gained optional `make` field; `vehicle_label` now prefixes make (journeys + incidents).
- Verified: backend curl (POST/GET /api/vehicle persists make) + frontend screenshot (Tata Motors → filtered models).

## Update (Jun 2026) — Aadhaar removal from SOS & Command Center
- Removed Aadhaar & Medical from incident `shared_data` (backend now only phone, holder, contacts).
- SOS Broadcast Payload (LiveJourney) & dealer Shared Emergency Data (DealerDashboard) now show only Rider Phone, Location, Contacts.
- Verified 100% by testing agent (iteration_5.json; pytest suite /app/backend/tests/test_sos_no_aadhaar.py).

## Update (Jun 2026) — Feature batch: medical profile, live map, model search
- Claim Aadhaar purged from `create_claim` package (backend) and Claim.jsx preview.
- Rider Medical Profile: `blood_group` + `allergies` in SettingsIn/_settings_view; Settings.jsx UI; injected into incident `shared_data`; surfaced in SOS Broadcast Payload + dealer detail modal.
- Live Fleet Map: new `GET /api/dealer/active-map`; LeafletMap gained `markers` prop (multi-marker + fitBounds); DealerDashboard "Live Fleet Map" section (red = emergency).
- Onboarding model search box (`model-search-input`) filters model grid.
- Verified 100% by testing agent (iteration_6.json; pytest /app/backend/tests/test_feature_batch_medical_map.py).

## Update (Jun 2026) — Silent SOS emergency audio
- Integrated Emergent Object Storage (helpers init_storage/put_object/get_object; startup init; EMERGENT_LLM_KEY in backend .env).
- On SOS/accident, browser records up to 60s audio (mic consent requested once at journey start) and uploads via `POST /api/journeys/{id}/sos-audio`; stored in object storage + db.sos_audios; journey gains `sos_audio` array.
- Public playback: `GET /api/track/{share_token}/audio/{audio_id}` (share-token gated, unauth) — family tracking page renders `<audio>` players. NOT shown to dealer.
- SOS panel shows a live "Recording… Ns/60s" indicator + manual Stop & Send; graceful fallback when mic unavailable.
- Verified 100% by testing agent (iteration_7.json; pytest /app/backend/tests/test_sos_audio.py).

## Update (Jun 2026) — Rebrand copy: remove vault/telemetry/112 ESRS/route-intel
- Removed Encrypted Document Vault (deleted Wallet.jsx + BluetoothSync.jsx orphan pages; purged unused imports/docs fetch).
- Landing: replaced 4 chips (Encrypted Vault/Live Telemetry/112 VSSR SOS/Route Intel) with 5 (Safe Journey, Live Tracking, Family Sharing, Auto Check-In, Auto Recording); rewrote hero copy + disclaimer (no telemetry/vault/112 ERSS).
- Removed "112 ERSS" from SOS event text (LiveJourney) and backend incident `shared_with` (now "Emergency Services").
- Claim copy no longer mentions Document Wallet; fallbacks say "Not on file".
- Verified via desktop + mobile screenshots (no overflow); grep confirms no wallet/vault/telemetry/112 ERSS/route-intel strings remain in src.

## Update (Jun 2026) — Landing: track preview + "How it protects you"
- Replaced static hero image with an animated SVG live-tracking preview (`TrackPreview`): dashed route, green origin / blue destination, moving red vehicle dot (animateMotion) + pulse, LIVE/SHARING badges.
- Added scrollable "How it protects you" section (`how-it-protects`): 5 snap cards (Safe Journey, Live Tracking, Family Sharing, Auto Check-In, Auto Recording) with explainers; `.hsj-scroll` styled scrollbar.
- Verified desktop + mobile screenshots; body horizontal overflow = 0 (card row is an intentional swipe container).

## Update (Jun 2026) — Simulated 112/ERSS AI auto-dispatch + family call
- Family tracking page: one-tap "Call 112 / ERSS" button (`track-call-erss-button`) → logs event + `tel:9620910910`; shows AI-auto-reported note.
- On SOS/accident, user app auto-generates an AI dispatcher incident report (emergentintegrations, openai/gpt-5.4-mini, deterministic fallback) and simulates a call + email to ERSS (narendra.macherla@ndvtechsys.com / 9620910910). Email body carries GPS + Google maps link, rider details, emergency contacts; audio clip attaches to the report after upload.
- `erss_report` stored on incident; surfaced in Live SOS panel (`sos-erss-report`) and dealer detail (`dealer-erss-report`). Public track exposes `erss` + `POST /api/track/{token}/erss-call`. All SIMULATED — no real calls/emails sent.
- Verified 100% by testing agent (iteration_8.json; pytest /app/backend/tests/test_erss_ai_dispatch.py). Fixed duplicate React key on contacts lists.

## Update (Jun 2026) — Audio recording on ALL SOS scenarios
- `escalateSOS` now starts silent audio recording for every incident type (crash/manual SOS + Route Deviation + ETA/Traffic Delay), not just accident/sos.
- SOS panel recorder block gate relaxed from accident/sos to `{sos && …}` so it shows for deviation/delay too; upload endpoint is type-agnostic and clips appear on the family track page.

## Backlog (P1/P2)
- Real SMS/email to family/112 (Twilio/SendGrid) — currently simulated in-app.
- Voice-activated SOS ("Honda, help me").
- Hands-free/offline connectivity-loss detection.
- Dealer live map of all active journeys; incident notes & callback logging.
- Claim media upload + claim status tracking.

## Notes
- Notifications are SIMULATED in-app (no real SMS/email).
- Bluetooth energy levels are SIMULATED.
- Test sessions/credentials: /app/memory/test_credentials.md and /app/auth_testing.md.
