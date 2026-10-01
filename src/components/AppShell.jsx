import { Link } from 'what-framework/router';
import { activeReservations, storageNotice } from '../state/booking.js';

const nav = [['/', 'Studio'], ['/services', 'Services'], ['/book', 'Book'], ['/reservations', 'Reservations'], ['/build', 'Build']];

export default function AppShell({ children }) {
  return (
    <div class="shell">
      <a class="skip-link" href="#content">Skip to content</a>
      <header class="topbar">
        <Link class="brand" href="/">Orbit</Link>
        <nav aria-label="Primary">{nav.map(([href, label]) => <Link href={href} activeClass="active" exactActiveClass="active">{label}</Link>)}</nav>
        <Link class="reservation-chip" href="/reservations">{activeReservations().length} local</Link>
      </header>
      <div class="notice" role="status">{storageNotice()}</div>
      <main id="content">{children}</main>
      <footer><p>Orbit validates against bundled demo holds and local reservations only. Add auth and durable calendar storage before using it as a production booking system.</p></footer>
    </div>
  );
}
