import { beforeEach, expect, it } from 'vitest';
import { availability, bookFromAvailability, checkAvailability, reservations, selectedService, selectedStart } from '../src/state/booking.js';

beforeEach(() => { reservations([]); availability(null); selectedService('soundprint'); selectedStart('2026-10-06T14:00:00-04:00'); });
const response = (start = selectedStart()) => ({ json: async () => ({ ok: true, holdId: 'test-hold', service: { id: 'soundprint' }, start }) });

it('cannot book a hold after the selected slot changes', async () => {
  await checkAvailability(async () => response());
  selectedStart('2026-10-08T14:30:00-04:00');
  expect(bookFromAvailability()).toBeNull();
  expect(reservations()).toEqual([]);
});

it('discards an availability response for an obsolete draft', async () => {
  let finish;
  const request = checkAvailability(() => new Promise((resolve) => { finish = resolve; }));
  selectedStart('2026-10-08T14:30:00-04:00');
  finish(response('2026-10-06T14:00:00-04:00'));
  await request;
  expect(availability()).toBeNull();
  expect(bookFromAvailability()).toBeNull();
});
