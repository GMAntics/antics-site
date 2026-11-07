// A10 (PAGES builder, 7 Nov 2026). Idempotent.
// /drinking-games/ "which game" table: give it the stacked pattern /best-party-game-apps/ already uses so it never scrolls
// sideways on a phone (site.css section 29, .compare): wrapper gets "compare", head cells get scope="col", the first cell of
// each row becomes <th scope="row">, every other cell gets data-label from its column header, and a visually hidden caption
// names the table. Every visible word is unchanged on desktop. The Christmas word table's padding fix is CSS: .tools/A10.css.
import { apply } from './lib.mjs';
const CAPTION = 'Drinking games at a glance';
const res = apply('drinking-table', (rel, s) => {
  if (rel !== 'drinking-games/index.html') return null;
  if (s.includes('<div class="table-wrap compare">')) return s;       // already applied
  const wrap = '<div class="table-wrap">\n        <table>\n          <thead>';
  if (s.split(wrap).length !== 2) return { note: 'UNEXPECTED: table wrapper not found exactly once' };
  const start = s.indexOf(wrap), end = s.indexOf('</table>', start) + '</table>'.length;
  let block = s.slice(start, end);
  const head = block.match(/<thead><tr>((?:<th>[^<]*<\/th>)+)<\/tr><\/thead>/); if (!head) return { note: 'UNEXPECTED: thead shape' };
  const labels = [...head[1].matchAll(/<th>([^<]*)<\/th>/g)].map(m => m[1]);
  block = block.replace(head[0], `<thead><tr>${labels.map(l => `<th scope="col">${l}</th>`).join('')}</tr></thead>`);
  let rows = 0;
  block = block.replace(/<tr>((?:<td>[^<]*<\/td>){4})<\/tr>/g, (m, cells) => {
    const c = [...cells.matchAll(/<td>([^<]*)<\/td>/g)].map(x => x[1]); rows++;
    return `<tr><th scope="row">${c[0]}</th>${c.slice(1).map((v, i) => `<td data-label="${labels[i + 1]}">${v}</td>`).join('')}</tr>`;
  });
  if (!rows || /<tbody>[\s\S]*<tr><td>/.test(block)) return { note: 'UNEXPECTED: some rows not converted' };
  block = block.replace('<div class="table-wrap">\n        <table>', `<div class="table-wrap compare">\n        <table>\n          <caption class="visually-hidden">${CAPTION}</caption>`);
  return s.slice(0, start) + block + s.slice(end);
});
for (const n of res.notes) console.log('  ' + n);
