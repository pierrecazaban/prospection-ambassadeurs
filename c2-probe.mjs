import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const page = b.contexts()[0].pages()[0];
await page.keyboard.press('Escape');
await page.goto('https://www.linkedin.com/in/me/', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(5000);
await page.locator('main [aria-label="Ajouter une image d’arrière-plan"], main [aria-label="Modifier l’image d’arrière-plan"]').first().click();
await page.waitForTimeout(3000);
await page.screenshot({ path: 'photos/c2-probe.png' });
process.exit(0);
