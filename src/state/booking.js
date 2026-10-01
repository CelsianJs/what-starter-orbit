import { computed, effect, signal } from 'what-framework';
import { baseSlots, createIcs, displayDate, findService, services, slotDate, timezoneLabel } from '../data/studio.js';

export const STORAGE_KEY = 'what-starter-orbit-v1';

function sanitize(raw) {
  const reservations = Array.isArray(raw?.reservations) ? raw.reservations.filter((reservation) => {
    return reservation && typeof reservation.id === 'string' && services.some((service) => service.id === reservation.serviceId) && baseSlots.includes(reservation.start);
  }) : [];
  return { reservations };
}

function readInitial() {
  if (typeof localStorage === 'undefined') return { reservations: [] };
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
  } catch {
    return { reservations: [] };
  }
}

const memory = { value: readInitial() };

export const selectedService = signal('soundprint', 'orbit.service');
export const selectedDate = signal('2026-10-06', 'orbit.date');
export const selectedStart = signal('2026-10-06T14:00:00-04:00', 'orbit.start');
export const guestName = signal('Mina Rivers', 'orbit.guestName');
export const reservations = signal(memory.value.reservations, 'orbit.reservations');
export const availability = signal(null, 'orbit.availability');
export const status = signal(`Times shown in ${timezoneLabel}.`, 'orbit.status');
export const storageNotice = signal('Reservations are saved locally in this browser.', 'orbit.storage');

export const slotsForDate = computed(() => baseSlots.filter((slot) => slotDate(slot) === selectedDate()));
export const activeReservations = computed(() => reservations().filter((reservation) => reservation.status !== 'cancelled'));
export const selectedServiceDetails = computed(() => findService(selectedService()));

export async function checkAvailability(fetcher = fetch) {
  status('Checking studio calendar...');
  try {
    const response = await fetcher('/api/availability', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ serviceId: selectedService(), start: selectedStart(), reservations: reservations() }),
    });
    const body = await response.json();
    availability(body);
    status(body.ok ? `Studio hold ${body.holdId} is available.` : body.errors.join(' '));
    return body;
  } catch {
    status('Availability service is unreachable. Draft selections are preserved.');
    return null;
  }
}

export function bookFromAvailability() {
  const hold = availability();
  if (!hold?.ok) {
    status('Check availability before booking.');
    return null;
  }
  const service = findService(hold.service.id);
  const reservation = {
    id: hold.holdId,
    serviceId: service.id,
    start: hold.start,
    guestName: guestName().trim() || 'Studio guest',
    status: 'booked',
    createdAt: new Date().toISOString(),
  };
  reservations((items) => [reservation, ...items.filter((item) => item.id !== reservation.id)]);
  availability(null);
  status(`${service.name} booked locally for ${displayDate(slotDate(reservation.start))}.`);
  return reservation;
}

export function cancelReservation(id) {
  reservations((items) => items.map((item) => item.id === id ? { ...item, status: 'cancelled' } : item));
  status('Reservation cancelled locally.');
}

export function rescheduleReservation(id, start) {
  if (!baseSlots.includes(start)) return;
  reservations((items) => items.map((item) => item.id === id ? { ...item, start, status: 'booked' } : item));
  status('Reservation moved locally. Recheck availability before treating this as production behavior.');
}

export function resetReservations() {
  reservations([]);
  status('Local reservations cleared.');
}

export function icsHref(reservation) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(createIcs(reservation))}`;
}

effect(() => {
  const snapshot = { reservations: reservations() };
  if (typeof localStorage === 'undefined') {
    memory.value = snapshot;
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    storageNotice(`Saved ${activeReservations().length} active reservation${activeReservations().length === 1 ? '' : 's'} locally.`);
  } catch {
    memory.value = snapshot;
    storageNotice('Storage is blocked. Reservations will last for this session only.');
  }
});
