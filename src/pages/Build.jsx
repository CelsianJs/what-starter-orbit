export default function Build() {
  return (
    <article class="build page-enter">
      <p class="eyebrow">Agent reference</p>
      <h1>How Orbit is built.</h1>
      <section><h2>1. Shared studio data</h2><p><code>src/data/studio.js</code> owns services, deterministic October 2026 slots, timezone display helpers, overlap math, and ICS text generation. UI display uses <code>findService</code> with a fallback; API validation uses strict lookup.</p></section>
      <section><h2>2. Signals and computed state</h2><p><code>src/state/booking.js</code> owns <code>selectedService</code>, <code>selectedDate</code>, <code>selectedStart</code>, <code>guestName</code>, <code>availability</code>, <code>status</code>, and <code>reservations</code> as What signals. <code>slotsForDate</code>, <code>activeReservations</code>, and <code>selectedServiceDetails</code> are computed accessors read inside renders.</p></section>
      <section><h2>3. Effects and local persistence</h2><p>A persistence effect stores sanitized reservations to localStorage and reports denied writes through a reactive header notice. The app remains a private local demo; it does not claim shared booking inventory.</p></section>
      <section><h2>4. Router and Vura packaging</h2><p><code>src/routes.js</code> defines studio, services, booking, reservations, build, and 404 routes. <code>scripts/build-vura.mjs</code> writes direct static pages, bundles <code>/api/availability</code>, and emits <code>dist/manifest.json</code>.</p></section>
      <section><h2>5. Serverless availability validation</h2><p>The client posts service id, start time, and local reservations to <code>/api/availability</code>. The API validates the selected service, validates local reservation service ids strictly, checks the start against published slots, and runs overlap math against demo holds and active local reservations.</p></section>
      <section><h2>6. Before/after bug fix</h2><p>Code review found that the API used the display helper <code>findService</code>, which falls back to Soundprint. A malformed posted reservation could become a phantom Soundprint conflict. The fix added <code>findServiceStrict</code>, rejects unknown local reservation service ids with 422, and added regression tests for unknown ids plus valid conflicts.</p></section>
      <section><h2>7. ICS safety and proof</h2><p>The first ICS export used a <code>data:</code> href and What stripped it for safety. The current implementation uses a button that creates a temporary Blob URL and revokes it after click. Verification uses <code>npm ci && npm test</code>, <code>npm run build</code>, and <code>npm run smoke</code> for booking, API validation, reservation ledger, ICS control, real 404, and desktop/mobile screenshots.</p></section>
      <section><h2>8. Production extension points</h2><p>Add auth, durable tenant calendars, idempotent holds, server-validated reschedules, reminders, staff ownership, and server-side ICS/email delivery before treating Orbit as a production booking system.</p></section>
    </article>
  );
}
