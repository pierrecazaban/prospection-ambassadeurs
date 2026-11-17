import fs from 'node:fs';
import { api } from './lib.mjs';
const all = JSON.parse(fs.readFileSync('etudiants-1a.json', 'utf8'));
const list = all['Audencia'];
const { links } = await api('/api/calls/prospects', { method: 'POST', body: JSON.stringify({ prospects: list.map((p) => {
  const [first, ...rest] = p.name.trim().split(/\s+/); return { linkedin: p.url, first_name: first, last_name: rest.join(' '), school: 'Audencia' }; }) }) });
const out = list.map((p) => ({ name: p.name, url: p.url, link: links.find((l) => l.linkedin === p.url)?.url }));
fs.writeFileSync('audencia-liens.json', JSON.stringify(out, null, 1));
for (const o of out) {
  const first = o.name.split(/\s+/)[0];
  const note = `Bonjour ${first}, on cherche LA personne qui représentera The AI Certification à Audencia : un seul ambassadeur par école, 10 % de commission. On est déjà à l'ESCP, l'EDHEC et emlyon. Partant pour en parler 45 min ? Choisis ton créneau : ${o.link.replace('https://', '')}`;
  console.log(note.length, '|', note);
}
