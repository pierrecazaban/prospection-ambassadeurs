// Same as probe-invite, but the LinkedIn modals live in a shadow DOM (#interop-outlet): use Playwright locators (they pierce it).
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await browser.contexts()[0].newPage();
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
await page.screenshot({ path: 'photos/invite-0.png' });
const dlg = page.locator('#interop-outlet [role=dialog], [role=dialog]');
console.log('modale déjà ouverte au chargement :', await dlg.count());
const names = async () => (await page.locator('#interop-outlet button, [role=dialog] button').filter({ visible: true }).allInnerTexts()).map((t) => t.trim()).filter(Boolean);
console.log('boutons modale :', await names());
await page.close();
process.exit(0);
