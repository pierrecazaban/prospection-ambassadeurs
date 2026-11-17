import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await browser.contexts()[0].newPage();
for (const [w, f] of [[1200, 'photos/cal-desktop.png'], [390, 'photos/cal-mobile.png']]) {
  await page.setViewportSize({ width: w, height: 1000 });
  await page.goto('http://localhost:3111/call', { waitUntil: 'networkidle' });
  await page.locator('.cal-day:not([disabled])').nth(2).click();
  await page.waitForTimeout(400);
  await page.locator('.card').nth(1).screenshot({ path: f });
}
await page.close(); process.exit(0);
