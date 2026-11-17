import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const page = b.contexts()[0].pages()[0];
const wait = (ms) => page.waitForTimeout(ms);
const home = async () => { await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await wait(5000); };
const pick = async (re, file) => { const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.getByText(re).filter({ visible: true }).first().click()]); await fc.setFiles(file); await wait(5000); };
const saveAll = async () => { await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click(); await wait(4000);
  const s = page.getByRole('button', { name: /^Enregistrer$|^Enregistrer la photo$/ }); if (await s.count() && await s.last().isEnabled()) { await s.last().click(); await wait(3000); } };
// Banner
await home();
await page.locator('main [aria-label="Ajouter une image d’arrière-plan"], main [aria-label="Modifier l’image d’arrière-plan"]').first().click(); await wait(2500);
for (const t of ['Ajouter une image de couverture', 'Changer d’image de couverture']) { const m = page.getByText(t, { exact: true }).filter({ visible: true }); if (await m.count()) { await m.first().click(); await wait(2500); break; } }
await pick(/^Charger une seule photo$/, 'brand/banniere-sobre.png'); await saveAll(); console.log('bannière ok');
// Photo
await home();
const labels = await page.evaluate(() => [...document.querySelectorAll('main button, main a, main [role=button]')].filter((b) => b.offsetParent).map((b) => b.getAttribute('aria-label') || '').filter((l) => /photo/i.test(l)));
console.log('boutons photo:', labels);
const btn = page.locator('main [aria-label="Ajouter une photo"], main [aria-label*="photo de profil"], main [aria-label*="Photo de profil"]').filter({ visible: true }).first();
await btn.click(); await wait(2500);
await pick(/^Charger une photo$|^Mise à jour$/, 'compte2/photo.jpg'); await saveAll(); console.log('photo ok');
await home(); await page.screenshot({ path: 'photos/compte-9334.png', clip: { x: 0, y: 0, width: 1000, height: 560 } });
process.exit(0);
