// Shared helpers for the PAGES builder's idempotent scripts (7 Nov 2026).
// Every script: reads each page, computes the new text, writes ONLY if it differs, prints a count. Re-running changes nothing.
import fs from 'node:fs'; import path from 'node:path';
export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
// Pages the PAGES builder never touches (brief): the home page, /play/, /j/, plus tooling and git.
const SKIP_DIRS = new Set(['.git', '.tools', 'node_modules', 'play', 'j']);
export function pages({ includeSkipped = false } = {}) {
  const out = [];
  (function walk(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { if (!includeSkipped && !rel && SKIP_DIRS.has(e.name)) continue; if (e.name === '.git' || e.name === 'node_modules') continue; walk(path.join(dir, e.name), rel ? rel + '/' + e.name : e.name); }
      else if (e.name.endsWith('.html')) { const r = rel ? rel + '/' + e.name : e.name; if (!includeSkipped && r === 'index.html') continue; out.push(r); }
    }
  })(ROOT, '');
  return out.sort();
}
export const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
export function apply(label, fn, opts) {
  let changed = 0, seen = 0; const notes = [];
  for (const rel of pages(opts)) {
    const before = read(rel); const r = fn(rel, before);
    if (r == null) continue;
    seen++;
    if (typeof r === 'string' && r !== before) { fs.writeFileSync(path.join(ROOT, rel), r); changed++; }
    if (r && r.note) notes.push(rel + ': ' + r.note);
  }
  console.log(`${label}: ${seen} page(s) in scope, ${changed} changed${changed ? '' : ' (nothing to do, already applied)'}`);
  return { seen, changed, notes };
}
