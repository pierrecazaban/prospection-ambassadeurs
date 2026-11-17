import { headless } from './hl.mjs';
const { browser, page } = await headless();
for (const [w, f] of [[1280, 'ch-desk'], [390, 'ch-mob']]) {
  await page.setViewportSize({ width: w, height: 800 });
  await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
  await page.evaluate(() => { document.querySelector('.site-header').style.position = 'static'; });
  await page.locator('#certifications .section-head').screenshot({ path: `photos/${f}.png` });
}
await browser.close();
