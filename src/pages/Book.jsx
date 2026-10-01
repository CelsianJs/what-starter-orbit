import { demoDates, displayDate, displayTime, timezoneLabel } from '../data/studio.js';
import { ServicePicker } from '../components/ServiceCard.jsx';
import { availability, bookFromAvailability, checkAvailability, guestName, selectedDate, selectedServiceDetails, selectedStart, slotsForDate, status } from '../state/booking.js';

export default function Book() {
  return (
    <section class="page-enter">
      <div class="page-head">
        <p class="eyebrow">Booking desk</p>
        <h1>Pick a session, then verify the slot.</h1>
        <p>Orbit posts the selected service, start time, and local reservations to `/api/availability` before allowing a booking.</p>
      </div>
      <div class="booking-layout">
        <div class="booking-board">
          <ServicePicker />
          <label><span>Your name</span><input value={guestName()} onInput={(event) => guestName(event.target.value)} /></label>
          <div class="date-tabs" role="tablist" aria-label="Date">
            {demoDates.map((date) => <button class={selectedDate() === date ? 'active' : ''} onClick={() => { selectedDate(date); selectedStart(slotsForDate()[0] || selectedStart()); }}>{displayDate(date)}</button>)}
          </div>
          <div class="slot-grid" aria-label={`Available slots in ${timezoneLabel}`}>
            {slotsForDate().map((slot) => (
              <button class={selectedStart() === slot ? 'active' : ''} onClick={() => selectedStart(slot)}>
                {displayTime(slot)} <span>{timezoneLabel}</span>
              </button>
            ))}
          </div>
        </div>
        <aside class="booking-summary" aria-live="polite">
          <p class="eyebrow">Draft</p>
          <h2>{selectedServiceDetails().name}</h2>
          <p>{selectedServiceDetails().duration} minutes at {displayTime(selectedStart())} {timezoneLabel}</p>
          <p>{status()}</p>
          {availability()?.holdId ? <strong>{availability().holdId}</strong> : null}
          <button class="button" onClick={() => checkAvailability()}>Check availability</button>
          <button class="button ghost" onClick={bookFromAvailability}>Book locally</button>
        </aside>
      </div>
    </section>
  );
}
