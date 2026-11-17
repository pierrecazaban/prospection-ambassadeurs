import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = browser.contexts()[0].pages().find((p) => p.url().includes('/in/pierre-cazaban'));
await page.keyboard.press('Escape'); await page.waitForTimeout(800);
const discard = page.getByRole('button', { name: /Ignorer|Annuler|Discard/ });
if (await discard.count()) await discard.first().click().catch(() => {});
process.exit(0);
