import { demoDates, displayDate, displayTime, timezoneLabel } from '../data/studio.js';
import { ServicePicker } from '../components/ServiceCard.jsx';
import { availability, bookFromAvailability, checkAvailability, guestName, selectedDate, selectedServiceDetails, selectedStart, slotsForDate, status } from '../state/booking.js';

export default function Book() {
  return (
    <section class="page-enter">
      <div class="page-head">
        <p class="eyebrow">Booking desk</p>
        <h1>Pick a session, then verify the slot.</h1>
        <p>Orbit checks the selected session, start time, and local holds before it lets you write a browser-only booking.</p>
      </div>
      <div class="booking-layout">
        <div class="booking-board">
          <div class="field-group">
            <p class="group-label">Service</p>
            <ServicePicker />
          </div>
          <label><span>Your name</span><input value={guestName()} onInput={(event) => guestName(event.target.value)} /></label>
          <div class="field-group">
            <p class="group-label">Date</p>
            <div class="date-tabs" role="tablist" aria-label="Date">
              {demoDates.map((date) => <button class={selectedDate() === date ? 'active' : ''} onClick={() => { selectedDate(date); selectedStart(slotsForDate()[0] || selectedStart()); }}>{displayDate(date)}</button>)}
            </div>
          </div>
          <div class="field-group">
            <p class="group-label">Time</p>
            <div class="slot-grid" aria-label={`Available slots in ${timezoneLabel}`}>
              {slotsForDate().map((slot) => (
                <button class={selectedStart() === slot ? 'active' : ''} onClick={() => selectedStart(slot)}>
                  {displayTime(slot)} <span>{timezoneLabel}</span>
                </button>
              ))}
            </div>
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
