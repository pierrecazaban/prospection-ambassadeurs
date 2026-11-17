import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('public-profile/settings'));
await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4000);
console.log('valeur :', await page.locator('#vanityUrlForm').inputValue());
process.exit(0);
