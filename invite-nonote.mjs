// Invitations WITHOUT a note (the free account has 3 notes a month left). The message with the link goes after acceptance.
import { chromium } from 'playwright';
import fs from 'node:fs';
const [file, school] = process.argv.slice(2);
const list = JSON.parse(fs.readFileSync(file, 'utf8'));
const LOG = 'invitations.json';
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : [];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const pause = (a, b) => page.waitForTimeout(a + Math.random() * (b - a));
await page.keyboard.press('Escape').catch(() => {});
for (const p of list) {
  if (log.some((l) => l.url === p.url && l.status === 'envoyée')) { console.log('déjà fait', p.name); continue; }
  let status;
  try {
    await page.goto(p.url, { waitUntil: 'domcontentloaded' }); await pause(4000, 6500);
    const connect = page.locator('main a[aria-label^="Inviter "], main button[aria-label^="Inviter "]').filter({ visible: true }).first();
    if (!(await connect.count())) throw new Error('pas de bouton (déjà invité ou en relation)');
    await connect.click(); await pause(2000, 3000);
    const noNote = page.getByRole('button', { name: /Envoyer sans note|Send without a note/ });
    if (await noNote.count()) await noNote.first().click();
    else await page.getByRole('button', { name: /^Envoyer$|^Send$/ }).filter({ visible: true }).last().click();
    await pause(2500, 3500);
    status = 'envoyée';
  } catch (e) { status = 'échec: ' + String(e.message || e).split('\n')[0].slice(0, 100); await page.keyboard.press('Escape').catch(() => {}); }
  console.log(p.name, '→', status);
  log.push({ name: p.name, url: p.url, school, link: p.link, status, date: new Date().toISOString() });
  fs.writeFileSync(LOG, JSON.stringify(log, null, 1));
  await pause(40000, 75000);
}
process.exit(0);
