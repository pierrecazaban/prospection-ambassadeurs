// Searches LinkedIn for students of several schools in ONE background tab, with human-like pauses.
// Usage: node search-batch.mjs  → writes resultats-ecoles.json
import { chromium } from 'playwright';
import fs from 'node:fs';
const SCHOOLS = [
  ['Audencia', ['étudiant Audencia', 'student Audencia']],
  ['KEDGE Business School', ['étudiant KEDGE Business School', 'student KEDGE']],
  ['Grenoble École de Management', ['étudiant Grenoble Ecole de Management', 'student GEM Grenoble']],
  ['TBS Education', ['étudiant TBS Education', 'student TBS Education Toulouse']],
  ['Rennes School of Business', ['étudiant Rennes School of Business', 'student Rennes School of Business']],
  ['Montpellier Business School', ['étudiant Montpellier Business School', 'student Montpellier Business School']],
  ['ICN Business School', ['étudiant ICN Business School', 'student ICN Business School']],
  ['EM Strasbourg', ['étudiant EM Strasbourg', 'student EM Strasbourg Business School']],
  ['BSB Burgundy School of Business', ['étudiant BSB Burgundy School of Business', 'student Burgundy School of Business']],
];
const KEYS = { 'Audencia': /audencia/i, 'KEDGE Business School': /kedge/i, 'Grenoble École de Management': /grenoble (e|é)cole de management|\bGEM\b|grenoble em/i,
  'TBS Education': /\bTBS\b|toulouse business/i, 'Rennes School of Business': /rennes school of business|\bRSB\b/i, 'Montpellier Business School': /montpellier business school|\bMBS\b/i,
  'ICN Business School': /\bICN\b/i, 'EM Strasbourg': /em strasbourg/i, 'BSB Burgundy School of Business': /\bBSB\b|burgundy school/i };
const STUDENT = /(é|e)tudiant|student|bachelor|PGE|programme grande|1(è|e)re ann(é|e)e|first[- ]year|L1|L2|L3|BBA|master/i;
const NOT_STUDENT = /alumni|alumnus|dipl(ô|o)m|graduate|former|ancien|ceo|founder|manager chez|directeur|director|head of|professeur|professor|recruteur|recruiter/i;

const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('/search/results/')) ?? await ctx.newPage();
const pause = (a, b) => page.waitForTimeout(a + Math.random() * (b - a));
const out = {};
for (const [school, queries] of SCHOOLS) {
  const found = new Map();
  for (const q of queries) {
    if (found.size >= 5) break;
    await page.goto('https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded' });
    await pause(5000, 8000);
    if (/login|checkpoint|authwall/.test(page.url())) { console.log('LinkedIn demande une connexion/vérification, arrêt.'); process.exit(1); }
    const res = await page.evaluate(() => {
      const seen = new Set(); const r = [];
      for (const a of document.querySelectorAll('main a[href*="/in/"]')) {
        const href = a.href.split('?')[0]; if (seen.has(href)) continue;
        const card = a.closest('li') || a.parentElement; const t = (card?.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
        if (!t.length) continue; seen.add(href);
        r.push({ url: href, name: t[0].replace(/\s*•.*$/, ''), lines: t.slice(1, 6).filter((l) => !/^(• )?(2e|3e|1er)/.test(l) && l !== 'Se connecter' && l !== 'Suivre' && l !== 'Message') });
      }
      return r;
    });
    for (const p of res) {
      const text = p.lines.join(' | ');
      if (found.has(p.url) || p.name.length < 3 || /Membre LinkedIn/.test(p.name)) continue;
      if (KEYS[school].test(text) && STUDENT.test(text) && !NOT_STUDENT.test(p.lines[0] || '')) found.set(p.url, { ...p, headline: p.lines[0], place: p.lines[1] });
      if (found.size >= 5) break;
    }
    await pause(9000, 16000); // between searches
  }
  out[school] = [...found.values()].slice(0, 5);
  console.log(`${school}: ${out[school].length}`);
  fs.writeFileSync('resultats-ecoles.json', JSON.stringify(out, null, 1));
}
process.exit(0);
