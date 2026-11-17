import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const p = b.contexts()[0].pages()[0];
await p.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
await p.bringToFront();
console.log(p.url());
process.exit(0);
