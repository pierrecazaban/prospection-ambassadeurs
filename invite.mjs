// Sends LinkedIn invitations with a note, one by one, spaced out. Usage: node invite.mjs audencia-liens.json Audencia
import { chromium } from 'playwright';
import fs from 'node:fs';
const [file, school] = process.argv.slice(2);
const list = JSON.parse(fs.readFileSync(file, 'utf8'));
const log = JSON.parse(fs.existsSync('invitations.json') ? fs.readFileSync('invitations.json', 'utf8') : '[]').filter((l) => l.status === 'envoyée');
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('linkedin.com'));
const pause = (a, b) => page.waitForTimeout(a + Math.random() * (b - a));
for (const p of list) {
  if (log.some((l) => l.url === p.url && l.status === 'envoyée')) { console.log('déjà fait', p.name); continue; }
  const first = p.name.split(/\s+/)[0];
  const note = `Bonjour ${first}, on cherche LA personne qui représentera The AI Certification à ${school} : un seul ambassadeur par école, 10 % de commission. On est déjà à l'ESCP, l'EDHEC et emlyon. Partant pour en parler 45 min ? Choisis ton créneau : ${p.link.replace('https://', '')}`;
  let status = 'échec';
  try {
    await page.goto(p.url, { waitUntil: 'domcontentloaded' }); await pause(4000, 6500);
    const top = page.locator('main');
    // The profile's own button comes first in the page (the suggestions below have their own).
    let connect = top.locator('a[aria-label^="Inviter "][aria-label$="à rejoindre votre réseau"], button[aria-label^="Inviter "][aria-label$="à rejoindre votre réseau"]').filter({ visible: true }).first();
    if (!(await connect.count())) {
      const more = top.getByRole('button', { name: /^Plus|More/ }).first();
      if (await more.count()) { await more.click(); await pause(1000, 1800); connect = page.getByRole('menuitem', { name: /Se connecter|Connect|Invitez/ }).or(page.locator('[role=button]', { hasText: /^Se connecter$/ })).first(); }
    }
    if (!(await connect.count())) { status = 'pas de bouton Se connecter (déjà en attente ou relation ?)'; throw new Error(status); }
    await connect.click(); await pause(1800, 2800);
    const addNote = page.getByRole('button', { name: /Ajouter une note|Add a note/ });
    if (await addNote.count()) {
      await addNote.click(); await pause(1200, 2000);
      const ta = page.locator('textarea[name="message"], textarea#custom-message, [role=dialog] textarea').first();
      if (!(await ta.count())) { status = 'note impossible (quota de notes du compte gratuit ?)'; throw new Error(status); }
      await ta.fill(note); await pause(1500, 2500);
      await page.getByRole('button', { name: /^Envoyer$|^Send$/ }).last().click(); await pause(2500, 3500);
      status = 'envoyée';
    } else { status = 'pas d’option note'; throw new Error(status); }
  } catch (e) { if (status === 'échec') status = 'échec: ' + String(e).slice(0, 120); await page.keyboard.press('Escape').catch(() => {}); }
  console.log(p.name, '→', status);
  log.push({ name: p.name, url: p.url, school, link: p.link, status, date: new Date().toISOString() });
  fs.writeFileSync('invitations.json', JSON.stringify(log, null, 1));
  if (status !== 'envoyée' && /quota|note impossible/.test(status)) break;
  await pause(45000, 80000);
}
process.exit(0);
