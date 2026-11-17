import { headless } from './hl.mjs';
const { browser, page } = await headless();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await page.evaluate(() => { document.querySelector('.site-header').style.position = 'static'; });
await page.screenshot({ path: 'photos/mfull.png', fullPage: true });
await browser.close();
