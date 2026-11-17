import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await browser.contexts()[0].newPage();
for (const sec of ['experience', 'education', 'certifications', 'skills', 'languages']) {
  await page.goto(`https://www.linkedin.com/in/pierre-cazaban-08a839382/details/${sec}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4500);
  const t = await page.evaluate(() => (document.querySelector('main')?.innerText || '').trim());
  console.log(`===== ${sec}\n` + t.slice(0, 2500));
}
await page.close(); process.exit(0);
