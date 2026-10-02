import { chromium, devices } from 'playwright';
import { collectChildLogs, spawnNodePreview, starterRoot, stopOwnedProcess, waitForOwnedReadiness } from './smoke-harness.mjs';

const port = 4182;
const root = starterRoot(import.meta.url);
const server = spawnNodePreview({ cwd: root, port });
const logs = collectChildLogs(server);
const errors = [];
async function waitForVisualRest(page) {
  await page.evaluate(async () => {
    const runningFiniteAnimations = document.getAnimations({ subtree: true }).filter((animation) => {
      const timing = animation.effect?.getTiming?.();
      return ['running', 'pending'].includes(animation.playState)
        && Number.isFinite(timing?.duration)
        && Number.isFinite(timing?.iterations ?? 1);
    });
    await Promise.allSettled(runningFiniteAnimations.map((animation) => animation.finished));
  });
}
async function assertHome(page) {
  await page.getByRole('heading', { name: /Book the right orbit/i }).waitFor();
  await page.getByRole('heading', { name: 'Soundprint Session' }).waitFor();
  await page.getByRole('heading', { name: 'Motion Room Review' }).waitFor();
  await page.getByRole('heading', { name: 'Release Map Intensive' }).waitFor();
  await page.getByRole('link', { name: 'Find a slot' }).waitFor();
  await page.getByRole('link', { name: 'Compare services' }).waitFor();
  const orbitPanel = page.locator('.orbital-panel');
  const panelText = await orbitPanel.innerText();
  if (!/next open demo slot|active local reservations/i.test(panelText)) {
    throw new Error(`Expected orbit panel to show next slot or active reservation state, got: ${panelText}`);
  }
  if (await page.getByText(/api\/availability/).count()) throw new Error('Product-facing home copy should not expose /api/availability.');
}
async function assertBookingControls(page) {
  await page.getByRole('heading', { name: /Pick a session/i }).waitFor();
  await page.locator('.group-label', { hasText: /^Service$/ }).waitFor();
  await page.locator('.group-label', { hasText: /^Date$/ }).waitFor();
  await page.locator('.group-label', { hasText: /^Time$/ }).waitFor();
  if (await page.getByText(/api\/availability/).count()) throw new Error('Booking product copy should not expose /api/availability.');
  await page.getByRole('radio', { name: /Soundprint Session/i }).waitFor();
  await page.getByRole('radio', { name: /Motion Room Review/i }).waitFor();
  await page.getByRole('button', { name: /Tue, Oct 6/i }).waitFor();
  await page.getByRole('button', { name: /2:00 PM/i }).waitFor();
  await page.getByRole('button', { name: /Check availability/i }).waitFor();
}
async function assertNavAndBack(page) {
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const checks = [
    ['Services', /Duration changes the calendar math/i],
    ['Book', /Pick a session/i],
    ['Reservations', /No active local reservations|Your local studio ledger/i],
    ['Build', /How Orbit is built/i],
  ];
  for (const [label, heading] of checks) {
    await nav.getByRole('link', { name: label, exact: true }).click();
    await page.getByRole('heading', { name: heading }).waitFor();
    if (label === 'Book') await assertBookingControls(page);
    await waitForVisualRest(page);
    await page.goBack();
    await assertHome(page);
    await waitForVisualRest(page);
  }
}
async function runFlow(name, options) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type()) && !msg.text().includes('404')) errors.push(`${name}: ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`${name}: ${err.message}`));
  await page.addInitScript(() => localStorage.removeItem('what-starter-orbit-v1'));
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForLoadState('networkidle');
  await assertHome(page);
  await waitForVisualRest(page);
  await assertNavAndBack(page);
  await page.getByRole('link', { name: 'Find a slot' }).click();
  await assertBookingControls(page);
  await waitForVisualRest(page);
  await page.goBack();
  await assertHome(page);
  await waitForVisualRest(page);
  await page.screenshot({ path: `/tmp/orbit-${name}.png`, fullPage: true });
  await page.goto(`http://127.0.0.1:${port}/book`);
  await page.getByRole('heading', { name: /Pick a session/i }).waitFor();
  await assertBookingControls(page);
  await page.getByRole('button', { name: /Check availability/i }).click();
  await page.getByText(/Studio hold ORB-/).waitFor();
  await page.getByRole('button', { name: /Book locally/i }).click();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Reservations', exact: true }).click();
  await page.getByRole('button', { name: 'ICS' }).waitFor();
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Studio', exact: true }).click();
  await assertHome(page);
  await waitForVisualRest(page);
  await context.close();
}
try {
  await waitForOwnedReadiness(server, {
    logs,
    readyPattern: new RegExp(`Orbit preview http://127\\.0\\.0\\.1:${port}`),
    label: 'Orbit preview',
  });
  var browser = await chromium.launch();
  await runFlow('desktop', { viewport: { width: 1360, height: 920 } });
  await runFlow('mobile', { ...devices['iPhone 15'] });
  const page = await browser.newPage();
  const notFound = await page.goto(`http://127.0.0.1:${port}/missing-orbit`);
  if (notFound.status() !== 404) throw new Error(`Expected 404, got ${notFound.status()}`);
  if (errors.length) throw new Error(`Console problems:\n${errors.join('\n')}`);
  console.log('Orbit smoke OK: root content, nav/back, booking controls, /api/availability, reservation ledger, ICS link, 404, desktop/mobile full-page screenshots.');
} finally {
  if (browser) await browser.close().catch(() => {});
  await stopOwnedProcess(server, { logs, label: 'Orbit preview' });
}
