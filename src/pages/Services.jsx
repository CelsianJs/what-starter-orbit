import { services, timezoneLabel } from '../data/studio.js';
import { ServiceCard } from '../components/ServiceCard.jsx';

export default function Services() {
  return (
    <section class="page-enter">
      <div class="page-head">
        <p class="eyebrow">Service menu</p>
        <h1>Duration changes the calendar math.</h1>
        <p>Each service has a different duration and price. Availability is checked with overlap math before a reservation is stored locally. Times are shown in {timezoneLabel}.</p>
      </div>
      <div class="service-grid">{services.map((service) => <ServiceCard service={service} />)}</div>
    </section>
  );
}
