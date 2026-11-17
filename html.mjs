import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/edit/forms/summary/'));
console.log((await page.locator('[contenteditable="true"][aria-label="À propos"]').innerHTML()).slice(0,700));
process.exit(0);
