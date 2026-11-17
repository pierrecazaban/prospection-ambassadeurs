import { headless } from './hl.mjs';
const { browser, page } = await headless();
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'photos/r3-hero.png' });
for (const id of ['certifications', 'verify', 'contact']) {
  const el = page.locator(`#${id}`); await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
  const box = await el.boundingBox();
  await page.screenshot({ path: `photos/r3-${id}.png`, clip: { x: 0, y: Math.max(0, box.y - 40), width: 1280, height: 520 } });
}
await page.goto('http://localhost:3111/call', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'photos/r3-call.png' });
await page.setViewportSize({ width: 390, height: 700 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'photos/r3-mobile.png' });
await browser.close();
