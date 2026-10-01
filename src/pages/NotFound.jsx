import { Link } from 'what-framework/router';

export default function NotFound() {
  return <section class="page-enter empty"><p class="eyebrow">404</p><h1>This orbit is uncharted.</h1><p>The starter includes a real static not-found document and client catch-all route.</p><Link class="button" href="/">Return to studio</Link></section>;
}
