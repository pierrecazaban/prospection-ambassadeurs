import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes(process.argv[2]));
console.log((await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').slice(0,60)))).join('\n'));
process.exit(0);
