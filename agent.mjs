import { execSync } from 'node:child_process';
// LinkedIn prospecting agent, following the plan set in /admin › Prospection.
//   node agent.mjs daily   → first wave of invitations, withdrawals, search of 1st-to-3rd-year students, AI reposts
//   node agent.mjs invite  → a later wave of the day's invitations, nothing else (the day is spread over 3 waves)
//   node agent.mjs replies → only the messaging page: answers and follow-ups (by hand; the watch pass does it too)
//   node agent.mjs watch   → spot accepted invitations and send them the message with their booking link,
//                             then the video link of new bookings (notifier.mjs)
// Runs in the prospection Chrome (port 9333, signed in to LinkedIn), in its own tab, at a human pace.
import fs from 'node:fs';
import { api, browser as chrome, log as print, pause, PORT } from './lib.mjs';

const mode = process.argv[2] ?? 'watch';
const here = process.platform === 'linux' ? '/app/state/' : new URL('.', import.meta.url).pathname;
const who = PORT === '9333' ? 'Pierre' : 'Hippolyte';
const ME = PORT === '9333' ? /pierre cazaban/i : /hippolyte constantin/i;
const report = (kind, text) => { print(kind, text); if (process.env.DRY_RUN) return Promise.resolve(); return api('/api/outreach/log', { method: 'POST', body: JSON.stringify({ kind, text: `[${who}] ${text}` }) }).catch(() => {}); };
const DRY = !!process.env.DRY_RUN; // test: reads everything, sends and records nothing
const setStatus = (linkedin, status, error = '') => DRY ? print('[test] statut', linkedin, status, error) : api('/api/outreach/status', { method: 'POST', body: JSON.stringify({ linkedin, status, error }) });

// The watch pass only runs in the daytime (Paris): nobody answers a LinkedIn message at 3 a.m.
const hour = Number(new Date().toLocaleString('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false }));
if ((mode === 'watch' || mode === 'replies') && (hour < 9 || hour >= 20) && !process.env.DRY_RUN) process.exit(0);
// Signed out or restricted: one check every 2 hours is enough until Pierre signs in again (delete the file to retry at once).
const downFile = here + `deconnecte-${PORT}`;
if (fs.existsSync(downFile) && Date.now() - fs.statSync(downFile).mtimeMs < 2 * 3600e3) process.exit(0);

// A human does not open LinkedIn at :00 and :30 sharp: each scheduled pass starts a few minutes late, never the same.
if (!DRY && !process.env.NO_JITTER && process.platform === 'linux') await pause(0, mode === 'watch' ? 11 * 60e3 : 6 * 60e3);

const plan = await api('/api/outreach/plan');
if (plan.config.paused && !DRY) { print('pause', 'prospection en pause'); process.exit(0); }

// One run at a time (the daily run and the 30-minute watch can overlap otherwise).
const lock = here + `agent-${PORT}.lock`;
const busy = () => fs.existsSync(lock) && Date.now() - fs.statSync(lock).mtimeMs < 2 * 3600e3;
// A wave of invitations waits for the pass in progress (up to 25 min) instead of being lost; a watch pass just skips its turn.
if (mode === 'daily' || mode === 'invite') for (let i = 0; i < 50 && busy(); i++) await pause(30000, 30000);
if (busy()) { if (mode !== 'watch' && mode !== 'replies') print('verrou', 'un autre passage tourne déjà'); process.exit(0); }
fs.writeFileSync(lock, String(process.pid));
process.on('exit', () => { try { fs.unlinkSync(lock); } catch {} });

// Profile pages opened today, all passes together. LinkedIn restricted the account on 22/11 for viewing too many
// profiles: past the day's budget the agent opens no more profile (messages and replies do not need any).
const VISITS_MAX = Number(process.env.VISITS_MAX || 60);
const visitsFile = here + 'visites.json';
const dayKey = new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
const visits = (() => { try { const v = JSON.parse(fs.readFileSync(visitsFile, 'utf8')); return v.day === dayKey ? v : { day: dayKey, n: 0, warned: false }; } catch { return { day: dayKey, n: 0, warned: false }; } })();
class Budget extends Error {}
const visit = async (url) => {
  if (visits.n >= VISITS_MAX) {
    if (!visits.warned) { visits.warned = true; fs.writeFileSync(visitsFile, JSON.stringify(visits)); await report('limite', `Budget de ${VISITS_MAX} visites de profil atteint aujourd’hui : plus aucun profil ouvert jusqu’à demain.`); }
    throw new Budget('budget de visites de profil atteint');
  }
  visits.n++; if (!DRY) fs.writeFileSync(visitsFile, JSON.stringify(visits));
  await nav(url);
};

const b = await chrome();
const ctx = b.contexts()[0];
let page = await ctx.newPage();
// No resizing here: touching the window brings it to the front. Chrome is launched hidden at 1440×900 (lib.mjs).
// The Mac must never show the prospection Chrome: hide its app (like ⌘H) after each page load, just in case.
function hideChrome() {
  if (process.platform !== 'darwin') return;
  try {
    const pid = execSync(`pgrep -f "remote-debugging-port=${PORT}" | head -1`).toString().trim();
    if (pid) execSync(`osascript -e 'tell application "System Events" to set visible of (first process whose unix id is ${pid}) to false'`, { stdio: 'ignore' });
  } catch {}
}
// If the tab gets closed by hand, carry on in a new one instead of crashing.
// “En attente” shows on the profile, or — with Premium — inside the profile's “Plus” menu.
// The profile's own buttons carry the person's name (« Inviter Léa Bouchut à rejoindre… »); the side column suggests
// other people with the same kind of buttons. Always match the name, never the first button of the page.
const key = (name) => String(name || '').trim().split(/\s+/)[0].replace(/["\\]/g, '');
const isPending = async (name) => {
  const k = key(name);
  if (await page.locator(`main [aria-label^="En attente"][aria-label*="${k}"], main [aria-label^="Pending"][aria-label*="${k}"]`).filter({ visible: true }).count()) return true;
  const more = page.locator('main button[aria-label="Plus"], main button[aria-label="More"]').filter({ visible: true }).first();
  if (!(await more.count())) return false;
  await more.click(); await page.waitForTimeout(1200);
  const found = await page.locator(`[aria-label^="En attente, cliquez pour retirer"][aria-label*="${k}"], [aria-label^="Pending, click to withdraw"][aria-label*="${k}"]`).count();
  await page.keyboard.press('Escape').catch(() => {});
  return found > 0;
};
// Some LinkedIn dialogs live in a closed shadow DOM that page locators cannot see: find the text through the
// DevTools protocol (which sees inside it) and click the middle of its box. Returns false when the text is absent.
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
const nav = async (url) => { if (page.isClosed()) page = await ctx.newPage(); await page.goto(url, { waitUntil: 'domcontentloaded' }); hideChrome(); };
// Open chat windows sit on top of the page and swallow clicks: close them before acting.
const closeChats = async () => {
  for (const b of await page.locator('button[aria-label^="Fermer votre discussion"], button[aria-label^="Close your conversation"]').filter({ visible: true }).all()) await b.click().catch(() => {});
};
// Opens the conversation with a profile as a full page (the small messaging overlay now sits in a shadow DOM that swallows clicks).
// `href` = the « Message » link of that person on the connections page: no profile is opened to write to someone.
const openThread = async (href) => {
  await nav(new URL(href, 'https://www.linkedin.com').href.replace(/&?interop=msgOverlay/, '')); await pause(4000, 6000);
};
const signedIn = async (url = 'https://www.linkedin.com/feed/') => {
  await nav(url); await pause(3000, 5000);
  if (/login|checkpoint|authwall|uas/.test(page.url())) {
    const restricted = await page.getByText(/compte a été restreint|account has been restricted/i).count();
    fs.writeFileSync(downFile, new Date().toISOString());
    await report('erreur', restricted ? 'LinkedIn a restreint le compte : l’agent est à l’arrêt.' : 'LinkedIn déconnecté : reconnecte-toi dans le Chrome de prospection.');
    await page.close(); process.exit(1);
  }
  try { fs.unlinkSync(downFile); } catch {}
};

// ---------- conversations: read and written in the messaging page, never through the profiles ----------
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const hash = (t) => [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7).toString(36);
const store = here + 'replies.json';
const seen = fs.existsSync(store) ? JSON.parse(fs.readFileSync(store, 'utf8')) : {};
const memo = (p) => (seen[p.linkedin] ??= { done: [], auto: 0, sent: [] });
const saveSeen = () => fs.writeFileSync(store, JSON.stringify(seen, null, 1));
// Texts the agent sends: the plan's templates (and the older ones). Any other message of Pierre was typed by hand.
const tpl = (t) => new RegExp('^' + norm(String(t || '').slice(0, 60).split(/\{(?:prenom|ecole|lien)\}/).map(norm).filter((x) => x.length > 8).sort((a, b) => b.length - a.length)[0] || '\u0000'));
const isTpl = (re, text) => { const n = norm(text); return re.test(n) || re.test(n.replace(/^(bonjour|hello|salut) \S+ /, '')); };
const OURS = [tpl(plan.config.message), tpl(plan.config.followUp), tpl(plan.config.inviteNote), /je cherche la personne qui representera/, /^merci pour l ajout/, /je me permets de relancer/, /c est note pour .* voici le lien de la visio/];
const fill = (t, p) => String(t || '').replaceAll('{prenom}', p.first_name || '').replaceAll('{ecole}', p.school || 'ton école').replaceAll('{lien}', p.link);
/** The open conversation, oldest first: who wrote, and whether Pierre's lines came from the agent or from his own hands. */
const readThread = async (p) => {
  const raw = await page.evaluate(() => {
    const out = []; let who = '';
    for (const ev of [...document.querySelectorAll('.msg-s-message-list__event')].slice(-20)) {
      const name = ev.querySelector('.msg-s-message-group__name')?.textContent?.trim(); if (name) who = name;
      const body = ev.querySelector('.msg-s-event-listitem__body')?.textContent?.trim();
      if (body) out.push({ who, text: body });
    }
    return out;
  });
  const mine = memo(p);
  return raw.map((h) => {
    const from = ME.test(h.who) ? 'pierre' : 'student';
    return { from, text: h.text, byHand: from === 'pierre' && !OURS.some((re) => isTpl(re, h.text)) && !mine.sent.includes(hash(h.text)) };
  });
};
/** Types and sends in the open conversation, then checks the message really shows up in it. */
const sendHere = async (p, text) => {
  if (DRY) { print('[test] aurait envoyé à', p.name, ':', text); return; }
  const box = page.locator('.msg-form__contenteditable[contenteditable="true"], div[role="textbox"][contenteditable="true"]').last();
  await box.waitFor({ timeout: 15000 });
  await box.click(); await page.keyboard.insertText(text); await pause(1200, 2200);
  await page.locator('button.msg-form__send-button, button[type="submit"]').filter({ visible: true }).last().click();
  await pause(3000, 4500);
  const last = (await readThread(p)).pop();
  if (!last || last.from !== 'pierre' || norm(last.text).slice(0, 40) !== norm(text).slice(0, 40)) throw new Error('message non confirmé dans la conversation');
  memo(p).sent.push(hash(last.text)); memo(p).sent.push(hash(text)); saveSeen();
};
if (mode !== 'replies') await signedIn(); // the replies pass checks the session on the messaging page itself

const cards = () => page.evaluate(() => {
  const seen = new Set(); const r = [];
  for (const a of document.querySelectorAll('main a[href*="/in/"]')) {
    const href = a.href.split('?')[0]; if (seen.has(href)) continue;
    const card = a.closest('li') || a.parentElement; const t = (card?.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
    if (!t.length) continue; seen.add(href); r.push({ url: href, name: t[0].replace(/\s*•.*$/, ''), text: t.slice(1, 8).join(' | ') });
  }
  return r;
});

// ---------- daily: find, invite, repost  ·  list: only build the whole target list now ----------
if ((mode === 'daily' || mode === 'list' || mode === 'invite') && !(PORT !== '9333' && mode === 'list')) {
  // Target (22/11): 1st to 3rd year (was 1st year only). 4th and 5th years, masters, graduates and staff stay out.
  const FIRST = /(1 ?(è|e)re|premi(è|e)re|2 ?(è|e)?me|deuxi(è|e)me|seconde|3 ?(è|e)?me|troisi(è|e)me|1st|first|2nd|second|3rd|third)[- ]?(ann(é|e)e|year)|\b[123]A\b|bachelor ?[123]\b|\b[BL][123]\b|\bBBA ?[123]\b|\bBUT ?[123]\b|\bPGE ?1\b|freshman|sophomore/i;
  const NOT = /master|msc|\bM[12]\b|dscg|mba|infirmi|[4-9] ?(è|e)?me ann(é|e)e|quatri(è|e)me|cinqui(è|e)me|4th|5th|fourth|fifth|\b[45]A\b|\bB4\b|\bBBA ?4\b|\bPGE ?[23]\b|ieseg|iéseg|escp|edhec|skema|emlyon|neoma|essca|essec|polytechnique|a étudié|alumni|diplôm|enseignant|professeur|recruteur/i;
  const word = (s) => s.split(/\s+/).find((w) => w.length > 2) ?? s;

  const queue = mode === 'list' ? [] : (await api('/api/outreach/queue?status=found&limit=200')).prospects;

  // 2. The day's invitations, without a note
  let sent = 0;
  // Each account sends its own share; the second one takes the next students in the queue.
  // The day's quota is the one set in /admin (no hidden cap any more), sent in 3 waves: a third each, the last takes what is left.
  const wave = Math.ceil(plan.config.invitesPerDay / 3);
  const share = process.env.LAST_WAVE ? plan.invitesLeft : Math.min(plan.invitesLeft, wave);
  // The accounts run one after the other (10:30 Pierre, 11:30 Hippolyte): each takes the next students still waiting.
  for (const p of queue.slice(0, share)) {
    try {
      await visit(p.linkedin); await pause(4000, 6500); await closeChats();
      if (await page.getByText(/avez atteint la limite hebdomadaire|weekly invitation limit/i).count()) { await report('limite', 'LinkedIn signale la limite hebdomadaire : arrêt des invitations.'); break; }
      const connect = page.locator(`main a[aria-label^="Inviter ${key(p.name)}"], main button[aria-label^="Inviter ${key(p.name)}"]`).filter({ visible: true }).first();
      if (!(await connect.count())) {
        // Already a connection (1st degree): no invitation needed, the watch pass sends the message.
        if (await page.locator('main section').first().getByText(/·\s*1er|·\s*1st/).count()) { await setStatus(p.linkedin, 'accepted'); continue; }
        // Otherwise LinkedIn may hide « Se connecter » in the « Plus » menu.
        const more = page.locator('main button[aria-label="Plus"], main button[aria-label="More"]').filter({ visible: true }).first();
        if (await more.count()) { await more.click(); await pause(1000, 1600); }
        const inMenu = page.locator(`[aria-label^="Inviter ${key(p.name)}"], [aria-label^="Invite ${key(p.name)}"]`).filter({ visible: true }).first();
        if (!(await inMenu.count())) { await page.keyboard.press('Escape').catch(() => {}); await setStatus(p.linkedin, 'failed', 'pas de bouton Se connecter'); continue; }
        await inMenu.click();
      } else await connect.click();
      await pause(2000, 3000);
      const note = (plan.config.inviteNote || '').replaceAll('{prenom}', p.first_name || '').replaceAll('{ecole}', p.school || 'ton école').slice(0, 280);
      // The invitation dialog only (not a chat window that would also have an “Envoyer” button)
      const dialog = page.locator('[role=dialog]').filter({ has: page.getByRole('button', { name: /Ajouter une note|Add a note|Envoyer sans note|Send without/ }) }).last();
      const addNote = dialog.getByRole('button', { name: /Ajouter une note|Add a note/ });
      if (note && await addNote.count()) {
        await addNote.first().click(); await pause(1200, 2000);
        const box = page.locator('[role=dialog]').filter({ has: page.locator('textarea') }).last();
        await box.locator('textarea').first().fill(note); await pause(1200, 2000);
        const send = box.getByRole('button', { name: /^Envoyer|^Send/ }).last();
        if (await send.isEnabled({ timeout: 5000 })) await send.click();
        else throw new Error('bouton Envoyer de l’invitation désactivé');
      } else {
        const noNote = dialog.getByRole('button', { name: /Envoyer sans note|Send without a note/ });
        if (await noNote.count()) await noNote.first().click();
        else if (!(await clickHiddenText('Envoyer sans note')) && !(await clickHiddenText('Send without a note'))) throw new Error('fenêtre d’invitation introuvable');
      }
      await pause(2500, 3500);
      if (await page.getByText(/limite hebdomadaire|weekly invitation limit/i).count()) { await report('limite', 'LinkedIn signale la limite hebdomadaire : arrêt.'); break; }
      // Proof it went out: the profile now shows the invitation as pending
      await visit(p.linkedin); await pause(3500, 5000);
      if (!(await isPending(p.name))) throw new Error('invitation non confirmée par LinkedIn');
      await setStatus(p.linkedin, 'invited'); sent++;
    } catch (e) { if (e instanceof Budget) break; await setStatus(p.linkedin, 'failed', String(e.message || e).split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); }
    await pause(40000, 90000);
  }

  // 2b. Withdraw invitations still pending after withdrawAfterDays (a pile of ignored invitations hurts the account)
  if (mode === 'daily' && plan.config.withdrawAfterDays > 0) withdrawals: {
    const old = (await api('/api/outreach/queue?status=invited&limit=200')).prospects
      .filter((p) => Date.now() - new Date(p.invited_at).getTime() > plan.config.withdrawAfterDays * 864e5).slice(0, 8);
    for (const p of old) {
      try {
        await visit(p.linkedin); await pause(4000, 6000); await closeChats();
        let pending = page.locator(`main [aria-label^="En attente"][aria-label*="${key(p.name)}"], main [aria-label^="Pending"][aria-label*="${key(p.name)}"]`).filter({ visible: true }).first();
        if (!(await pending.count())) {
          const more = page.locator('main button[aria-label="Plus"], main button[aria-label="More"]').filter({ visible: true }).first();
          if (await more.count()) { await more.click(); await pause(1000, 1600); }
          pending = page.locator(`[aria-label^="En attente, cliquez pour retirer"][aria-label*="${key(p.name)}"], [aria-label^="Pending, click to withdraw"][aria-label*="${key(p.name)}"]`).filter({ visible: true }).first();
        }
        if (!(await pending.count())) { await page.keyboard.press('Escape').catch(() => {}); continue; } // not this account's invitation, or already answered
        await pending.click(); await pause(1500, 2500);
        await page.getByRole('button', { name: /^Retirer$|^Withdraw$/ }).filter({ visible: true }).last().click(); await pause(2000, 3000);
        await setStatus(p.linkedin, 'withdrawn');
        await report('retrait', `Invitation retirée (sans réponse depuis ${plan.config.withdrawAfterDays} jours) : ${p.name}`);
      } catch (e) { if (e instanceof Budget) break withdrawals; print('retrait', p.name, String(e.message || e).split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); }
      await pause(15000, 30000);
    }
  }
  if (mode !== 'list') await report('invitations', `${sent} invitation(s) envoyée(s) à ce passage (${plan.today.invites + sent} aujourd’hui sur ${plan.config.invitesPerDay})`);
  // 3. Then build the target list (after the invitations: those must not wait behind 20 minutes of searches): schools still short of perSchool first-years, within the day's search budget
  const counts = { ...(plan.schoolCounts || {}) };
  let searches = 0;
  const maxSearches = PORT !== '9333' || mode === 'invite' ? 0 : mode === 'list' ? 400 : plan.config.searchesPerDay; // searches from the main account only
  for (const school of plan.config.schools) {
    if (searches >= maxSearches) break;
    if ((counts[school] ?? 0) >= plan.config.perSchool) continue;
    if ((plan.recentlySearched || []).includes(school)) continue; // searched recently without enough results
    const re = new RegExp(word(school.replace(/^(BSB|EMLV|TSM|MOMA|PSTB|EGC)\s*[–—-]\s*/, '')).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const found = new Map();
    try {
    const plain = school.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+[–—-]\s+.*$/, '').trim(); // “GEM (…)”, “BSB – Burgundy…” search badly
    for (const q of [`1ère année ${plain}`, `2ème année ${plain}`, `3ème année ${plain}`, `Bachelor ${plain}`, `first year ${plain}`]) {
      if (found.size + (counts[school] ?? 0) >= plan.config.perSchool || searches >= maxSearches) break;
      await nav('https://www.linkedin.com/search/results/people/?keywords=' + encodeURIComponent(q));
      searches++;
      await pause(5000, 8000);
      if (await page.getByText(/limite d.utilisation commerciale|commercial use limit/i).count()) { await report('limite', 'LinkedIn : limite de recherches du compte gratuit atteinte ce mois-ci.'); searches = 1e9; break; }
      for (const p of await cards()) if (re.test(p.text) && FIRST.test(p.text) && !NOT.test(p.text) && !/Membre LinkedIn/.test(p.name)) found.set(p.url, { linkedin: p.url, name: p.name, school, headline: p.text.split(' | ')[0] });
      await pause(9000, 16000);
    }
    } catch (e) { print('recherche', school, String(e.message || e).split('\n')[0]); }
    await api('/api/outreach/searched', { method: 'POST', body: JSON.stringify({ school, found: found.size }) }).catch(() => {});
    const take = [...found.values()].slice(0, Math.max(0, plan.config.perSchool - (counts[school] ?? 0)));
    const { added } = await api('/api/outreach/prospects', { method: 'POST', body: JSON.stringify({ prospects: take }) });
    counts[school] = (counts[school] ?? 0) + added;
    await report('recherche', `${school} : ${counts[school]}/${plan.config.perSchool} étudiants de 1re à 3e année`);
  }
  const total = Object.values(counts).reduce((a, n) => a + n, 0);
  if (mode === 'list') await report('liste', `Liste construite : ${total} étudiants sur ${plan.config.schools.length * plan.config.perSchool} visés (${searches} recherches)`);

  // 3. One AI repost from a reliable source (latest post not reposted yet)
  if (mode === 'daily' && plan.repostsLeft > 0) {
    const SOURCES = ['anthropicresearch', 'openai', 'googledeepmind', 'mistralai']; // aiatmeta: its page triggers LinkedIn's anti-bot check
    const doneFile = here + 'reposts.json';
    const done = fs.existsSync(doneFile) ? JSON.parse(fs.readFileSync(doneFile, 'utf8')) : [];
    const start = new Date().getDate() % SOURCES.length;
    let reposted = 0;
    for (let i = 0; i < SOURCES.length && reposted < Math.min(Number(process.env.REPOSTS_PER_ACCOUNT || 2), plan.repostsLeft); i++) {
      const src = SOURCES[(start + i) % SOURCES.length];
      try {
        await nav(`https://www.linkedin.com/company/${src}/posts/`); await pause(6000, 9000);
        const post = page.locator('[data-urn^="urn:li:activity"]').first();
        if (!(await post.count())) continue;
        const urn = await post.getAttribute('data-urn');
        if (done.includes(urn)) continue;
        await post.getByRole('button', { name: /Republier|Repost/ }).first().click(); await pause(1500, 2500);
        await page.getByRole('menuitem', { name: /^Republier$|^Repost$|Republier instantanément/ }).or(page.getByText(/^Republier$/).filter({ visible: true })).first().click();
        await pause(3000, 4000);
        done.push(urn); fs.writeFileSync(doneFile, JSON.stringify(done.slice(-200)));
        await report('repost', `Republication d’un post de ${src}`); reposted++;
      } catch (e) { print('repost', src, String(e.message || e).split('\n')[0]); await page.keyboard.press('Escape').catch(() => {}); }
    }
  }
}

// ---------- watch: acceptances → first message (unless a conversation is already going on) ----------
if (mode === 'watch' || mode === 'daily') {
  // invited (maybe accepted since) + accepted whose message failed last time (retried)
  const invited = [...(await api('/api/outreach/queue?status=invited&limit=200')).prospects, ...(await api('/api/outreach/queue?status=accepted&limit=50')).prospects];
  if (invited.length && plan.messagesLeft > 0) {
    await nav('https://www.linkedin.com/mynetwork/invite-connect/connections/'); await pause(5000, 8000);
    for (let i = 0; i < 6; i++) { // the newest connections first
      await page.mouse.wheel(0, 3000); await pause(1200, 2000);
      await page.getByRole('button', { name: /Afficher plus de résultats|Show more results/ }).filter({ visible: true }).first().click({ timeout: 2000 }).catch(() => {});
    }
    const slug = (u) => decodeURIComponent(u).toLowerCase().replace(/\/$/, '').split('/in/')[1];
    // Each connection's card carries its « Message » link: the conversation opens from here, without visiting the profile.
    const cardsHere = await page.evaluate(() => {
      const out = []; const seen = new Set();
      for (const a of document.querySelectorAll('main a[href*="/in/"]')) {
        const href = a.href.split('?')[0]; if (seen.has(href)) continue; seen.add(href);
        let c = a, msg = null;
        for (let i = 0; i < 8 && c && !msg; i++) { c = c.parentElement; if (c && c.querySelectorAll('a[href*="/in/"]').length > 3) break; msg = c?.querySelector('a[href*="/messaging/"]'); }
        out.push({ href, msg: msg ? msg.getAttribute('href') : null });
      }
      return out;
    });
    const msgLink = new Map(cardsHere.map((c) => [slug(c.href), c.msg]));
    const connections = new Set(msgLink.keys());
    let messaged = 0;
    for (const p of invited) {
      if (messaged >= Math.min(plan.messagesLeft, 8)) break; // a few per pass
      const mem = memo(p);
      if ((mem.fails || 0) >= 3) continue; // given up after 3 failures: Pierre was told, no endless retries
      if (!connections.has(slug(p.linkedin))) {
        if (p.status !== 'accepted') continue; // not accepted yet
        // Marked accepted but not among the connections read on this pass: counted as a failure, no profile opened.
        mem.fails = (mem.fails || 0) + 1; if (!DRY) saveSeen();
        if (mem.fails >= 3) await report('à traiter', `${p.name} (${p.school}) : marqué « accepté » mais introuvable dans tes relations après 3 passages. Aucun message envoyé, à vérifier à la main : ${p.linkedin}`);
        continue;
      }
      if (p.status !== 'accepted') await setStatus(p.linkedin, 'accepted');
      try {
        const link = msgLink.get(slug(p.linkedin));
        if (!link) throw new Error('pas de lien Message sur la page des relations');
        await openThread(link);
        const turns = await readThread(p);
        // The student already answered the invitation note, Pierre wrote by hand, or the message is already there:
        // no template on top of a real conversation. The replies pass below takes it from here.
        if (turns.some((t) => t.from === 'student' || t.byHand) || turns.some((t) => t.from === 'pierre' && (isTpl(tpl(plan.config.message), t.text) || /^merci pour l ajout/.test(norm(t.text))))) {
          await setStatus(p.linkedin, 'messaged');
          await report('message', `Conversation déjà en cours avec ${p.name} (${p.school}) : pas de message type envoyé`);
        } else {
          await sendHere(p, fill(plan.config.message, p));
          await setStatus(p.linkedin, 'messaged'); messaged++;
          await report('message', `Premier message envoyé à ${p.name} (${p.school})`);
        }
        await closeChats();
        if (mem.fails) { mem.fails = 0; if (!DRY) saveSeen(); }
      } catch (e) {
        const why = String(e.message || e).split('\n')[0];
        mem.fails = (mem.fails || 0) + 1; if (!DRY) saveSeen();
        await setStatus(p.linkedin, 'accepted', 'message non envoyé : ' + why);
        if (mem.fails >= 3) await report('à traiter', `${p.name} (${p.school}) a accepté mais le premier message ne part pas (3 essais : ${why}). À toi de lui écrire : ${p.linkedin}`);
      }
      await pause(20000, 45000);
    }
  }
}

// ---------- watch: replies and follow-ups, from the messaging page (one page, no profile visit) ----------
if (mode === 'watch' || mode === 'replies') {
  const recent = (p) => Date.now() - new Date(p.messaged_at || p.invited_at || p.found_at).getTime() < 30 * 864e5;
  const all = [];
  for (const [st, n] of [['messaged', 150], ['booked', 50], ['accepted', 50], ['invited', 200]]) all.push(...(await api(`/api/outreach/queue?status=${st}&limit=${n}`)).prospects.filter(recent));
  const byName = new Map(all.map((p) => [norm(p.name), p]));

  await signedIn('https://www.linkedin.com/messaging/'); await pause(3000, 5000);
  const list = page.locator('.msg-conversations-container__conversations-list').first();
  for (let i = 0; i < 6; i++) { await list.evaluate((el) => el.scrollBy(0, 1500)).catch(() => {}); await pause(900, 1500); }
  await list.evaluate((el) => el.scrollTo(0, 0)).catch(() => {});
  const items = page.locator('li.msg-conversation-listitem');
  // LinkedIn only fills a conversation's line once it is on screen: bring each one into view before reading it.
  const rows = [];
  for (let i = 0, n = await items.count(); i < n && i < 60; i++) {
    const li = items.nth(i);
    await li.scrollIntoViewIfNeeded().catch(() => {}); await pause(250, 500);
    rows.push(await li.evaluate((el, i) => ({
      i, name: el.querySelector('.msg-conversation-listitem__participant-names')?.innerText?.trim() || '',
      snippet: el.querySelector('.msg-conversation-card__message-snippet, .msg-conversation-card__message-snippet-body')?.innerText?.trim() || '',
    }), i));
  }
  const complete = rows.length >= 5 && rows.every((r) => r.name);
  if (!rows.length) await report('erreur', 'Messagerie LinkedIn illisible : aucune conversation trouvée (la page a peut-être changé).');
  const inList = new Set(rows.map((r) => norm(r.name)));
  const due = (p) => p.status === 'messaged' && !p.followed_up_at && plan.config.followUpAfterDays > 0
    && (Date.now() - new Date(p.messaged_at).getTime()) / 864e5 >= plan.config.followUpAfterDays;

  let opened = 0;
  for (const row of rows) {
    const p = byName.get(norm(row.name));
    if (!p) continue;
    const theirs = !/^(Vous|You)\s*:/.test(row.snippet); // the student wrote last
    if (!theirs && !due(p)) continue; // nothing to do in this conversation: it is not even opened
    if (opened >= 15) break;
    const mine = memo(p);
    try {
      await items.nth(row.i).scrollIntoViewIfNeeded().catch(() => {});
      await items.nth(row.i).locator('.msg-conversation-listitem__link, a, .msg-conversation-card').first().click();
      await pause(3000, 5000); opened++;
      const turns = await readThread(p);
      const last = turns[turns.length - 1];
      if (!last) continue;

      // One follow-up when the student never wrote back (the invitation note also shows here as a message of Pierre)
      if (last.from === 'pierre') {
        if (due(p) && !turns.some((t) => t.from === 'student' || t.byHand)) {
          await sendHere(p, fill(plan.config.followUp, p));
          if (!DRY) await api('/api/outreach/followup', { method: 'POST', body: JSON.stringify({ linkedin: p.linkedin }) });
          await report('relance', `Relance envoyée à ${p.name} (${p.school})`);
        }
        continue;
      }

      const id = hash(last.text);
      if (mine.done.includes(id)) continue;
      mine.done.push(id);
      // Pierre is talking to this student himself: the agent stays out and tells him.
      if (turns.some((t) => t.byHand)) await report('à traiter', `${p.name} (${p.school}) t’a répondu dans une conversation que tu mènes toi-même : « ${last.text.slice(0, 200)} »`);
      else if (mine.auto >= 3) await report('à traiter', `${p.name} (${p.school}) a répondu, 3 réponses auto déjà envoyées : à toi de jouer. « ${last.text.slice(0, 200)} »`);
      else {
        if (DRY) { print('[test] réponse à rédiger pour', p.name, '←', last.text.slice(0, 120)); continue; }
        const r = await api('/api/outreach/reply', { method: 'POST', body: JSON.stringify({ linkedin: p.linkedin, name: p.name, firstName: p.first_name, school: p.school, link: p.link, history: turns.map(({ from, text }) => ({ from, text })) }) });
        if (!r.needsHuman && r.reply) { await sendHere(p, r.reply); mine.auto += 1; }
        // An answer to the invitation note counts as a conversation: no template message on top of it later.
        if (!r.declined && !r.contact && (p.status === 'invited' || p.status === 'accepted')) await setStatus(p.linkedin, 'messaged');
      }
      if (!DRY) saveSeen();
    } catch (e) { print('réponses', p.name, String(e.message || e).split('\n')[0]); }
    await pause(8000, 15000);
  }

  // Marked “messaged” but no conversation exists: the message never left. Back to “accepted”, the next pass sends it
  // (after checking the conversation, so nothing is ever sent twice).
  if (complete) for (const p of all) {
    if (p.status === 'messaged' && !inList.has(norm(p.name)) && Date.now() - new Date(p.messaged_at).getTime() < 14 * 864e5 && rows.length < 40) {
      await setStatus(p.linkedin, 'accepted', 'message introuvable dans la messagerie : renvoi au prochain passage');
    }
  }
}

await page.close().catch(() => {});
// A LinkedIn tab left open between two passes keeps growing (820 Mo on 22/11): leave it blank. The session is in the profile.
if (process.platform === 'linux' && !DRY) for (const other of ctx.pages()) if (/linkedin\.com/.test(other.url())) await other.goto('about:blank').catch(() => {});
process.exit(0);
