import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('public-profile/settings'));
const tryName = async (name) => {
  const inp = page.locator('#vanityUrlForm');
  if (await inp.getAttribute('readonly') !== null) { await page.getByRole('button', { name: 'Modifiez votre URL personnalisée' }).click(); await page.waitForTimeout(1000); }
  await inp.fill(name);
  await page.waitForTimeout(600);
  await page.locator('form:has(#vanityUrlForm) button[type=submit], form:has(#vanityUrlForm) button:has-text("Enregistrer")').first().click();
  await page.waitForTimeout(3500);
  const msg = await page.evaluate(() => [...document.querySelectorAll('[role=alert], .artdeco-inline-feedback, [class*=error]')].map(e=>e.innerText.trim()).filter(Boolean).join(' | '));
  const now = await page.evaluate(() => document.body.innerText.match(/linkedin\.com\/in\/[\w-]+/g));
  return { name, msg, now: [...new Set(now||[])] };
};
for (const n of ['pierre-cazaban', 'pierrecazaban', 'pierre-cazaban-ai']) {
  const r = await tryName(n); console.log(r);
  if (r.now.some(u => u.endsWith('/' + n))) break;
}
process.exit(0);
