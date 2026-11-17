import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const page = b.contexts()[0].pages()[0];
const wait = (ms) => page.waitForTimeout(ms);
const home = async () => { await page.setViewportSize({ width: 1000, height: 760 }).catch(() => {}); await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await wait(5000); };
const btns = () => page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.offsetParent).map((b) => (b.innerText || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean).slice(-12));
const pick = async (re, file) => { const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.getByText(re).filter({ visible: true }).first().click()]); await fc.setFiles(file); await wait(5000); };
const saveAll = async () => { await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click(); await wait(4000);
  const s = page.getByRole('button', { name: /^Enregistrer$|^Enregistrer la photo$/ }); if (await s.count() && await s.last().isEnabled()) { await s.last().click(); await wait(3000); } };
const step = async (label, fn) => { try { await fn(); console.log('✓', label); } catch (e) { console.log('✗', label, String(e.message || e).split('\n')[0]); await page.screenshot({ path: `photos/c2-${label}.png` }); await page.keyboard.press('Escape').catch(() => {}); } };

await step('banniere', async () => {
  await home();
  await page.mouse.click(616, 112); await wait(3000);
  console.log('  après clic caméra:', await btns());
  for (const t of ['Ajouter une image de couverture', 'Changer d’image de couverture']) { const m = page.getByText(t, { exact: true }).filter({ visible: true }); if (await m.count()) { await m.first().click(); await wait(2500); break; } }
  await pick(/^Charger une seule photo$/, 'brand/banniere-sobre.png'); await saveAll();
});
await step('photo', async () => {
  await home();
  await page.mouse.click(125, 215); await wait(3000);
  console.log('  après clic avatar:', await btns());
  await pick(/^Charger une photo$|^Mise à jour$/, 'compte2/photo.jpg'); await saveAll();
});
await home(); await page.screenshot({ path: 'photos/compte-9334.png', clip: { x: 0, y: 0, width: 1000, height: 520 } });
process.exit(0);
