import { headless } from './hl.mjs';
const { browser, page } = await headless();
await page.setViewportSize({ width: 390, height: 600 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'photos/d-mobile.png' });
await browser.close();
