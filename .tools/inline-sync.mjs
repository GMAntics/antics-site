// INTEGRATOR (7 Nov 2026): the two inline-CSS pages, index.html and play/index.html. Idempotent.
// 1. Head: the Google Fonts preconnects and sheet become the self-hosted latin preload (same place);
//    <meta name="color-scheme" content="dark"> after the viewport meta if the page has none.
// 2. <style>: the block at its top is re-synced from css/site.css: the latin @font-face and the
//    "Bricolage Fallback" face from section 0 (neither page draws a latin-ext character in the display
//    face: index.html's only one is "Čeština" in a body-font footer link), then section 1, the tokens,
//    all WITHOUT comments. Re-running finds the old block by its end, the --gutter media rule.
// 3. index.html only (HOME.md "for the coordinator"): its literals rgba(255,255,255,0.45) and
//    cubic-bezier(.2,.8,.2,1) become the CSS builder's tokens --line-control and --ease-deal.
// 4. Every comment in both inline <style> blocks is removed (rules untouched). No further minifying.
import fs from 'node:fs'; import path from 'node:path';
import { ROOT } from './lib.mjs';

const css = fs.readFileSync(path.join(ROOT, 'css/site.css'), 'utf8');
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const tidy = (s) => s.split('\n').map((l) => l.replace(/[ \t]+$/, '')).filter((l) => l.trim() !== '').join('\n');

// Section 0: the faces
const faces = [...css.matchAll(/@font-face \{[\s\S]*?\n\}/g)].map((m) => m[0]);
const latin = faces.find((f) => f.includes('/fonts/bricolage-800-latin.woff2'));
const fallback = faces.find((f) => f.includes('"Bricolage Fallback"'));
if (!latin || !fallback) throw new Error('site.css section 0 faces not found');
// Section 1: the tokens, from its header to the --gutter media rule
const s1Start = css.indexOf(':root {', css.indexOf('   1. Tokens'));
const GUTTER = '@media (min-width: 768px) {\n  :root { --gutter: 32px; }\n}';
const s1End = css.indexOf(GUTTER, s1Start);
if (s1Start < 0 || s1End < 0) throw new Error('site.css section 1 not found');
const tokens = css.slice(s1Start, s1End + GUTTER.length);
const block = tidy(stripComments([latin, fallback, tokens].join('\n')));
if (!block.endsWith(':root { --gutter: 32px; }\n}')) throw new Error('block does not end on the gutter rule');

const PRELOAD = '<link rel="preload" href="/fonts/bricolage-800-latin.woff2" as="font" type="font/woff2" crossorigin>';
const SHEET = /^([ \t]*)<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Bricolage\+Grotesque:opsz,wght@12\.\.96,800&display=swap">[ \t]*\r?\n/m;
const PRE1 = /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[ \t]*\r?\n/m;
const PRE2 = /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>[ \t]*\r?\n/m;
const VIEWPORT = /^([ \t]*)<meta name="viewport"[^>]*>[ \t]*\r?\n/m;
const GUTTER_ANY = /@media \(min-width: 768px\) \{\s*:root \{ --gutter: 32px; \}\s*\}/;

const PAGES = [
  { rel: 'index.html', indent: '', literals: true },
  { rel: 'play/index.html', indent: '    ', literals: false },
];
let changed = 0;
for (const pg of PAGES) {
  const file = path.join(ROOT, pg.rel);
  const before = fs.readFileSync(file, 'utf8');
  let t = before;
  // 1. head
  if (/fonts\.(googleapis|gstatic)\.com/.test(t)) {
    if (!SHEET.test(t)) throw new Error(pg.rel + ': Google sheet not in the standard shape');
    t = t.replace(PRE1, '').replace(PRE2, '').replace(SHEET, (m, ind) => ind + PRELOAD + '\n');
  }
  // The preload may carry a media attribute (PLAY review fix, 7 Nov: /play/ preloads the face only from 481px), so accept
  // any attributes after crossorigin rather than the exact tag.
  if (!/<link rel="preload" href="\/fonts\/bricolage-800-latin\.woff2" as="font" type="font\/woff2" crossorigin[^>]*>/.test(t)) throw new Error(pg.rel + ': no preload after the head edit');
  if (!/name="color-scheme"/.test(t)) t = t.replace(VIEWPORT, (m, ind) => m + ind + '<meta name="color-scheme" content="dark">\n');
  // 2 to 4. the one inline <style>
  const open = t.indexOf('<style>'), close = t.indexOf('</style>', open);
  if (open < 0 || close < 0 || t.indexOf('<style>', open + 1) > -1) throw new Error(pg.rel + ': expected exactly one <style>');
  let st = t.slice(open + '<style>'.length, close);
  if (/["']\/\*|\*\/["']/.test(st)) throw new Error(pg.rel + ': a comment marker inside a string; strip by hand');
  const g = st.match(GUTTER_ANY);
  if (!g) throw new Error(pg.rel + ': token block end (the --gutter rule) not found');
  if ((st.match(/--gutter: 32px/g) || []).length !== 1) throw new Error(pg.rel + ': --gutter rule not unique');
  let rest = st.slice(g.index + g[0].length);
  if (pg.literals) rest = rest.split('rgba(255,255,255,0.45)').join('var(--line-control)').split('cubic-bezier(.2,.8,.2,1)').join('var(--ease-deal)');
  rest = stripComments(rest).split('\n').map((l) => l.replace(/[ \t]+$/, '')).filter((l) => l.trim() !== '').join('\n');
  const head = block.split('\n').map((l) => pg.indent + l).join('\n');
  st = '\n' + head + '\n' + rest.replace(/^\n+/, '') + '\n  ';
  t = t.slice(0, open + '<style>'.length) + st + t.slice(close);
  if (/\/\*/.test(t.slice(open, t.indexOf('</style>', open)))) throw new Error(pg.rel + ': a comment survived');
  if (t !== before) { fs.writeFileSync(file, t); changed++; }
}
console.log(`inline-sync: 2 page(s) in scope, ${changed} changed${changed ? '' : ' (nothing to do, already applied)'}`);
