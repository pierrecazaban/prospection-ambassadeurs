// One pass over the invited prospects (and the "non confirmée" ones): already a 1st-degree connection → accepted (the watch pass messages them).
import { execSync } from 'node:child_process';
import { api, browser, pause } from './lib.mjs';
const b = await browser(); const ctx = b.contexts()[0]; const page = await ctx.newPage();
const hide = () => { try { const pid = execSync('pgrep -f "remote-debugging-port=9333" | head -1').toString().trim(); execSync(`osascript -e 'tell application "System Events" to set visible of (first process whose unix id is ${pid}) to false'`); } catch {} };
const q = [...(await api('/api/outreach/queue?status=invited&limit=200')).prospects,
  ...(await api('/api/outreach/queue?status=failed&limit=200')).prospects.filter((p) => /non confirmée|introuvable/.test(p.error || ''))];
let n = 0;
for (const p of q) {
  try {
    await page.goto(p.linkedin, { waitUntil: 'domcontentloaded' }); hide(); await pause(4000, 6000);
    if (await page.locator('main').getByText(/·\s*1er|·\s*1st/).count()) {
      await api('/api/outreach/status', { method: 'POST', body: JSON.stringify({ linkedin: p.linkedin, status: 'accepted' }) });
      console.log('a accepté :', p.name, '-', p.school); n++;
    }
  } catch (e) { console.log('?', p.name, String(e.message).split('\n')[0]); }
  await pause(5000, 9000);
}
console.log(`${n} acceptation(s) trouvée(s) sur ${q.length} invitations`);
await page.close(); process.exit(0);
