import { Link } from 'what-framework/router';
import { services, timezoneLabel } from '../data/studio.js';
import { activeReservations } from '../state/booking.js';
import { ServiceCard } from '../components/ServiceCard.jsx';

export default function Home() {
  return (
    <section class="page-enter">
      <div class="hero">
        <div>
          <p class="eyebrow">Creative appointment studio</p>
          <h1>Book the right orbit before the idea cools.</h1>
          <p>Orbit is a What Framework appointment starter with service durations, timezone-aware slots, local reservations, ICS export, and Vura serverless conflict checks.</p>
          <div class="actions"><Link class="button" href="/book">Find a slot</Link><Link class="button ghost" href="/services">Compare services</Link></div>
        </div>
        <aside class="orbital-panel">
          <span></span><span></span><span></span>
          <strong>{activeReservations().length}</strong>
          <p>active local reservations</p>
          <small>Times shown in {timezoneLabel}</small>
        </aside>
      </div>
      <div class="section-head"><div><p class="eyebrow">Sessions</p><h2>Three starter shapes for real service businesses.</h2></div><Link href="/book">Book now</Link></div>
      <div class="service-grid">{services.map((service) => <ServiceCard service={service} />)}</div>
    </section>
  );
}
