// A11 head edit (PAGES builder, 7 Nov 2026). Idempotent.
// On every page that loads the Google Fonts sheet (never index.html, play/, j/): replace the two preconnects and the
// stylesheet link with the self-hosted preload, and add <meta name="color-scheme" content="dark"> after the viewport meta.
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
import { apply, ROOT } from './lib.mjs';
const PRELOAD = '<link rel="preload" href="/fonts/bricolage-800-latin.woff2" as="font" type="font/woff2" crossorigin>';
const SHEET = /^([ \t]*)<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=Bricolage\+Grotesque:opsz,wght@12\.\.96,800&display=swap">[ \t]*(\r?\n)/m;
const PRE1 = /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[ \t]*\r?\n/m;
const PRE2 = /^[ \t]*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>[ \t]*\r?\n/m;
const VIEWPORT = /^([ \t]*)<meta name="viewport"[^>]*>[ \t]*(\r?\n)/m;
const SCHEME = '<meta name="color-scheme" content="dark">';
// THE LATIN-EXT PRELOAD (polish 2, DQA-3, 7 Nov 2026). It is kept ONLY where the first phone screen's display text
// needs the latin-ext file: the H1, or the card a generator deals on arrival (display face, on the first screen of
// every phone). The dealt card is random, so it counts when at least half of the free cards in its deck
// (/<lang>/cards.js) need the file. Everywhere else the preload is a wasted request: @font-face unicode-range still
// fetches latin-ext the moment a lower heading needs it. Other display text on a first phone screen (the install
// bar's "Antics", the Imposter stepper's count, the first game tiles on /pl/ and /cs/) was measured at 390x844 and
// 360x740 and needs no latin-ext. A character needs it when it is in the latin-ext unicode-range and NOT in the latin
// one (css/site.css section 0: where the ranges overlap, the latin face is declared last and wins).
const PRELOAD_EXT = '<link rel="preload" href="/fonts/bricolage-800-latin-ext.woff2" as="font" type="font/woff2" crossorigin>';
const PRELOAD_EXT_LINE = /^[ \t]*<link rel="preload" href="\/fonts\/bricolage-800-latin-ext\.woff2"[^>]*>[ \t]*\r?\n/m;
const EXT = [[0x100,0x2BA],[0x2BD,0x2C5],[0x2C7,0x2CC],[0x2CE,0x2D7],[0x2DD,0x2FF],[0x304,0x304],[0x308,0x308],[0x329,0x329],[0x1D00,0x1DBF],[0x1E00,0x1E9F],[0x1EF2,0x1EFF],[0x2020,0x2020],[0x20A0,0x20AB],[0x20AD,0x20C4],[0x2113,0x2113],[0x2C60,0x2C7F],[0xA720,0xA7FF]];
const LATIN = [[0x0,0xFF],[0x131,0x131],[0x152,0x153],[0x2BB,0x2BC],[0x2C6,0x2C6],[0x2DA,0x2DA],[0x2DC,0x2DC],[0x304,0x304],[0x308,0x308],[0x329,0x329],[0x2000,0x206F],[0x20AC,0x20AC],[0x2122,0x2122],[0x2191,0x2191],[0x2193,0x2193],[0x2212,0x2212],[0x2215,0x2215],[0xFEFF,0xFEFF],[0xFFFD,0xFFFD]];
const inRanges = (cp, R) => R.some(([a, b]) => cp >= a && cp <= b);
const needsExt = (text) => { for (const ch of text) { const cp = ch.codePointAt(0); if (inRanges(cp, EXT) && !inRanges(cp, LATIN)) return true; } return false; };
const decode = (h) => h.replace(/<[^>]*>/g, ' ').replace(/&#x([0-9a-f]+);/gi, (m, x) => String.fromCodePoint(parseInt(x, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d));
const DECK_KEYS = { nhie: ['neverHaveIEver'], mlt: ['mostLikelyTo'], wyr: ['wouldYouRather'], tod: ['truths', 'dares'] };
const deckCache = new Map();
function deckShare(lang, game) {                         // share of a free deck's cards that need latin-ext, or 0
  const key = lang + ' ' + game;
  if (deckCache.has(key)) return deckCache.get(key);
  let share = 0;
  const file = path.join(ROOT, lang, 'cards.js');
  if (/^[a-z]{2}(-[a-z]{2})?$/.test(lang) && DECK_KEYS[game] && fs.existsSync(file)) {
    const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(file, 'utf8'), ctx);
    const bank = Object.values(ctx.window)[0] || {};
    const cards = DECK_KEYS[game].flatMap(k => bank[k] || []).map(c => typeof c === 'string' ? c : Object.values(c).join(' '));
    if (cards.length) share = cards.filter(needsExt).length / cards.length;
  }
  deckCache.set(key, share);
  return share;
}
function firstScreenNeedsExt(s) {
  const h1 = s.match(/<h1[\s>][\s\S]*?<\/h1>/);
  if (h1 && needsExt(decode(h1[0]))) return 'h1';
  const mount = s.match(/<div id="antics-gen"[^>]*>/);
  if (mount) {
    const lang = (mount[0].match(/data-lang="([^"]*)"/) || [])[1], game = (mount[0].match(/data-game="([^"]*)"/) || [])[1];
    const share = lang && game ? deckShare(lang.toLowerCase(), game) : 0;
    if (share >= 0.5) return 'dealt card (' + Math.round(share * 100) + '% of the ' + lang + ' ' + game + ' deck)';
  }
  return '';
}
const kept = [];
const res = apply('head-font', (rel, s) => {
  const hasGoogle = /fonts\.(googleapis|gstatic)\.com/.test(s), hasPreload = s.includes('/fonts/bricolage-800-latin.woff2');
  if (!hasGoogle && !hasPreload) return null;               // never loaded the font: leave alone
  let t = s;
  if (hasGoogle) {
    if (!SHEET.test(t)) return { note: 'UNEXPECTED: Google link not in the standard shape, left alone' };
    t = t.replace(PRE1, '').replace(PRE2, '').replace(SHEET, (m, ind, nl) => ind + PRELOAD + nl);
  }
  const why = firstScreenNeedsExt(t);
  if (why && !t.includes('bricolage-800-latin-ext.woff2')) t = t.replace(PRELOAD, PRELOAD + '\n  ' + PRELOAD_EXT);
  if (!why) t = t.replace(PRELOAD_EXT_LINE, '');
  if (why) kept.push(rel + ': ' + why);
  if (!/name="color-scheme"/.test(t)) {
    if (!VIEWPORT.test(t)) return { note: 'UNEXPECTED: no viewport meta, left alone' };
    t = t.replace(VIEWPORT, (m, ind, nl) => m + ind + SCHEME + nl);
  }
  if (/fonts\.(googleapis|gstatic)\.com/.test(t)) return { note: 'UNEXPECTED: Google font reference remains, left alone' };
  return t;
});
for (const n of res.notes) console.log('  ' + n);
console.log('  latin-ext preload kept on ' + kept.length + ' page(s):');
for (const k of kept) console.log('    ' + k);
