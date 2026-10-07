import { Link } from 'what-framework/router';
import { baseSlots, displayDate, displayTime, services, slotDate, timezoneLabel } from '../data/studio.js';
import { activeReservations } from '../state/booking.js';
import { ServiceCard } from '../components/ServiceCard.jsx';

export default function Home() {
  const count = () => activeReservations().length;
  const nextSlot = baseSlots[0];
  return (
    <section class="page-enter">
      <div class="hero">
        <div>
          <p class="eyebrow">Creative appointment studio</p>
          <h1>Book the right orbit before the idea cools.</h1>
          <p>Orbit helps creative teams compare session shapes, hold a local reservation, and export studio time without pretending this demo owns a shared calendar.</p>
          <div class="actions"><Link class="button" href="/book">Find a slot</Link><Link class="button ghost" href="/services">Compare services</Link></div>
        </div>
        <aside class="orbital-panel">
          <span></span><span></span><span></span>
          <strong>{() => count() || displayTime(nextSlot)}</strong>
          <p>{() => count() ? 'active local reservations' : `${displayDate(slotDate(nextSlot))} is the next open demo slot`}</p>
          <small>Times shown in {timezoneLabel}</small>
        </aside>
      </div>
      <div class="section-head"><div><p class="eyebrow">Sessions</p><h2>Three starter shapes for real service businesses.</h2></div><Link href="/book">Book now</Link></div>
      <div class="service-grid">{services.map((service) => <ServiceCard service={service} />)}</div>
    </section>
  );
}
