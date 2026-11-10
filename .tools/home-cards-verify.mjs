#!/usr/bin/env node
// Read-back proof for every card the home page shows (hero deal and the nine
// game tiles), 7 Nov 2026, design/deal-home.
//
// The card law (BUILD-BRIEF.md, house rules): card text is copied VERBATIM, BY
// INDEX, from free cards that are already published on the site. Never a
// retired, seasonal, Spicy or {player} card. Never written or edited.
//
// This script re-parses the app's deck sources in ~/Antics/src (TypeScript,
// transpiled in memory with the app's own typescript package), FREE_CARDS,
// RETIRED_CARDS and SEASONAL_CARDS, then the BUILT index.html, and proves:
//   1. every card in index.html (the JSON deal list, the first hero card in
//      the HTML, every tile face) names a deck and an index;
//   2. that index is free (FREE_CARDS, or a free Imposter deck, or The Four
//      Kings, which is free in the app), not retired, not seasonal, has no
//      {player}, and is not from the Spicy pack;
//   3. the text in index.html equals the deck source exactly, character for
//      character (only HTML entities are decoded);
//   4. the same text is already published on another page of the site, or
//      in the free round's deck at /play/ (play/cards.js);
//   5. the hero deals 8 to 12 cards, its first card is the card in the HTML,
//      and that first card is not a forfeit card.
// Exit code 1 on any failure. Run: node .tools/home-cards-verify.mjs
// (from the site worktree; APP_SRC overrides the app source folder).

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = process.env.APP_SRC || '/Users/guymatthews/Antics/src';
const require = createRequire(import.meta.url);
const ts = require(path.join(APP, '..', 'node_modules', 'typescript'));

function load(rel) {
  const code = fs.readFileSync(path.join(APP, rel), 'utf8');
  const out = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  // Deck files import nothing at runtime except types; seasonal.ts and the
  // category registry are not loaded, so a stub require is enough.
  vm.runInNewContext(out, { module: mod, exports: mod.exports, require: () => ({}) });
  return mod.exports;
}

const { FREE_CARDS } = load('monetization/freeTier.ts');
const { RETIRED_CARDS } = load('data/retired.ts');
const { SEASONAL_CARDS } = load('data/seasonal.ts');
const tod = load('data/truthOrDare.ts');
const imp = load('data/imposterDecks.ts');
const DECKS = {
  antics: load('data/antics.ts').anticsCards.map((c) => ({ t: c.party, type: c.type })),
  neverHaveIEver: load('data/neverHaveIEver.ts').neverHaveIEverPrompts.map((t) => ({ t })),
  mostLikelyTo: load('data/mostLikelyTo.ts').mostLikelyToPrompts.map((t) => ({ t })),
  wouldYouRather: load('data/wouldYouRather.ts').wouldYouRatherPrompts.map((p) => ({ a: p.a, b: p.b })),
  truths: tod.truths.map((t) => ({ t })),
  dares: tod.dares.map((t) => ({ t })),
  odds: load('data/whatAreTheOdds.ts').whatAreTheOddsPrompts.map((t) => ({ t })),
  // Imposter: a word and its EASY hint share an index.
  imposterEverydayObjects: imp.everydayObjectsWords.map((w, i) => ({ w, h: imp.everydayObjectsHints[i] })),
  // The Four Kings: Guy's own canon, keyed by rank; the index is the array position.
  ringOfFire: load('data/ringOfFire.ts').rankRules.map((r) => ({ r: r.rank, title: r.title, t: r.party })),
  // Name 3 (1.1.6, takes What Are The Odds' tile): the category is the card.
  nameThree: load('data/nameThree.ts').nameThreePrompts.map((t) => ({ t })),
};

// Imposter decks whose registry entry says access: 'free' (read from the source
// text, since the registry imports runtime helpers). The Four Kings is free in
// the app as a whole (freeTier.ts header).
const catSrc = fs.readFileSync(path.join(APP, 'data/imposterCategories.ts'), 'utf8');
function imposterDeckFree(id) {
  const m = catSrc.match(new RegExp(`id: '${id}',[\\s\\S]*?access: '(\\w+)'([\\s\\S]*?)\\n  \\}`));
  return !!m && m[1] === 'free' && !/season:/.test(m[2]);
}
const FREE_BY_DECK = {
  ...FREE_CARDS,
  imposterEverydayObjects: imposterDeckFree('everydayObjects') ? DECKS.imposterEverydayObjects.map((_, i) => i) : [],
  ringOfFire: DECKS.ringOfFire.map((_, i) => i),
};
const SPICY_SRC = fs.readFileSync(path.join(APP, 'data/packs/spicy.ts'), 'utf8');

// ---------------------------------------------------------------- HTML text
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', nbsp: ' ', middot: '·', hellip: '…' };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => (n in ENT ? ENT[n] : m));
const strip = (s) => decode(s.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
// For the "already published" check only: the site's pages may typeset
// quotes differently from the deck source.
const loose = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/ /g, ' ').replace(/\s+/g, ' ');
const lcfirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const indexHtml = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');

// Every other page of the site, as loose visible text, for the published check.
let corpus = '';
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html') && p !== path.join(SITE, 'index.html')) corpus += loose(strip(fs.readFileSync(p, 'utf8'))) + '\n';
  }
})(SITE);
// The free round at /play/ deals the free decks from play/cards.js (exported
// from the app by ops/export-free-cards.mjs), so a card dealt there is
// published on the site too.
for (const m of fs.readFileSync(path.join(SITE, 'play', 'cards.js'), 'utf8').matchAll(/"((?:[^"\\]|\\.)*)"/g)) corpus += loose(JSON.parse(`"${m[1]}"`)) + '\n';

// ---------------------------------------------------------------- checks
const fails = [];
const rows = [];
function check(where, d, i, fields) {
  const tag = `${where}: ${d}[${i}]`;
  const deck = DECKS[d];
  if (!deck) return fails.push(`${tag}: unknown deck`);
  const card = deck[i];
  if (!card) return fails.push(`${tag}: no such index`);
  if (!(FREE_BY_DECK[d] || []).includes(i)) fails.push(`${tag}: not a free card`);
  if ((RETIRED_CARDS[d] || []).includes(i)) fails.push(`${tag}: RETIRED`);
  for (const [season, idx] of Object.entries(SEASONAL_CARDS[d] || {})) if (idx.includes(i)) fails.push(`${tag}: seasonal (${season})`);
  const keys = Object.keys(fields);
  if (!keys.length) fails.push(`${tag}: no text fields found`);
  for (const k of keys) {
    if (!(k in card)) { fails.push(`${tag}: field ${k} not in deck card`); continue; }
    if (fields[k] !== card[k]) fails.push(`${tag}: field ${k} differs\n    html: ${JSON.stringify(fields[k])}\n    deck: ${JSON.stringify(card[k])}`);
    if (/\{player\}/.test(card[k])) fails.push(`${tag}: has {player}`);
    if (card[k].length >= 12 && SPICY_SRC.includes(card[k].slice(0, 40))) fails.push(`${tag}: text also in the Spicy pack`);
  }
  // Published elsewhere on the site.
  let pub;
  if (d === 'wouldYouRather') pub = `${card.a}, or ${lcfirst(card.b)}?`;
  else if (d === 'imposterEverydayObjects') pub = `${card.w} ${card.h}`;
  else if (d === 'ringOfFire') pub = `${card.r} ${card.title} ${card.t}`;
  else pub = card.t;
  if (!corpus.includes(loose(pub))) fails.push(`${tag}: not found on any other page of the site: ${JSON.stringify(pub)}`);
  rows.push(`${where.padEnd(10)} ${d}[${i}]  ${keys.map((k) => fields[k]).join(' | ')}`);
}

// 1. The hero deal list (JSON).
const jm = indexHtml.match(/<script type="application\/json" id="deal-cards">([\s\S]*?)<\/script>/);
let deal = [];
if (!jm) fails.push('hero: no <script type="application/json" id="deal-cards">');
else {
  try { deal = JSON.parse(jm[1]); } catch (e) { fails.push('hero: JSON does not parse: ' + e.message); }
}
if (deal.length < 8 || deal.length > 12) fails.push(`hero: ${deal.length} cards, want 8 to 12`);
deal.forEach((c, n) => {
  const { g, d, i, ...fields } = c;
  if (!g) fails.push(`hero #${n + 1}: no game key`);
  check(`hero #${n + 1}`, d, i, fields);
});
const games = new Set(deal.map((c) => c.d === 'truths' || c.d === 'dares' ? 'tod' : c.d));
for (const need of ['antics', 'neverHaveIEver', 'mostLikelyTo', 'wouldYouRather', 'tod'])
  if (!games.has(need)) fails.push(`hero: no card from ${need}`);

// 2. Cards in the HTML itself: elements carrying data-d and data-i, with
// their text in data-f fields up to the next card.
const parts = indexHtml.split(/(?=<[^>]*\bdata-d=")/).slice(1);
const htmlCards = parts.map((chunk) => {
  const d = chunk.match(/\bdata-d="([^"]+)"/)[1];
  const i = +chunk.match(/\bdata-i="(\d+)"/)[1];
  const where = (chunk.match(/\bdata-where="([^"]+)"/) || [])[1] || 'html';
  const fields = {};
  for (const m of chunk.matchAll(/\bdata-f="(\w+)"[^>]*>([^<]*)</g)) fields[m[1]] = decode(m[2]);
  return { d, i, where, fields };
});
for (const c of htmlCards) check(c.where, c.d, c.i, c.fields);

// 3. The first hero card in the HTML is deal[0], and is not a forfeit card.
const heroHtml = htmlCards.filter((c) => c.where === 'hero');
if (heroHtml.length !== 1) fails.push(`hero: ${heroHtml.length} cards in the HTML, want exactly 1 (the first)`);
else if (deal[0]) {
  const h = heroHtml[0];
  const { g, d, i, ...f0 } = deal[0];
  if (h.d !== d || h.i !== i || JSON.stringify(h.fields) !== JSON.stringify(f0)) fails.push('hero: the card in the HTML is not deal[0]');
}
if (deal[0] && /forfeit/i.test(Object.values(deal[0]).join(' '))) fails.push('hero: the first card is a forfeit card');

// 4. Tiles: nine games, Spicy carries no card. From 1.1.6 (feat/116-new-games)
// Blag carries none either: its face is the app's own About us rule line
// (t.blag.ruleAboutUs), not a card, because no Blag prompt is published.
const tiles = htmlCards.filter((c) => c.where === 'tile');
if (tiles.length !== 7) fails.push(`tiles: ${tiles.length} tile cards, want 7 (nine games, Spicy and Blag show none)`);

console.log(rows.join('\n'));
console.log(`\n${deal.length} hero cards, ${tiles.length} tile cards, ${htmlCards.length} cards in the HTML.`);
if (fails.length) { console.log('\nFAIL:\n- ' + fails.join('\n- ')); process.exit(1); }
console.log('PASS: every card is verbatim, by index, free, live and published on the site.');
