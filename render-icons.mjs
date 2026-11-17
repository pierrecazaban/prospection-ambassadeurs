import { chromium } from 'playwright';
import fs from 'node:fs';
const R = '/Users/pierrecazaban/Projets/the-ai-certification';
const F = R + '/brand/propositions/tac/final/';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9333');
const page = await browser.contexts()[0].newPage();
async function png(svgFile, out, w, h, { bg = 'transparent', fit = 'contain' } = {}) {
  const svg = fs.readFileSync(F + svgFile, 'utf8').replace(/ width="[\d.]+" height="[\d.]+"/, ' width="100%" height="100%" preserveAspectRatio="xMidYMid meet"');
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:${bg};width:${w}px;height:${h}px">${svg}</body></html>`);
  await page.waitForTimeout(150);
  await page.screenshot({ path: out, omitBackground: bg === 'transparent', clip: { x: 0, y: 0, width: w, height: h } });
}
await png('mark.svg', R + '/public/icon-192.png', 192, 192);
await png('mark.svg', R + '/public/icon-512.png', 512, 512);
await png('icon-maskable.svg', R + '/public/icon-maskable-512.png', 512, 512);
await png('mark.svg', R + '/public/apple-touch-icon.png', 180, 180);
await png('mark.svg', R + '/public/assets/mark-email.png', 96, 96);
await png('mark-white.svg', R + '/public/assets/mark-email-white.png', 96, 96);
await png('logo-white.svg', R + '/public/assets/logo-email-white.png', 266, 60);
await page.close(); process.exit(0);
