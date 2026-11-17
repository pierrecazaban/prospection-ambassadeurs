import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto(process.argv[2] || 'https://www.linkedin.com/in/noaguimbretiere/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
const items = await page.evaluate(() => {
  const els = [...document.querySelectorAll('main button, main a')].filter((b) => b.offsetParent).slice(0, 25);
  return els.map((b) => b.tagName + ' [' + (b.getAttribute('aria-label') || '').slice(0, 70) + '] ' + b.innerText.trim().replace(/\s+/g, ' ').slice(0, 30));
});
console.log(items.join('\n'));
await page.screenshot({ path: 'photos/probe.png', clip: { x: 0, y: 0, width: 1000, height: 700 } });
process.exit(0);
