import { mkdir, copyFile, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const staticDir = join(dist, 'static');
const availabilityDir = join(dist, 'functions', 'api_availability');
const routes = ['/', '/services', '/book', '/reservations', '/build', '/404'];

async function write(path, content) { await mkdir(dirname(path), { recursive: true }); await writeFile(path, content); }
if (!existsSync(join(staticDir, 'index.html'))) throw new Error('Vite output missing dist/static/index.html');
const shell = await readFile(join(staticDir, 'index.html'), 'utf8');
async function alias(path, title, description) {
  const file = path === '/' ? join(staticDir, 'index.html') : join(staticDir, path.slice(1), 'index.html');
  const html = shell.replace(/<title>.*?<\/title>/, `<title>${title}</title>`).replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`).replace('<div id="app"></div>', `<div id="app"><noscript><main><h1>${title}</h1><p>${description}</p></main></noscript></div>`);
  await write(file, html);
}
await alias('/', 'Orbit — Appointment studio starter', 'Creative studio booking built with What Framework and Vura serverless availability checks.');
await alias('/services', 'Services — Orbit', 'Compare appointment services with different durations.');
await alias('/book', 'Book — Orbit', 'Select a service, slot, and validate availability.');
await alias('/reservations', 'Reservations — Orbit', 'Manage browser-local reservations and ICS exports.');
await alias('/build', 'How Orbit is built', 'Agent reference for signals, timezone math, effects, routing, and Vura serverless packaging.');
await alias('/404', 'Route not found — Orbit', 'Orbit includes a true 404 document for static hosting.');
await copyFile(join(staticDir, '404', 'index.html'), join(staticDir, '404.html'));
await rm(availabilityDir, { recursive: true, force: true });
await mkdir(availabilityDir, { recursive: true });
await build({ entryPoints: [join(root, 'src', 'api', 'availability.js')], bundle: true, platform: 'browser', format: 'esm', outfile: join(availabilityDir, 'index.js') });
await writeFile(join(dist, 'manifest.json'), JSON.stringify({
  version: 1,
  pages: routes.map((path) => ({ filePath: 'src/main.jsx', urlPattern: path, mode: 'static', hasLoader: false, hasGetServerData: false, config: { mode: 'static', tags: ['orbit-studio'] } })),
  api: [{ filePath: 'src/api/availability.js', urlPattern: '/api/availability', methods: ['POST'], kind: 'serverless', hasWebsocket: false, config: { kind: 'serverless', compute: { class: 'function', memory: '1gb' } } }],
  timestamp: new Date().toISOString(),
}, null, 2));
await writeFile(join(dist, 'package.json'), `${JSON.stringify({ type: 'module', dependencies: { 'what-framework': '0.13.10' } }, null, 2)}\n`);
console.log(`Orbit Vura build ready: ${routes.length} pages and /api/availability`);
