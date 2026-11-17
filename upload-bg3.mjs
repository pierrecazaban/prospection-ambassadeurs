import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban/'));
const [fc] = await Promise.all([
  page.waitForEvent('filechooser', { timeout: 10000 }),
  page.getByText('Charger une seule photo').first().click(),
]);
await fc.setFiles('brand/banniere.png');
await page.waitForTimeout(6000);
await page.screenshot({ path: 'photos/snap2.png' });
process.exit(0);
