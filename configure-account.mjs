// Sets up a LinkedIn account for The AI Certification: banner, photo, headline, sector, About, Co-founder experience.
// Usage: node configure-account.mjs <cdpPort> <photo.jpg> <name>
import { chromium } from 'playwright';
const [port, photo, name] = process.argv.slice(2);
const b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const ctx = b.contexts()[0];
const page = ctx.pages()[0] ?? await ctx.newPage();
const wait = (ms) => page.waitForTimeout(ms);
const step = async (label, fn) => { try { await fn(); console.log('✓', label); } catch (e) { console.log('✗', label, String(e.message || e).split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); } };

await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await wait(5000);
const me = page.url().replace(/\/$/, '') + '/';
const home = async () => { await page.goto(me, { waitUntil: 'domcontentloaded' }); await wait(5000); };
const chooser = async (trigger) => (await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), trigger()]))[0];

await step('bannière', async () => {
  await home();
  await page.locator('main [aria-label="Ajouter une image d’arrière-plan"], main [aria-label="Modifier l’image d’arrière-plan"]').first().click(); await wait(2500);
  const menu = page.getByText('Changer d’image de couverture'); if (await menu.count()) { await menu.first().click(); await wait(2000); }
  const fc = await chooser(() => page.getByText(/Charger une seule photo|Modifier la photo/).first().click());
  await fc.setFiles('brand/banniere-sobre.png'); await wait(5000);
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click(); await wait(4000);
  const save = page.getByRole('button', { name: /^Enregistrer$/ }); if (await save.count() && await save.last().isEnabled()) { await save.last().click(); await wait(3000); }
});

await step('photo', async () => {
  await home();
  const add = page.locator('main [aria-label="Ajouter une photo"]').first();
  if (await add.count()) await add.click(); else await page.locator('main img[src*="profile-displayphoto"]').first().click();
  await wait(2500);
  const fc = await chooser(() => page.getByText(/^Charger une photo$|^Mise à jour$/).first().click());
  await fc.setFiles(photo); await wait(5000);
  await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click(); await wait(5000);
  const save = page.getByRole('button', { name: /^Enregistrer la photo$|^Enregistrer$/ }); if (await save.count()) { await save.last().click().catch(() => {}); await wait(3000); }
});

await step('titre + secteur', async () => {
  await home();
  await page.locator('main [aria-label="Modifier l’introduction"]').first().click(); await wait(3500);
  const h = page.locator('[contenteditable="true"][aria-label="Titre du profil"]');
  await h.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Backspace');
  await page.keyboard.insertText('Co-fondateur chez The AI Certification'); await wait(600);
  const sector = page.getByLabel('Secteur');
  if (await sector.count()) { await sector.fill(''); await sector.pressSequentially('E-learning', { delay: 80 }); await wait(2500); const o = page.locator('[role=option]').first(); if (await o.count()) await o.click(); }
  await page.getByRole('button', { name: /^Enregistrer$/ }).last().click(); await wait(4000);
});

await step('à propos', async () => {
  await page.goto(me + 'edit/forms/summary/new/', { waitUntil: 'domcontentloaded' }); await wait(4500);
  const ed = page.locator('[contenteditable="true"][aria-label="À propos"]');
  await ed.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Backspace');
  await page.keyboard.insertText(`L'IA change la façon dont on étudie, recrute et travaille. Mais comment prouver qu'on sait vraiment s'en servir ?

C'est ce que nous faisons chez The AI Certification : des certifications en IA (ChatGPT, Claude, Copilot, prompt engineering, automatisation) obtenues par un vrai examen, avec un certificat vérifiable publiquement et directement intégrable à LinkedIn.

Étudiant à l'IÉSEG et co-fondateur, je développe notre réseau d'ambassadeurs étudiants, un par école : ESCP, EDHEC, emlyon, SKEMA, IESEG, Polytechnique, NEOMA, ESSCA, ESSEC… et bientôt la vôtre.

🎓 Tu veux représenter The AI Certification dans ton école ? Réserve un appel de 45 min : the-ai-certification.com/call
🌐 the-ai-certification.com`);
  await wait(800);
  await page.getByRole('button', { name: /^Enregistrer$/ }).last().click(); await wait(4000);
});

await step('expérience Co-fondateur', async () => {
  await page.goto(me + 'edit/forms/position/new/', { waitUntil: 'domcontentloaded' }); await wait(5000);
  const fields = await page.evaluate(() => [...document.querySelectorAll('input,select')].filter((e) => e.offsetParent !== null).map((e) => {
    const lab = e.id && document.querySelector(`label[for="${e.id}"]`); return { id: e.id, label: (lab?.innerText || e.getAttribute('aria-label') || e.placeholder || '').trim() }; }));
  const f = (re) => page.locator(`[id="${fields.find((x) => re.test(x.label)).id}"]`);
  await f(/^Titre|Intitulé|Chef de produit/i).click(); await f(/^Titre|Intitulé|Chef de produit/i).pressSequentially('Co-fondateur', { delay: 50 }); await wait(1200); await page.keyboard.press('Escape');
  await f(/Entreprise|Microsoft/i).click(); await f(/Entreprise|Microsoft/i).pressSequentially('The AI Certification', { delay: 50 }); await wait(1500); await page.keyboard.press('Escape');
  const cur = f(/poste actuel/i); if (!(await cur.isChecked())) await cur.check({ force: true });
  await f(/Mois de début/i).selectOption({ label: 'novembre' }).catch(() => f(/Mois de début/i).selectOption({ index: 11 }));
  await f(/Année de début/i).selectOption('2026');
  await page.locator('[contenteditable="true"]').first().click();
  await page.keyboard.insertText(`The AI Certification certifie les compétences en intelligence artificielle (ChatGPT, Claude, Copilot, prompt engineering, automatisation) via un examen et un certificat vérifiable, directement intégrable à LinkedIn.\n\nJe développe notre réseau d'ambassadeurs étudiants dans les écoles et universités françaises.`);
  await wait(800);
  await page.getByRole('button', { name: /^Enregistrer$/ }).last().click(); await wait(5000);
});

await home();
await page.screenshot({ path: `photos/compte-${port}.png`, clip: { x: 0, y: 0, width: 1000, height: 760 } });
console.log('profil :', me, '| nom attendu :', name);
process.exit(0);
