// One-off: puts the students already found today into the site's list (Audencia: already invited).
import fs from 'node:fs';
import { api } from './lib.mjs';
const all = JSON.parse(fs.readFileSync('etudiants-1a.json', 'utf8'));
const BAD = /master|msc|\bM1\b|dscg|enseignant|wedding|3(è|e)me ann|alternance - ICN|Citoyen engagé/i;
const list = [];
for (const [school, ps] of Object.entries(all)) for (const p of ps) if (!BAD.test(p.text)) list.push({ linkedin: p.url, name: p.name, school, headline: p.text.split(' | ').find((t) => !/^•/.test(t)) ?? '' });
console.log('ajoutés', (await api('/api/outreach/prospects', { method: 'POST', body: JSON.stringify({ prospects: list }) })).added);
for (const i of JSON.parse(fs.readFileSync('invitations.json', 'utf8')).filter((x) => x.status === 'envoyée'))
  await api('/api/outreach/status', { method: 'POST', body: JSON.stringify({ linkedin: i.url, status: 'invited' }) });
console.log('Audencia marqués invités');
