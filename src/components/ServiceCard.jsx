import { services } from '../data/studio.js';
import { selectedService } from '../state/booking.js';

export function ServiceCard({ service }) {
  return (
    <article class="service-card" style={`--tone:${service.tone}`}>
      <div class="orbit-mark" aria-hidden="true"><span></span></div>
      <p class="eyebrow">{service.duration} minutes / ${service.price}</p>
      <h2>{service.name}</h2>
      <p>{service.summary}</p>
      <button class="button" onClick={() => selectedService(service.id)}>Choose session</button>
    </article>
  );
}

export function ServicePicker() {
  return (
    <div class="service-pills" role="radiogroup" aria-label="Service">
      {services.map((service) => (
        <button class={selectedService() === service.id ? 'active' : ''} role="radio" aria-checked={selectedService() === service.id} onClick={() => selectedService(service.id)}>
          {service.name} <span>{service.duration}m</span>
        </button>
      ))}
    </div>
  );
}
