import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const ME = 'https://www.linkedin.com/in/pierre-cazaban-08a839382/';
const go = async () => { await page.goto(ME, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000); };
const labels = () => page.evaluate(() => [...document.querySelectorAll('main button, main a')].filter(b=>b.offsetParent).map(b => (b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0, 12));
await go(); console.log(await labels());
process.exit(0);
