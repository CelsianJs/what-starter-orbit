import AppShell from './components/AppShell.jsx';
import Book from './pages/Book.jsx';
import Build from './pages/Build.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Reservations from './pages/Reservations.jsx';
import Services from './pages/Services.jsx';

const shell = (path, component) => ({ path, component, layout: AppShell });

export const routes = [
  shell('/', Home),
  shell('/services', Services),
  shell('/book', Book),
  shell('/reservations', Reservations),
  shell('/build', Build),
  shell('/404', NotFound),
  shell('/*', NotFound),
];
