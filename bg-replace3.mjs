import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban'));
await page.mouse.click(792, 112);
await page.waitForTimeout(3000);
await page.screenshot({ path: 'photos/snap5.png' });
console.log(await page.evaluate(() => [...document.querySelectorAll('button, label')].filter(b=>b.offsetParent && b.closest('[role=dialog],dialog,.artdeco-modal')).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,50)).filter(Boolean)));
process.exit(0);
