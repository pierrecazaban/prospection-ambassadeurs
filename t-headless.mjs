import { headless } from './hl.mjs';
const { browser, page } = await headless();
await page.goto('about:blank'); console.log('headless ok'); await browser.close();
