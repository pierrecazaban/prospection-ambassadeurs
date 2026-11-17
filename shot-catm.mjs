import { headless } from './hl.mjs';
const { browser, page } = await headless();
await page.setViewportSize({ width: 390, height: 900 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
const b = page.locator('.hm-block').nth(1);
await b.scrollIntoViewIfNeeded();
await page.evaluate(() => { document.querySelector('.site-header').style.position = 'static'; });
await b.screenshot({ path: 'photos/cat-mobile2.png' });
await browser.close();
