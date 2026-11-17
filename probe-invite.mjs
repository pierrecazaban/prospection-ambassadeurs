// Opens the invite dialog with a note on one profile, lists its buttons, then closes it WITHOUT sending.
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
await page.locator('main a[aria-label^="Inviter "], main button[aria-label^="Inviter "]').filter({ visible: true }).first().click();
await page.waitForTimeout(2500);
const dump = () => page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, [role=dialog] textarea, [role=dialog] [contenteditable]')]
  .filter((b) => b.offsetParent).map((b) => b.tagName + ' [' + (b.getAttribute('aria-label') || '') + '] ' + (b.innerText || '').trim().slice(0, 40) + (b.disabled ? ' (désactivé)' : '')));
console.log('1:', await dump());
const add = page.getByRole('button', { name: /Ajouter une note|Add a note/ });
if (await add.count()) { await add.first().click(); await page.waitForTimeout(1500); }
const ta = page.locator('[role=dialog] textarea').first();
if (await ta.count()) await ta.fill('Bonjour, test');
await page.waitForTimeout(800);
console.log('2:', await dump());
await page.screenshot({ path: 'photos/invite-dialog.png' });
await page.keyboard.press('Escape');
await page.waitForTimeout(800);
const discard = page.getByRole('button', { name: /Abandonner|Ignorer|Discard/ });
if (await discard.count()) await discard.first().click();
await page.close();
process.exit(0);
