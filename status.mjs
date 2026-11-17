// Se connecte au Chrome de prospection (port 9333) et affiche l'état des onglets.
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const pages = browser.contexts().flatMap((c) => c.pages());
for (const p of pages) {
  console.log(p.url(), '|', await p.title());
}
const li = pages.find((p) => p.url().includes('linkedin.com'));
if (li) {
  const loggedIn = /\/feed|\/mynetwork|\/in\//.test(li.url());
  console.log('LinkedIn connecté :', loggedIn ? 'OUI' : 'NON (page de connexion)');
}
process.exit(0); // quitte sans fermer Chrome
