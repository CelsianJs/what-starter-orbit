import { mkdir, copyFile, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const staticDir = join(dist, 'static');
const functionsDir = join(dist, 'functions');
const availabilityDir = join(dist, 'functions', 'api_availability');
const routes = ['/', '/services', '/book', '/reservations', '/build', '/404'];

function validateManifest(manifest) {
  const problems = [];
  if (!manifest || typeof manifest !== 'object') problems.push('manifest must be an object');
  if (manifest.version !== 1) problems.push('version must be 1');
  if (typeof manifest.timestamp !== 'string' || manifest.timestamp.length === 0) problems.push('timestamp is required');
  if (!Array.isArray(manifest.pages) || manifest.pages.length === 0) {
    problems.push('pages must be a non-empty array');
  }
  for (const [index, page] of (manifest.pages ?? []).entries()) {
    if (typeof page.filePath !== 'string' || page.filePath.length === 0) problems.push(`pages[${index}].filePath is required`);
    if (typeof page.urlPattern !== 'string' || page.urlPattern.length === 0) problems.push(`pages[${index}].urlPattern is required`);
    if (typeof page.mode !== 'string' || page.mode.length === 0) problems.push(`pages[${index}].mode is required`);
    if (typeof page.hasLoader !== 'boolean') problems.push(`pages[${index}].hasLoader flag is required`);
    if (typeof page.hasGetServerData !== 'boolean') problems.push(`pages[${index}].hasGetServerData flag is required`);
    if (!page.config || typeof page.config !== 'object') problems.push(`pages[${index}].config is required`);
  }
  if (!Array.isArray(manifest.api) || manifest.api.length === 0) {
    problems.push('api must include the serverless availability function');
  }
  for (const [index, route] of (manifest.api ?? []).entries()) {
    if (typeof route.filePath !== 'string' || route.filePath.length === 0) problems.push(`api[${index}].filePath is required`);
    if (typeof route.urlPattern !== 'string' || route.urlPattern.length === 0) problems.push(`api[${index}].urlPattern is required`);
    if (!Array.isArray(route.methods) || route.methods.length === 0) problems.push(`api[${index}].methods must be non-empty`);
    if (typeof route.kind !== 'string' || route.kind.length === 0) problems.push(`api[${index}].kind is required`);
    if (typeof route.hasWebsocket !== 'boolean') problems.push(`api[${index}].hasWebsocket flag is required`);
    if (!route.config || typeof route.config !== 'object') problems.push(`api[${index}].config is required`);
  }
  if (problems.length > 0) {
    throw new Error(`Vura manifest invalid:\n- ${problems.join('\n- ')}`);
  }
}

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
await writeFile(join(functionsDir, 'package.json'), `${JSON.stringify({ type: 'module' }, null, 2)}\n`);
await build({ entryPoints: [join(root, 'src', 'api', 'availability.js')], bundle: true, platform: 'browser', format: 'esm', outfile: join(availabilityDir, 'index.js') });
const manifest = {
  version: 1,
  pages: routes.map((path) => ({ filePath: 'src/main.jsx', urlPattern: path, mode: 'static', hasLoader: false, hasGetServerData: false, config: { mode: 'static', tags: ['orbit-studio'] } })),
  api: [{ filePath: 'src/api/availability.js', urlPattern: '/api/availability', methods: ['POST'], kind: 'serverless', hasWebsocket: false, config: { kind: 'serverless', compute: { class: 'function', memory: '1gb' } } }],
  timestamp: new Date().toISOString(),
};

if (!existsSync(join(availabilityDir, 'index.js'))) {
  throw new Error('Vura function bundle missing dist/functions/api_availability/index.js');
}
validateManifest(manifest);

await writeFile(join(dist, 'manifest.json'), JSON.stringify(manifest, null, 2));
await writeFile(join(dist, 'package.json'), `${JSON.stringify({ type: 'module', dependencies: { 'what-framework': '0.13.10' } }, null, 2)}\n`);
console.log(`Orbit Vura build ready: ${routes.length} pages and /api/availability`);
