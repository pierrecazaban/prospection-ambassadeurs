import { headless } from './hl.mjs';
const { browser, page } = await headless();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
const r = await page.evaluate(() => {
  const out = [];
  for (const s of document.querySelectorAll('main > section')) out.push([s.id || s.className.split(' ')[0], Math.round(s.getBoundingClientRect().height)]);
  out.push(['TOTAL', document.body.scrollHeight]);
  return out;
});
console.log(r.map(([a, b]) => `${a}: ${b}px (${(b / 844).toFixed(1)} écrans)`).join('\n'));
await browser.close();
