import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const page = b.contexts()[0].pages()[0];
const wait = (ms) => page.waitForTimeout(ms);
let fc = await Promise.all([page.waitForEvent('filechooser', { timeout: 6000 }), page.getByText('Mise à jour', { exact: true }).first().click()]).then(([f]) => f).catch(() => null);
if (!fc) { await wait(1500); fc = (await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.getByText(/^Charger une photo$/).filter({ visible: true }).first().click()]))[0]; }
await fc.setFiles('compte2/photo.jpg'); await wait(5000);
await page.getByRole('button', { name: 'Enregistrer les modifications' }).last().click(); await wait(5000);
await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await wait(5000);
await page.screenshot({ path: 'photos/compte-9334.png', clip: { x: 0, y: 0, width: 1000, height: 520 } });
process.exit(0);
