import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban-08a839382/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
// The profile photo in the top card
const img = page.locator('main img[src*="profile-displayphoto"]').first();
await img.click(); await page.waitForTimeout(3000);
const btns = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, dialog button')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,40)).filter(Boolean));
console.log(btns);
process.exit(0);
