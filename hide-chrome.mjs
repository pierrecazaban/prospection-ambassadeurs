// Minimizes every window of a prospection Chrome so it never pops up in front of the user.
import { chromium } from 'playwright';
const port = process.argv[2] || '9333';
await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).catch(() => {});
const b = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
const ctx = b.contexts()[0];
const seen = new Set();
for (const p of ctx.pages()) {
  const s = await ctx.newCDPSession(p);
  const { windowId } = await s.send('Browser.getWindowForTarget');
  if (seen.has(windowId)) continue; seen.add(windowId);
  const { bounds } = await s.send('Browser.getWindowBounds', { windowId });
  if (bounds.windowState === 'fullscreen' || bounds.windowState === 'maximized') { await s.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } }); await new Promise((r) => setTimeout(r, 800)); }
  await s.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
}
console.log(port, 'fenêtres masquées:', seen.size);
process.exit(0);
