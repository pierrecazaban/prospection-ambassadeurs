// Second pass: first-year students. Keeps explicit 1st-year mentions first.
import { chromium } from 'playwright';
import fs from 'node:fs';
const S = {
  'Audencia': ['audencia', /audencia/i], 'KEDGE Business School': ['KEDGE', /kedge/i], 'Grenoble École de Management': ['Grenoble Ecole de Management', /grenoble|\bGEM\b/i],
  'TBS Education': ['TBS Education', /\bTBS\b|toulouse business/i], 'Rennes School of Business': ['Rennes School of Business', /rennes school/i],
  'Montpellier Business School': ['Montpellier Business School', /montpellier business|\bMBS\b/i], 'ICN Business School': ['ICN Business School', /\bICN\b/i],
  'EM Strasbourg': ['EM Strasbourg', /em strasbourg/i], 'BSB Burgundy School of Business': ['Burgundy School of Business', /\bBSB\b|burgundy/i],
};
const FIRST = /(1(è|e)re|premi(è|e)re|1st|first)[- ]?(ann(é|e)e|year)|\b1A\b|bachelor 1\b|\bB1\b|\bL1\b|ann(é|e)e 1\b|year 1\b|post[- ]?bac|freshman/i;
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('/search/results/')) ?? await ctx.newPage();
const pause = (a, b) => page.waitForTimeout(a + Math.random() * (b - a));
const out = {};
for (const [school, [kw, re]] of Object.entries(S)) {
  const hits = new Map();
  for (const q of [`1ère année ${kw}`, `first year ${kw}`, `Bachelor 1 ${kw}`]) {
    if (hits.size >= 5) break;
    await page.goto('https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded' });
    await pause(5000, 8000);
    if (/login|checkpoint|authwall/.test(page.url())) { console.log('LinkedIn bloque, arrêt.'); process.exit(1); }
    const res = await page.evaluate(() => {
      const seen = new Set(); const r = [];
      for (const a of document.querySelectorAll('main a[href*="/in/"]')) {
        const href = a.href.split('?')[0]; if (seen.has(href)) continue;
        const card = a.closest('li') || a.parentElement; const t = (card?.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
        if (!t.length) continue; seen.add(href); r.push({ url: href, name: t[0].replace(/\s*•.*$/, ''), text: t.slice(1, 8).join(' | ') });
      }
      return r;
    });
    for (const p of res) if (!hits.has(p.url) && re.test(p.text) && FIRST.test(p.text) && !/Membre LinkedIn/.test(p.name)) hits.set(p.url, p);
    await pause(9000, 16000);
  }
  out[school] = [...hits.values()].slice(0, 5);
  console.log(`${school}: ${out[school].length} en 1re année explicite`);
  fs.writeFileSync('resultats-1a.json', JSON.stringify(out, null, 1));
}
process.exit(0);
