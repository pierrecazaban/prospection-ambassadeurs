import { headless } from './hl.mjs';
const { browser, page } = await headless();
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
for (const id of ['linkedin', 'verify']) {
  const el = page.locator(`#${id}`); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const box = await el.boundingBox();
  await page.screenshot({ path: `photos/d-${id}.png`, clip: { x: 0, y: box.y, width: 1280, height: Math.min(520, box.height) } });
}
const amb = page.locator('section.section-dark').last(); await amb.scrollIntoViewIfNeeded(); await amb.screenshot({ path: 'photos/d-amb.png' });
const sol = page.locator('#solutions'); await sol.scrollIntoViewIfNeeded(); const b2 = await sol.boundingBox();
await page.screenshot({ path: 'photos/d-solutions.png', clip: { x: 0, y: b2.y, width: 1280, height: 320 } });
const c = page.locator('#contact'); await c.scrollIntoViewIfNeeded(); const b3 = await c.boundingBox();
await page.screenshot({ path: 'photos/d-contact.png', clip: { x: 0, y: b3.y, width: 1280, height: 300 } });
await page.setViewportSize({ width: 390, height: 800 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'photos/d-mobile.png' });
await browser.close();
