# Orbit build journal

Status: ready for root review, source publication, and Vura deployment.

Planned public source: `https://github.com/CelsianJs/what-starter-orbit`

## What this starter shows

- Static routes for `/`, `/services`, `/book`, `/reservations`, `/build`, and `/404`.
- A serverless endpoint at `/api/availability` that reads bounded streamed JSON, validates service and slot selections, and rejects local/demo conflicts.
- What signals for selected service, selected date, selected slot, guest name, availability result, status copy, and reservations.
- What computed accessors for active reservations, selected service details, and slots by date.
- A What effect that persists reservations to localStorage and falls back to session memory on denied writes.
- ICS export generated from local reservation data through a safe Blob URL button.

## Architecture map

| Concern | Source | Learning point |
| --- | --- | --- |
| Service and time data | `src/data/studio.js` | Services, slots, timezone formatting, overlap math, and ICS text live in pure shared code. |
| Shared state | `src/state/booking.js` | Signals model the booking draft and reservation ledger; computed accessors derive active reservations and slots by date. |
| API validation | `src/api/availability.js` | The serverless function validates the posted client context; it does not trust local reservation data blindly. |
| Router | `src/routes.js` | Programmatic routes keep the booking flow small and direct-addressable. |
| Vura package | `scripts/build-vura.mjs` | The build writes static aliases, bundles `/api/availability`, and emits a manifest for Vura. |
| Vura config | `vura.json` | Header catch-alls use Vura's `(.*)` route matcher and avoid unsupported top-level rewrites. |
| Browser QA | `scripts/smoke.mjs` | The smoke flow books a reservation, checks the ledger, verifies the ICS control, and confirms a real 404. |

## Actual implementation notes

Signals and computed values: `selectedService`, `selectedDate`, `selectedStart`, `guestName`, `availability`, `status`, and `reservations` are signals. `slotsForDate`, `activeReservations`, and `selectedServiceDetails` are computed values. The booking page reads accessors in render so service, date, and slot changes update immediately.

Effects and storage: `src/state/booking.js` sanitizes restored reservations, stores changes in localStorage, and falls back to memory if storage writes fail. The storage notice is itself a signal, so the header updates without a page reload.

Timezone handling: bundled slots include `-04:00` offsets and all display helpers format with `America/New_York`. The UI always renders `Eastern Time` next to slot choices so copied code does not silently show ambiguous local browser time.

Serverless boundary: the client posts `serviceId`, `start`, and local reservations to `/api/availability`. The API revalidates the service, checks the start against published slots, validates local reservation service IDs strictly, and runs overlap math against both bundled demo holds and active local reservations.

Design review repair: product-facing copy no longer prints the raw API path. The booking page says Orbit checks “the selected session, start time, and local holds,” while `/build` keeps `/api/availability` for implementers. The booking header uses a one-column page-head grid, the action row starts at the left, the form now has visible Service/Date/Time group labels, mobile keeps the local reservation chip near the wordmark, and the empty home orbit panel shows the next open slot instead of a giant `0`.

Deployment package boundary: `vura.json` keeps to the platform's known shape. The `/api/(.*)` header uses Vura's route matcher syntax; shell-style `*` globs are rejected. The build writes concrete route aliases plus `404.html`, so no top-level rewrite rule is needed. `scripts/build-vura.mjs` also writes `dist/functions/package.json` with `{ "type": "module" }` and validates required manifest fields (`filePath`, `config`, route flags, `timestamp`, and the non-empty serverless API mapping) before upload.

ICS export: the first implementation used a `data:text/calendar` href. What Framework correctly stripped that unsafe URL. The fix is a button that creates a temporary Blob URL at click time, triggers a download, and revokes the URL.

## Before/after validation fix

Before: `validateAvailability` used the UI helper `findService`, which intentionally falls back to the first service for display resilience. That meant a posted local reservation with `serviceId: "unknown-service"` became a fake Soundprint reservation and could create phantom conflicts.

After: `src/data/studio.js` exposes `findServiceStrict` for API boundaries. `src/api/availability.js` now rejects unknown local reservation service IDs with 422 and only checks overlaps for known services. UI fallback remains available for display-only code.

Regression tests added:

- Unknown local reservation service id rejects with `Local reservations must reference known Orbit services.`
- Valid local reservation conflicts still reject after strict lookup.

## Issues encountered and fixes

- Deterministic slots: October 2026 slots keep browser screenshots and API tests stable.
- ICS safety: unsafe `data:` href was stripped by the framework; Blob URL button fixed it.
- Strict API lookup: UI fallback caused a phantom-conflict possibility; API now uses strict lookup.
- Vura config upload: the first real-host upload failed before provisioning because `vura.json` used a shell-style `*` header glob and an unsupported top-level `rewrites` key. The fix changed the catch-all to `(.*)`, removed the rewrite, and added build-time manifest/package checks so config-shape drift fails locally.
- npm peer resolution: npm 10.9.9 can trip an arborist `edgesOut` error around Vitest optional browser peers. The local `.npmrc` sets `legacy-peer-deps=true`, and `npm ci` verifies the lockfile.

## Test proof

- `npm ci && npm test` passed after the strict lookup repair: 8 Vitest checks for open slots, demo holds, local conflicts, unknown service rejection, valid conflicts, ICS generation, overlap boundaries, malformed JSON, and oversized streamed bodies.
- `npm run build` passed: Vite bundle plus 6 Vura pages, `/api/availability`, required manifest fields, and `dist/functions/package.json`.
- `npm run smoke` passed: fresh root render, service cards, booking entrypoint, all primary nav links with browser back, visible service/slot controls before booking, `/api/availability`, reservation ledger, ICS button, real 404, desktop and mobile full-page screenshots.
- Screenshots: `/tmp/orbit-desktop.png`, `/tmp/orbit-mobile.png`.

Visual QA note: an earlier smoke captured after a subflow and could miss a blank home body. The later dim/ghost class of screenshot was treated as a timing risk: Cartograph diagnostics showed one header/brand, at-rest body/main opacity `1`, filter `none`, and finite `.page-enter` plus View Transition animations still running during the bad capture. Orbit also has decorative infinite orbit animations, so the current smoke waits for finite animations only, ignores decorative infinite loops, asserts meaningful root content before any subroute, and writes full-page home screenshots, so a nav-only or mid-transition render fails.

## Known limitations

- Reservations are private to the current browser.
- Demo holds are bundled fixtures, not shared calendar records.
- Reschedule is local and should be backed by another server validation step in production.
- No auth, durable DB, payment, staff roster, email, SMS, reminders, or multi-user locking is included.

## Production extension notes

- Add auth-scoped reservation ownership and a durable transactional calendar backend.
- Add idempotent server holds with expiration before confirming shared slots.
- Revalidate every reschedule on the server.
- Send server-owned ICS/email/SMS only after durable confirmation.
