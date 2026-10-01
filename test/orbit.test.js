import { describe, expect, it } from 'vitest';
import availabilityWorker, { validateAvailability } from '../src/api/availability.js';
import { readBoundedJson } from '../src/api/bounded-json.js';
import { createIcs, overlaps } from '../src/data/studio.js';

function streamOf(chunks) {
  let cancelled = false;
  let reads = 0;
  const stream = new ReadableStream({
    pull(controller) {
      const chunk = chunks[reads];
      reads += 1;
      if (chunk) controller.enqueue(chunk);
      else controller.close();
    },
    cancel() { cancelled = true; },
  });
  return { stream, stats: () => ({ cancelled, reads }) };
}

describe('Orbit availability API', () => {
  it('accepts an open service slot', () => {
    const result = validateAvailability({ serviceId: 'soundprint', start: '2026-10-06T14:00:00-04:00', reservations: [] });
    expect(result.ok).toBe(true);
    expect(result.holdId).toMatch(/^ORB-/);
  });

  it('rejects slots overlapping bundled demo holds', async () => {
    const response = await availabilityWorker.fetch(new Request('http://local/api/availability', {
      method: 'POST',
      body: JSON.stringify({ serviceId: 'release-map', start: '2026-10-06T15:30:00-04:00', reservations: [] }),
    }));
    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({ ok: false });
  });

  it('rejects local reservation conflicts by duration', () => {
    const result = validateAvailability({
      serviceId: 'motion-room',
      start: '2026-10-06T15:30:00-04:00',
      reservations: [{ id: 'r1', serviceId: 'soundprint', start: '2026-10-06T15:00:00-04:00', status: 'booked' }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('overlaps');
  });

  it('rejects unknown local reservation service ids instead of falling back to Soundprint', () => {
    const result = validateAvailability({
      serviceId: 'motion-room',
      start: '2026-10-06T18:00:00-04:00',
      reservations: [{ id: 'bad', serviceId: 'unknown-service', start: '2026-10-06T17:30:00-04:00', status: 'booked' }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('Local reservations must reference known Orbit services.');
    expect(result.errors.join(' ')).not.toContain('overlaps');
  });

  it('still detects valid local conflicts after strict service validation', () => {
    const result = validateAvailability({
      serviceId: 'soundprint',
      start: '2026-10-07T13:00:00-04:00',
      reservations: [{ id: 'good', serviceId: 'release-map', start: '2026-10-07T12:15:00-04:00', status: 'booked' }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain('overlaps');
  });

  it('generates ICS calendar text for local exports', () => {
    const ics = createIcs({ id: 'ORB-123', serviceId: 'soundprint', start: '2026-10-06T14:00:00-04:00' });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:Soundprint Session at Orbit Studio');
  });

  it('validates overlap boundaries', () => {
    expect(overlaps('2026-10-06T14:00:00-04:00', 45, '2026-10-06T14:44:00-04:00', 30)).toBe(true);
    expect(overlaps('2026-10-06T14:00:00-04:00', 45, '2026-10-06T14:45:00-04:00', 30)).toBe(false);
  });

  it('rejects malformed and oversized JSON', async () => {
    const bad = await availabilityWorker.fetch(new Request('http://local/api/availability', { method: 'POST', body: '{"serviceId":' }));
    expect(bad.status).toBe(400);
    const encoder = new TextEncoder();
    const { stream, stats } = streamOf([encoder.encode('{"x":"'), new Uint8Array(13_000).fill(65), encoder.encode('"}')]);
    await expect(readBoundedJson(new Request('http://local/api/availability', { method: 'POST', body: stream, duplex: 'half' }), 12_288)).rejects.toMatchObject({ status: 413 });
    expect(stats().cancelled).toBe(true);
  });
});
