import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'photos/hdr-m.png', clip: { x: 0, y: 0, width: 393, height: 420 } });
const t = page.locator('.menu-toggle').first(); if (await t.count()) { await t.click(); await page.waitForTimeout(400); await page.screenshot({ path: 'photos/hdr-menu.png' }); }
const d = await (await browser.newContext({ viewport: { width: 1280, height: 500 } })).newPage();
await d.goto('http://localhost:3111/', { waitUntil: 'networkidle' }); await d.screenshot({ path: 'photos/hdr-d.png', clip: { x: 0, y: 0, width: 1280, height: 200 } });
await d.goto('http://localhost:3111/call', { waitUntil: 'networkidle' }); await d.screenshot({ path: 'photos/hdr-call.png', clip: { x: 0, y: 0, width: 1280, height: 140 } });
await browser.close();
