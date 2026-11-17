// Usage: node search.mjs "mots clés"
// Lance une recherche de personnes LinkedIn dans l'onglet LinkedIn du Chrome de prospection
// et affiche les résultats de la première page (nom, titre, lieu, URL du profil).
import { chromium } from 'playwright';

const query = process.argv[2];
if (!query) { console.error('Usage: node search.mjs "mots clés"'); process.exit(1); }

const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('/search/results/people')) ?? (await ctx.newPage());

const pageNum = process.argv[3] || 1;
const url = 'https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(query) + '&page=' + pageNum;
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000 + Math.random() * 2000); // rythme humain

const results = await page.evaluate(() => {
  const seen = new Set();
  const out = [];
  for (const a of document.querySelectorAll('a[href*="/in/"]')) {
    const href = a.href.split('?')[0];
    if (seen.has(href)) continue;
    const card = a.closest('li') || a.closest('div[data-chameleon-result-urn]') || a.parentElement;
    const text = (card?.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    if (!text.length) continue;
    seen.add(href);
    out.push({ url: href, lignes: text.slice(0, 6) });
  }
  return out;
});

console.log(JSON.stringify(results, null, 1));
process.exit(0);
