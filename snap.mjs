import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes(process.argv[2]));
await page.screenshot({ path: process.argv[3] });
console.log(page.url());
process.exit(0);
