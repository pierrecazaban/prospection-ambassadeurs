import { chromium } from 'playwright';
import fs from 'node:fs';
const NEED = {
  'KEDGE Business School': [['KEDGE Bachelor 1ère année', 'KEDGE BBA first year', 'étudiant 1ère année KEDGE Bachelor'], /kedge/i],
  'TBS Education': [['TBS Bachelor 1ère année', 'TBS Education Bachelor first year', 'TBS Education 1A'], /\bTBS\b|toulouse business/i],
  'EM Strasbourg': [['EM Strasbourg Bachelor 1ère année', 'EM Strasbourg BBA 1ère année', 'EM Strasbourg first year bachelor'], /em strasbourg|strasbourg business/i],
  'Montpellier Business School': [['Montpellier Business School Bachelor 1ère année', 'MBS Bachelor first year', 'Montpellier Business School 1A'], /montpellier business|\bMBS\b/i],
  'ICN Business School': [['ICN Bachelor 1ère année', 'ICN Business School BBA first year', 'ICN Business School 1A'], /\bICN\b/i],
  'BSB Burgundy School of Business': [['BSB Bachelor 1ère année', 'Burgundy School of Business first year'], /\bBSB\b|burgundy/i],
  'Grenoble École de Management': [['GEM Bachelor 1ère année', 'Grenoble Ecole de Management BIB 1ère année'], /grenoble|\bGEM\b/i],
  'Rennes School of Business': [['Rennes School of Business Bachelor 1ère année', 'Rennes School of Business PGE1'], /rennes school/i],
};
const FIRST = /(1(è|e)re|premi(è|e)re|1st|first)[- ]?(ann(é|e)e|year)|\b1A\b|bachelor 1\b|\bB1\b|\bPGE ?1\b|freshman/i;
const NOT = /master|msc|m\.?sc|\bM1\b|dscg|mba|infirmier|a étudié|alumni|diplôm/i;
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('/search/results/')) ?? await ctx.newPage();
const pause = (a, b) => page.waitForTimeout(a + Math.random() * (b - a));
const out = {};
for (const [school, [queries, re]] of Object.entries(NEED)) {
  const hits = new Map();
  for (const q of queries) {
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
    for (const p of res) if (!hits.has(p.url) && re.test(p.text) && FIRST.test(p.text) && !NOT.test(p.text) && !/Membre LinkedIn/.test(p.name)) hits.set(p.url, p);
    await pause(9000, 16000);
  }
  out[school] = [...hits.values()];
  console.log(`${school}: ${out[school].length}`);
  fs.writeFileSync('resultats-1a-b.json', JSON.stringify(out, null, 1));
}
process.exit(0);
