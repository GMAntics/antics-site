#!/usr/bin/env node
// ---------------------------------------------------------------------------
// WHICH PARTY GAME (9 Oct 2026). The picker on /which-party-game/ is one pure
// function, recommend(size, mood, time), in the page's own inline script
// (<script id="picker-js">). This tool treats that script as the single
// source of truth:
//   node .tools/which-party-game.mjs          rewrites the generated blocks
//       <!-- answers:start --> ... <!-- answers:end -->   (the answer tables)
//       <!-- faq-ld:start -->  ... <!-- faq-ld:end -->    (FAQPage JSON-LD,
//                                                  built from the visible FAQ)
//   node .tools/which-party-game.mjs --check  writes nothing; fails if either
//       block is stale, then runs the tests below.
// Tests: node --check on the inline script; all 4 x 4 x 3 answer
// combinations return one or two games that exist, with a reason, inside the
// game's player range; house rules for the picks (10 minutes is one game and
// never The Four Kings; Spicy only all night and never first; Most Likely To
// never for strangers; Imposter never for two); "The short answer" matches the
// ten minute picks; no Four Kings line ends it at the end of the deck, and no
// count of the in-browser games; every link resolves to a file
// in this repo; every JSON-LD block parses; no em or en dash anywhere; the
// title is at most 60 characters. No dependencies, no network.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = join(ROOT, 'which-party-game/index.html');
const CHECK = process.argv.includes('--check');

let html = readFileSync(PAGE, 'utf8');

// --- the inline script ------------------------------------------------------
const m = /<script id="picker-js">([\s\S]*?)<\/script>/.exec(html);
if (!m) throw new Error('no <script id="picker-js"> on the page');
const SRC = m[1];
const ctx = vm.createContext({});
vm.runInContext(SRC, ctx);
const P = ctx.AnticsPicker;
if (!P || typeof P.recommend !== 'function') throw new Error('script did not expose AnticsPicker.recommend');

// --- generated block 1: the answer tables -----------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const SECTIONS = {
  '2':   { id: 'two',           tone: 'lime',   h2: 'If there are two of you',          caption: 'Two players: what to play',     why: 'Why these games for two' },
  '3-4': { id: 'three-to-four', tone: 'orange', h2: 'If there are three or four of you', caption: 'Three or four players: what to play', why: 'Why these games for three or four' },
  '5-8': { id: 'five-to-eight', tone: 'cyan',   h2: 'If there are five to eight of you', caption: 'Five to eight players: what to play', why: 'Why these games for five to eight' },
  '9+':  { id: 'nine-or-more',  tone: 'purple', h2: 'If there are nine or more of you', caption: 'Nine or more players: what to play', why: 'Why these games for nine or more' },
};
const cell = (r) => r.games.map((g) => g.name).join(', then ');

function answersBlock() {
  const out = [];
  out.push('      <p>Here is the whole picker written out. Find your group size, then your mood down the left and the time you have along the top. Games are listed in the order to play them. On a phone, swipe a table sideways to see all night.</p>');
  for (const size of P.SIZES) {
    const s = SECTIONS[size.id];
    out.push('', `      <section class="section tone-${s.tone}" id="${s.id}">`);
    out.push(`        <h2>${esc(s.h2)}</h2>`);
    out.push('        <div class="table-wrap">', '          <table class="picks">', `            <caption>${esc(s.caption)}</caption>`);
    out.push('            <thead>', '              <tr><th scope="col">You want</th>' + P.TIMES.map((t) => `<th scope="col">${esc(t.label)}</th>`).join('') + '</tr>', '            </thead>', '            <tbody>');
    for (const mood of P.MOODS) {
      const cells = P.TIMES.map((t) => `<td>${esc(cell(P.recommend(size.id, mood.id, t.id)))}</td>`).join('');
      out.push(`              <tr><th scope="row">${esc(mood.label)}</th>${cells}</tr>`);
    }
    out.push('            </tbody>', '          </table>', '        </div>');
    // the reasons: every game this size can be dealt, in the GAMES order
    const used = new Set();
    for (const mood of P.MOODS) for (const t of P.TIMES) for (const g of P.recommend(size.id, mood.id, t.id).games) used.add(g.id);
    out.push(`        <h3>${esc(s.why)}</h3>`, '        <ul>');
    for (const id of Object.keys(P.GAMES)) {
      if (!used.has(id)) continue;
      const g = P.GAMES[id];
      out.push(`          <li><strong><a href="${g.href}">${esc(g.name)}</a></strong>: ${esc(P.REASONS[size.id][id])} ${esc(g.access)}.</li>`);
    }
    out.push('        </ul>');
    for (const mood of P.MOODS) {
      const note = P.PICKS[size.id][mood.id].note || {};
      if (note.all) out.push(`        <p><strong>${esc(mood.label)}:</strong> ${esc(note.all)}</p>`);
      // one line per distinct note, naming every time it applies to
      const byText = new Map();
      for (const t of P.TIMES) if (note[t.id]) byText.set(note[t.id], [...(byText.get(note[t.id]) || []), t.label.toLowerCase()]);
      for (const [text, when] of byText) out.push(`        <p><strong>${esc(mood.label)}, ${esc(when.join(' or '))}:</strong> ${esc(text)}</p>`);
    }
    if (P.SIZE_NOTES[size.id]) out.push(`        <p>${esc(P.SIZE_NOTES[size.id])}</p>`);
    out.push('      </section>');
  }
  return out.join('\n');
}

// --- generated block 2: FAQPage JSON-LD from the visible FAQ -----------------
const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();
function visibleFaq(h) {
  const sec = /<section class="section faq[^"]*" id="faq">([\s\S]*?)<\/section>/.exec(h);
  if (!sec) throw new Error('no visible FAQ section');
  const pairs = [];
  const re = /<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g;
  let x;
  while ((x = re.exec(sec[1]))) pairs.push({ q: decode(x[1]), a: decode(x[2]) });
  if (!pairs.length) throw new Error('visible FAQ has no questions');
  return pairs;
}
function faqBlock(h) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visibleFaq(h).map((p) => ({ '@type': 'Question', name: p.q, acceptedAnswer: { '@type': 'Answer', text: p.a } })),
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(ld, null, 2) + '\n</script>';
}

function between(h, name, body) {
  const re = new RegExp(`(<!-- ${name}:start -->\\n)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(h)) throw new Error(`markers ${name}:start/end not found`);
  return h.replace(re, (_, a, b) => a + body + '\n' + b);
}
const next = between(between(html, 'answers', answersBlock()), 'faq-ld', faqBlock(html));

if (!CHECK) {
  if (next !== html) { writeFileSync(PAGE, next); console.log('which-party-game: generated blocks rewritten'); }
  else console.log('which-party-game: generated blocks already current');
  process.exit(0);
}

// --- tests (--check) -----------------------------------------------------------
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
ok(next === html, 'generated blocks are stale: run node .tools/which-party-game.mjs');

// 1. node --check on the extracted inline script
try { execFileSync(process.execPath, ['--check', '-'], { input: SRC, stdio: ['pipe', 'ignore', 'pipe'] }); }
catch (e) { fails.push('node --check failed on the inline script: ' + String(e.stderr || e.message)); }

// 2. every combination of answers
let combos = 0;
for (const size of P.SIZES) for (const mood of P.MOODS) for (const t of P.TIMES) {
  combos++;
  const tag = `${size.id}/${mood.id}/${t.id}`;
  const r = P.recommend(size.id, mood.id, t.id);
  ok(r && Array.isArray(r.games), `${tag}: no result`);
  if (!r) continue;
  ok(r.games.length >= 1 && r.games.length <= 2, `${tag}: ${r.games.length} games (want 1 or 2)`);
  ok(new Set(r.games.map((g) => g.id)).size === r.games.length, `${tag}: a game twice`);
  ok(typeof r.time === 'string' && r.time.length > 0, `${tag}: no time note`);
  r.games.forEach((g, i) => {
    const def = P.GAMES[g.id];
    ok(!!def, `${tag}: unknown game ${g.id}`);
    if (!def) return;
    ok(typeof g.reason === 'string' && g.reason.length > 20, `${tag}: ${g.id} has no reason`);
    ok(def.min <= size.min, `${tag}: ${g.id} needs ${def.min}+ but the group can be ${size.min}`);
    ok(def.max === 0 || def.max >= size.min, `${tag}: ${g.id} deals for at most ${def.max}`);
    if (g.id === 'kings') ok(t.id !== 'quick', `${tag}: The Four Kings in ten minutes`);
    if (g.id === 'spicy') { ok(t.id === 'night', `${tag}: Spicy before all night`); ok(i > 0, `${tag}: Spicy as the opener`); ok(mood.id !== 'know', `${tag}: Spicy for strangers`); }
    if (g.id === 'mlt') ok(mood.id !== 'know', `${tag}: Most Likely To for strangers`);
    if (g.id === 'imposter') ok(size.id !== '2', `${tag}: Imposter for two`);
  });
  if (t.id === 'quick') ok(r.games.length === 1, `${tag}: ten minutes should be one game`);
  else ok(r.games.length === 2, `${tag}: an hour or a night should be two games back to back`);
  if (mood.id === 'deduction' && size.id !== '2') ok(r.games[0].id === 'imposter', `${tag}: deduction should lead with Imposter`);
}
ok(combos === 48, `ran ${combos} combinations, expected 48`);
// "The short answer" paragraph states the ten minute column by mood; it is
// hand-written prose, so pin it to the logic here (change both together)
const SHORT_ANSWER = {
  know:        { '2': 'nhie', '3-4': 'nhie',     '5-8': 'wyr',      '9+': 'wyr' },
  chaos:       { '2': 'odds', '3-4': 'odds',     '5-8': 'odds',     '9+': 'mlt' },
  deduction:   { '2': 'odds', '3-4': 'imposter', '5-8': 'imposter', '9+': 'imposter' },
  confessions: { '2': 'nhie', '3-4': 'nhie',     '5-8': 'nhie',     '9+': 'nhie' },
};
for (const [mood, bySize] of Object.entries(SHORT_ANSWER)) for (const [size, id] of Object.entries(bySize)) {
  const r = P.recommend(size, mood, 'quick');
  ok(r && r.games[0].id === id, `${size}/${mood}/quick is ${r ? r.games[0].id : 'null'}, but "The short answer" says ${id}: update the paragraph and SHORT_ANSWER together`);
}
// The Four Kings ends when the fourth King comes out, not at the end of the deck
ok(!/last card ends|full deck (to its finale|in a ring)/.test(next), 'a Four Kings line says the game ends with the deck; it ends at the fourth King');
// no count of browser games: /play/ adds Antics mode to the six /party-games/ counts
ok(!/\b(six|seven) of them (play|free)/i.test(next), 'the page counts the in-browser games; say "most of them"');
// reasons: none missing, none unused
for (const size of P.SIZES) {
  const used = new Set();
  for (const mood of P.MOODS) for (const t of P.TIMES) for (const g of P.recommend(size.id, mood.id, t.id).games) used.add(g.id);
  for (const id of Object.keys(P.REASONS[size.id])) ok(used.has(id), `${size.id}: reason for ${id} is never shown`);
}
// bad input is a null, not a throw
for (const args of [['1', 'know', 'quick'], ['2', 'party', 'quick'], ['2', 'know', 'note'], ['constructor', 'know', 'quick'], [undefined, undefined, undefined]])
  ok(P.recommend(...args) === null, `recommend(${args.join(', ')}) should be null`);

// 3. every internal link on the page and in the data resolves to a file here
const paths = new Set();
for (const g of Object.values(P.GAMES)) { paths.add(g.href); if (g.play) paths.add(g.play); }
for (const x of html.matchAll(/href="(\/[^"#?]*)/g)) paths.add(x[1]);
for (const x of SRC.matchAll(/'(\/[a-z0-9/-]+\/)'/g)) paths.add(x[1]);
for (const p of paths) {
  const rel = p.replace(/^\//, '');
  const file = p.endsWith('/') ? join(ROOT, rel, 'index.html') : join(ROOT, rel);
  ok(existsSync(file), `link ${p} has no file in this repo`);
}

// 4. JSON-LD parses; the FAQ JSON-LD equals the visible FAQ
const blocks = [...next.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((x) => x[1]);
ok(blocks.length >= 2, `found ${blocks.length} JSON-LD blocks, want BreadcrumbList and FAQPage`);
let faqLd = null;
for (const b of blocks) {
  try { const j = JSON.parse(b); if (j['@type'] === 'FAQPage') faqLd = j; }
  catch (e) { fails.push('JSON-LD does not parse: ' + e.message); }
}
ok(!!faqLd, 'no FAQPage JSON-LD');
if (faqLd) {
  const vis = visibleFaq(next);
  ok(faqLd.mainEntity.length === vis.length, 'FAQ JSON-LD and visible FAQ differ in length');
  vis.forEach((p, i) => {
    const q = faqLd.mainEntity[i];
    ok(q && q.name === p.q && q.acceptedAnswer.text === p.a, `FAQ ${i + 1} differs between JSON-LD and the page`);
  });
}

// 5. house rules on the text
ok(!/[\u2013\u2014]|&mdash;|&ndash;|&#821[12];/.test(next), 'an em or en dash is on the page');
const title = /<title>([^<]*)<\/title>/.exec(next);
ok(title && title[1].length <= 60, `title is ${title ? title[1].length : 0} characters (max 60)`);

if (fails.length) { console.error('which-party-game: FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log(`which-party-game: PASS (${combos} combinations, ${paths.size} links, ${blocks.length} JSON-LD blocks, node --check ok)`);
