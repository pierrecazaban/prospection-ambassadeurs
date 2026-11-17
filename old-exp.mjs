import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
await page.goto('https://www.linkedin.com/in/pierre-cazaban-08a839382/edit/forms/position/new/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
const fields = await page.evaluate(() => [...document.querySelectorAll('input,select,[contenteditable="true"]')].filter(e=>e.offsetParent!==null).map(e => {
  const lab = e.id && document.querySelector(`label[for="${e.id}"]`);
  return { id: e.id, tag: e.tagName, type: e.type, label: (lab?.innerText||e.getAttribute('aria-label')||e.placeholder||'').trim() }; }));
console.log(JSON.stringify(fields));
const byLabel = (re) => fields.find((f) => re.test(f.label));
const title = byLabel(/^Titre|Intitulé|Chef de produit/i), company = byLabel(/Entreprise|Microsoft/i), current = byLabel(/poste actuel/i),
      month = byLabel(/Mois de début/i), year = byLabel(/Année de début/i), desc = fields.find((f) => f.tag === 'DIV');
console.log({ title, company, current, month, year, desc });
const q = (f) => page.locator(`[id="${f.id}"]`);
await q(title).click(); await q(title).pressSequentially('Co-fondateur', { delay: 50 }); await page.waitForTimeout(1200); await page.keyboard.press('Escape');
await q(company).click(); await q(company).pressSequentially('The AI Certification', { delay: 50 }); await page.waitForTimeout(1500); await page.keyboard.press('Escape');
if (!(await q(current).isChecked())) await q(current).check({ force: true });
await q(month).selectOption({ label: 'novembre' }).catch(async () => q(month).selectOption({ index: 11 }));
await q(year).selectOption('2026');
const ed = desc ? page.locator('[contenteditable="true"]').filter({ hasNot: page.locator('x') }).last() : null;
const descEl = page.locator('[contenteditable="true"]').first();
await descEl.click();
await page.keyboard.insertText(`The AI Certification certifie les compétences en intelligence artificielle (ChatGPT, Claude, Copilot, prompt engineering, automatisation) via un examen et un certificat vérifiable, directement intégrable à LinkedIn.\n\nJe développe notre présence dans les écoles et universités françaises et pilote notre réseau d'ambassadeurs étudiants (ESCP, EDHEC, emlyon, SKEMA, IESEG, Polytechnique…).`);
await page.waitForTimeout(800);
console.log('vals', await q(title).inputValue(), '|', await q(company).inputValue(), '|', await q(month).inputValue(), await q(year).inputValue());
process.exit(0);
