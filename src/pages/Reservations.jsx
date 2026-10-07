import { Link } from 'what-framework/router';
import { baseSlots, createIcs, displayDate, displayTime, findService, slotDate, timezoneLabel } from '../data/studio.js';
import { activeReservations, cancelReservation, reservations, rescheduleReservation, resetReservations } from '../state/booking.js';

function downloadIcs(reservation) {
  const url = URL.createObjectURL(new Blob([createIcs(reservation)], { type: 'text/calendar;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${reservation.id}.ics`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reservations() {
  return (
    <section class="page-enter">
    {() => reservations().length === 0 ? (
      <section class="page-enter empty">
        <p class="eyebrow">Private reservations</p>
        <h1>No active local reservations.</h1>
        <p>Book a session to see reschedule, cancel, and ICS export controls.</p>
        <Link class="button" href="/book">Find a slot</Link>
      </section>
    ) : <>
      <div class="page-head">
        <p class="eyebrow">Private reservations</p>
        <h1>Your local studio ledger.</h1>
        <p role="status">{() => `${activeReservations().length} active · ${reservations().length - activeReservations().length} cancelled. Records stay local to this browser.`}</p>
        <button class="button ghost" onClick={resetReservations}>Reset all</button>
      </div>
      <div class="reservation-list">
        {reservations().map((reservation) => {
          const service = findService(reservation.serviceId);
          return (
            <article class={`reservation ${reservation.status}`}>
              <div><p class="eyebrow">{reservation.status}</p><h2>{service.name}</h2><p>{reservation.guestName} / {displayDate(slotDate(reservation.start))} at {displayTime(reservation.start)} {timezoneLabel}</p></div>
              {reservation.status !== 'cancelled' ? <>
                <label><span>Move slot</span><select value={reservation.start} onChange={(event) => rescheduleReservation(reservation.id, event.target.value)}>{baseSlots.map((slot) => <option value={slot}>{displayDate(slotDate(slot))} {displayTime(slot)} {timezoneLabel}</option>)}</select></label>
                <button class="button ghost" onClick={() => downloadIcs(reservation)}>ICS</button>
                <button class="button ghost" onClick={() => cancelReservation(reservation.id)}>Cancel</button>
              </> : <p>Cancelled locally. Book a new session to choose another time.</p>}
            </article>
          );
        })}
      </div>
      <Link class="button ghost" href="/book">Book another session</Link>
    </>}
    </section>
  );
}
