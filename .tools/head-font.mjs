// A11 head edit (PAGES builder, 7 Nov 2026). Idempotent.
// On every page that loads the Google Fonts sheet (never index.html, play/, j/): replace the two preconnects and the
// stylesheet link with the self-hosted preload, and add <meta name="color-scheme" content="dark"> after the viewport meta.
import { apply } from './lib.mjs';
const PRELOAD = '<link rel="preload" href="/fonts/bricolage-800-latin.woff2" as="font" type="font/woff2" crossorigin>';
const SHEET = /^([ \t]*)<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Bricolage\+Grotesque:opsz,wght@12\.\.96,800&display=swap">[ \t]*(\r?\n)/m;
const PRE1 = /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[ \t]*\r?\n/m;
const PRE2 = /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>[ \t]*\r?\n/m;
const VIEWPORT = /^([ \t]*)<meta name="viewport"[^>]*>[ \t]*(\r?\n)/m;
const SCHEME = '<meta name="color-scheme" content="dark">';
// Pages whose h1/h2/h3 draw a character only the latin-ext file covers (Polish, Czech) also preload that file, so the
// brand face is not a late swap on exactly the headings the plan said must not lose it. Google's latin-ext range, minus
// anything the latin file also covers (U+0304, U+0308, U+0329).
const PRELOAD_EXT = '<link rel="preload" href="/fonts/bricolage-800-latin-ext.woff2" as="font" type="font/woff2" crossorigin>';
const EXT = [[0x100,0x2BA],[0x2BD,0x2C5],[0x2C7,0x2CC],[0x2CE,0x2D7],[0x2DD,0x2FF],[0x1D00,0x1DBF],[0x1E00,0x1E9F],[0x1EF2,0x1EFF],[0x2020,0x2020],[0x20A0,0x20AB],[0x20AD,0x20C4],[0x2113,0x2113],[0x2C60,0x2C7F],[0xA720,0xA7FF]];
const LATIN_ALSO = new Set([0x131, 0x152, 0x153, 0x2BB, 0x2BC, 0x2C6, 0x2DA, 0x2DC]);
function headingsNeedExt(s) {
  const heads = [...s.matchAll(/<h[123][\s>][\s\S]*?<\/h[123]>/g)].map(m => m[0].replace(/<[^>]*>/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d)));
  for (const h of heads) for (const ch of h) { const cp = ch.codePointAt(0); if (!LATIN_ALSO.has(cp) && EXT.some(([a, b]) => cp >= a && cp <= b)) return true; }
  return false;
}
const res = apply('head-font', (rel, s) => {
  const hasGoogle = /fonts\.(googleapis|gstatic)\.com/.test(s), hasPreload = s.includes('/fonts/bricolage-800-latin.woff2');
  if (!hasGoogle && !hasPreload) return null;               // never loaded the font: leave alone
  let t = s;
  if (hasGoogle) {
    if (!SHEET.test(t)) return { note: 'UNEXPECTED: Google link not in the standard shape, left alone' };
    t = t.replace(PRE1, '').replace(PRE2, '').replace(SHEET, (m, ind, nl) => ind + PRELOAD + nl);
  }
  if (headingsNeedExt(t) && !t.includes('bricolage-800-latin-ext.woff2')) t = t.replace(PRELOAD, PRELOAD + '\n  ' + PRELOAD_EXT);
  if (!/name="color-scheme"/.test(t)) {
    if (!VIEWPORT.test(t)) return { note: 'UNEXPECTED: no viewport meta, left alone' };
    t = t.replace(VIEWPORT, (m, ind, nl) => m + ind + SCHEME + nl);
  }
  if (/fonts\.(googleapis|gstatic)\.com/.test(t)) return { note: 'UNEXPECTED: Google font reference remains, left alone' };
  return t;
});
for (const n of res.notes) console.log('  ' + n);
