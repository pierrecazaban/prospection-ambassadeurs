// Registers the prospects of suivi.csv on the site and writes their personal /call link in a "lien_call" column.
import fs from 'node:fs';
import { api } from './lib.mjs';

const file = new URL('./suivi.csv', import.meta.url).pathname;
const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
const head = lines[0].split(',');
if (!head.includes('lien_call')) head.push('lien_call');
const rows = lines.slice(1).map((l) => { const v = l.split(','); return Object.fromEntries(head.map((h, i) => [h, v[i] ?? ''])); });
const todo = rows.filter((r) => !r.lien_call);
const { links } = await api('/api/calls/prospects', {
  method: 'POST',
  body: JSON.stringify({ prospects: todo.map((r) => { const [f, ...l] = r.nom.split(' '); return { linkedin: r.linkedin, first_name: f, last_name: l.join(' '), school: r.ecole }; }) }),
});
const byUrl = new Map(links.map((l) => [l.linkedin, l.url]));
for (const r of todo) r.lien_call = byUrl.get(r.linkedin) ?? '';
fs.writeFileSync(file, [head.join(','), ...rows.map((r) => head.map((h) => r[h]).join(','))].join('\n') + '\n');
console.log(`${links.length} liens personnels créés`);
