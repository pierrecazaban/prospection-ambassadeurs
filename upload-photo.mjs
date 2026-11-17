import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('pierre-cazaban-08a839382'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
const labels = await page.evaluate(() => [...document.querySelectorAll('main button, main a')].filter(b=>b.offsetParent).map(b => (b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,70)).filter(Boolean).slice(0,25));
console.log(labels.join('\n'));
process.exit(0);
