// Withdraws today's invitations sent to people who are not in the prospect list (side-column mis-clicks of 17 Nov).
import { execSync } from 'node:child_process';
import { api, browser, pause } from './lib.mjs';
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const known = new Set();
for (const st of ['found', 'invited', 'accepted', 'messaged', 'booked', 'declined', 'withdrawn', 'failed'])
  for (const p of (await api(`/api/outreach/queue?status=${st}&limit=200`)).prospects) known.add(norm(p.name));
const b = await browser(); const ctx = b.contexts()[0]; const page = await ctx.newPage();
const c = await ctx.newCDPSession(page); const { windowId } = await c.send('Browser.getWindowForTarget');
await c.send('Browser.setWindowBounds', { windowId, bounds: { width: 1440, height: 900 } });
const hide = () => { try { const pid = execSync('pgrep -f "remote-debugging-port=9333" | head -1').toString().trim(); execSync(`osascript -e 'tell application "System Events" to set visible of (first process whose unix id is ${pid}) to false'`); } catch {} };
const clickHiddenText = async (text) => {
  const s = await page.context().newCDPSession(page);
  try {
    await s.send('DOM.getDocument', { depth: -1, pierce: true });
    const { searchId, resultCount } = await s.send('DOM.performSearch', { query: text, includeUserAgentShadowDOM: true });
    if (!resultCount) return false;
    const { nodeIds } = await s.send('DOM.getSearchResults', { searchId, fromIndex: 0, toIndex: resultCount });
    for (const id of nodeIds.reverse()) {
      try {
        const { model } = await s.send('DOM.getBoxModel', { nodeId: id });
        const q = model.content; const x = (q[0] + q[4]) / 2; const y = (q[1] + q[5]) / 2;
        if (x > 0 && y > 0) { await page.mouse.click(x, y); return true; }
      } catch {}
    }
    return false;
  } finally { await s.detach().catch(() => {}); }
};
const boxes = async (text) => {
  const s = await page.context().newCDPSession(page); const out = [];
  try {
    await s.send('DOM.getDocument', { depth: -1, pierce: true });
    const { searchId, resultCount } = await s.send('DOM.performSearch', { query: text, includeUserAgentShadowDOM: true });
    if (!resultCount) return out;
    const { nodeIds } = await s.send('DOM.getSearchResults', { searchId, fromIndex: 0, toIndex: resultCount });
    for (const id of nodeIds) { try { const { model } = await s.send('DOM.getBoxModel', { nodeId: id }); const q = model.content; out.push({ x: (q[0] + q[4]) / 2, y: (q[1] + q[5]) / 2 }); } catch {} }
  } finally { await s.detach().catch(() => {}); }
  return out;
};
// The confirmation dialog: its « Retirer » button sits just below the title « Retirer l’invitation ».
const confirmWithdraw = async () => {
  // « Annuler » and « Retirer » sit side by side at the bottom of the dialog: the closest « Retirer » on Annuler's line, to its right.
  const cancel = (await boxes('Annuler')).filter((b) => b.x > 0 && b.y > 0)[0];
  if (!cancel) return false;
  const btn = (await boxes('Retirer')).filter((b) => Math.abs(b.y - cancel.y) < 15 && b.x > cancel.x).sort((a, b) => a.x - b.x)[0];
  if (!btn) return false;
  await page.mouse.click(btn.x, btn.y); return true;
};
let done = 0;
for (let round = 0; round < 25; round++) {
  await page.goto('https://www.linkedin.com/mynetwork/invitation-manager/sent/', { waitUntil: 'domcontentloaded' }); hide(); await pause(5000, 7000);
  const cards = await page.evaluate(() => [...document.querySelectorAll('main button, main a')].filter((e) => /^Retirer$/.test(e.innerText.trim())).map((btn, i) => {
    let card = btn; for (let k = 0; k < 8 && card && !/Envoy/.test(card.innerText); k++) card = card.parentElement;
    const lines = (card?.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    return { i, name: lines[0], when: lines.find((l) => /^Envoy/.test(l)) || '' };
  }));
  const target = cards.find((x) => /aujourd|minute|heure/i.test(x.when) && !known.has(String(x.name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()));
  if (!target) { console.log('plus rien à retirer'); break; }
  await page.locator('main button, main a').filter({ hasText: /^Retirer$/ }).nth(target.i).click(); await pause(1500, 2500);
  await page.screenshot({ path: process.env.SHOT || '/dev/null' }).catch(() => {});
  if (!(await confirmWithdraw())) throw new Error('confirmation introuvable');
  await pause(2500, 4000);
  if (process.env.ONE) { await page.screenshot({ path: process.env.SHOT + '.after.png' }); console.log('test', target); break; }
  console.log('retirée :', target.name, '(', target.when, ')'); done++;
}
console.log(done, 'invitation(s) retirée(s)');
await page.close(); process.exit(0);
