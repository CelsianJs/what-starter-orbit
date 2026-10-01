# Orbit

Orbit is a public What Framework starter for a creative appointment studio. It demonstrates service durations, timezone-aware slot display, local private reservations, serverless availability validation, reschedule/cancel controls, and ICS export.

Planned public source: `https://github.com/CelsianJs/what-starter-orbit`

Read the detailed implementation guide in [`BUILD.md`](./BUILD.md), or run the app and open `/build`.

## Requirements

- Node.js 22
- npm 10+

## Run locally

```bash
npm ci
npm run dev
```

## Verify

```bash
npm test
npm run build
npm run smoke
```

`npm run smoke` builds the Vura-shaped output, starts a local preview server, books a local reservation through `/api/availability`, verifies the reservations ledger and ICS link, checks a real 404, and writes screenshots to:

- `/tmp/orbit-desktop.png`
- `/tmp/orbit-mobile.png`

## Deploy to Vura

```bash
npm run build
npx vura-platform deploy
```

Use production only after the Vura project is ready:

```bash
npx vura-platform deploy --prod
```

The build emits:

- `dist/static` for static pages.
- `dist/functions/api_availability/index.js` for the serverless availability endpoint.
- `dist/manifest.json` mapping static pages and `/api/availability` for Vura.

## Demo boundaries

Orbit does not authenticate users, write to a shared calendar, send reminders, or reserve durable inventory. Reservations are browser-local. The API validates against bundled demo holds and posted local reservations so agents can copy the serverless boundary honestly.

## Production next steps

- Add auth-scoped reservation ownership.
- Store holds and bookings in a durable transactional backend.
- Add idempotent hold expiration.
- Connect a real calendar provider or staff schedule table.
- Send server-owned ICS/email reminders after booking confirmation.
