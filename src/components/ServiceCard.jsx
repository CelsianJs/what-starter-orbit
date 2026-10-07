import { services } from '../data/studio.js';
import { selectedService } from '../state/booking.js';
import { navigate } from 'what-framework/router';

export function ServiceCard({ service }) {
  return (
    <article class="service-card" style={`--tone:${service.tone}`}>
      <div class="orbit-mark" aria-hidden="true"><span></span></div>
      <p class="eyebrow">{service.duration} minutes / ${service.price}</p>
      <h2>{service.name}</h2>
      <p>{service.summary}</p>
      <button class="button" onClick={() => { selectedService(service.id); navigate('/book'); }}>Choose session</button>
    </article>
  );
}

export function ServicePicker() {
  return (
    <div class="service-pills" role="radiogroup" aria-label="Service">
      {services.map((service) => (
        <button class={selectedService() === service.id ? 'active' : ''} role="radio" aria-checked={selectedService() === service.id} tabIndex={() => selectedService() === service.id ? 0 : -1} onClick={() => selectedService(service.id)} onKeyDown={(event) => {
          const index = services.findIndex((item) => item.id === service.id);
          const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % services.length
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index + services.length - 1) % services.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? services.length - 1 : null;
          if (next === null) return;
          event.preventDefault();
          selectedService(services[next].id);
          event.currentTarget.parentElement.children[next].focus();
        }}>
          {service.name} <span>{service.duration}m</span>
        </button>
      ))}
    </div>
  );
}
