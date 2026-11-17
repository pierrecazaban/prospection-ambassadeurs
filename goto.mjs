// Usage: node goto.mjs URL — ouvre l'URL dans l'onglet LinkedIn du Chrome de prospection
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('linkedin.com')) ?? (await ctx.newPage());
await page.goto(process.argv[2], { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await page.bringToFront();
console.log(page.url(), '|', await page.title());
process.exit(0);
