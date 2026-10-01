import { baseSlots, findServiceStrict, heldSlots, overlaps, services } from '../data/studio.js';
import { readBoundedJson } from './bounded-json.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export function validateAvailability(payload) {
  const service = findServiceStrict(payload?.serviceId);
  const start = String(payload?.start || '');
  const localReservations = Array.isArray(payload?.reservations) ? payload.reservations.slice(0, 30) : [];
  const errors = [];

  if (!service) errors.push('Choose a known Orbit service.');
  if (!baseSlots.includes(start)) errors.push('Choose one of the published studio slots.');
  if (Number.isNaN(new Date(start).getTime())) errors.push('Slot must be an ISO date-time.');

  const activeLocal = [];
  for (const reservation of localReservations) {
    if (!reservation || reservation.status === 'cancelled') continue;
    const reservationService = findServiceStrict(reservation.serviceId);
    if (!reservationService) {
      errors.push('Local reservations must reference known Orbit services.');
      continue;
    }
    activeLocal.push({ start: String(reservation.start || ''), duration: reservationService.duration });
  }
  const duration = service?.duration || 0;
  const conflict = [...heldSlots, ...activeLocal].find((reservation) => overlaps(start, duration, reservation.start, reservation.duration));
  if (conflict) errors.push(`That ${service?.duration || ''}-minute session overlaps an existing local or demo hold.`);

  return {
    ok: errors.length === 0,
    errors,
    service: service ? { id: service.id, name: service.name, duration: service.duration, price: service.price } : null,
    start,
    holdId: errors.length ? null : `ORB-${Math.abs(new Date(start).getTime() / 60000).toString(36).toUpperCase()}`,
  };
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return json({ ok: false, error: 'POST serviceId, start, and local reservations.' }, 405);
    try {
      const result = validateAvailability(await readBoundedJson(request));
      return json({ ...result, checkedAt: new Date().toISOString() }, result.ok ? 200 : 422);
    } catch (error) {
      return json({ ok: false, error: error.message || 'Availability check failed.' }, error.status || 400);
    }
  },
};
