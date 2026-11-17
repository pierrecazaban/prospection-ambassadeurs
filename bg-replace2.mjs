import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban'));
const dlg = () => page.evaluate(() => [...document.querySelectorAll('[role=dialog] button, [role=dialog] label, dialog button, [role=dialog] a')].filter(b=>b.offsetParent).map(b => (b.innerText.trim()||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,50)).filter(Boolean));
await page.locator('main [aria-label="Modifier l’image d’arrière-plan"]').first().click();
await page.waitForTimeout(3000);
console.log('dialogue:', await dlg());
process.exit(0);
