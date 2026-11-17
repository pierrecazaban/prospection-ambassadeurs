import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes(process.argv[2]));
await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4500);
await page.screenshot({ path: process.argv[3], clip: { x: 0, y: 0, width: 1100, height: 650 } });
process.exit(0);
