#!/usr/bin/env node
// ---------------------------------------------------------------------------
// EXPORT THE FOUR KINGS for anticsapp.com/four-kings-online/ (10 Oct 2026).
//
// The Four Kings is entirely free in the app (the whole 52-card deck), so the
// browser version deals all of it. Its rules are Guy's own authored canon
// (AGENTS.md: "Keep his authored lines verbatim"), so nothing here is typed
// by hand: every string is read from the app repo with the app's own
// TypeScript loader and written out untouched.
//
//   ranks       src/data/ringOfFire.ts rankRules: rank, title, party, in the
//               app's order. The page builds the 52 cards from these and the
//               suits exactly as the app's buildDeck() does.
//   suits       src/data/ringOfFire.ts suits.
//   kingTitles  src/i18n/strings.en.ts rof.kingTitle(1..4). The one variant
//               the app deals: a K shows "The First King" up to "The Fourth
//               King" for the King it is, in place of its deck title
//               (RingOfFireScreen displayTitle, Guy's ruling of 1 Oct 2026).
//   forfeits    src/data/forfeits.ts minus RETIRED_CARDS.forfeits
//               (src/data/retired.ts), in deck order: exactly the pool the
//               app's drawForfeit() deals the "Forfeit idea" from
//               (src/utils/forfeits.ts liveIndexes). Exported here, not read
//               from /play/cards.js, so a forfeit ruling reaches this page at
//               the next run of this script and never depends on /play's
//               export being fresh.
//
// Nothing else is exported. The output is plain data via JSON.stringify, so
// no card text is ever interpolated into script source.
//
// It REFUSES, writing nothing, if the deck is not 13 ranks and 4 suits, a
// retired forfeit index is out of range, no forfeit is left, a string is
// empty, or any string carries an em or en dash, an angle bracket or a brace.
//
// Usage: node .tools/export-four-kings.mjs [output-path] [--qr]
// Default output: four-kings-online/cards.js beside this folder.
// --qr also writes four-kings-online/qr.png, the closing download box's QR
// (QR_TARGET below), with the app repo's qrcode package, the same settings
// as .tools/gen-es-pt-word-pages.mjs. It never touches cards.js's content.
// Needs the app repo at /Users/guymatthews/Antics (typescript comes from it).
// ---------------------------------------------------------------------------

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { loadTs } from '/Users/guymatthews/Antics/ops/translation-qa-batch.mjs';

const APP = '/Users/guymatthews/Antics';
const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const WANT_QR = args.includes('--qr');
const OUT = args.find((a) => !a.startsWith('--')) || join(SITE, 'four-kings-online', 'cards.js');
const QR_TARGET = 'https://anticsapp.com/get/?c=site-fourkings-qr';

const rof = loadTs(join(APP, 'src', 'data', 'ringOfFire.ts'));
const en = loadTs(join(APP, 'src', 'i18n', 'strings.en.ts'));
const forfeitDeck = loadTs(join(APP, 'src', 'data', 'forfeits.ts')).forfeits;
const retired = loadTs(join(APP, 'src', 'data', 'retired.ts'));

const strings = en.default || en.en || en.strings;
if (!strings || !strings.rof || typeof strings.rof.kingTitle !== 'function') {
  throw new Error('strings.en.ts: rof.kingTitle not found (export shape changed?)');
}

const ranks = rof.rankRules.map((r) => ({ rank: r.rank, title: r.title, party: r.party }));
const suits = rof.suits.slice();
const kingTitles = [1, 2, 3, 4].map((n) => strings.rof.kingTitle(n));
if (!Array.isArray(forfeitDeck)) throw new Error('forfeits.ts: forfeits array not found');
const retiredForfeits = (retired.RETIRED_CARDS && retired.RETIRED_CARDS.forfeits) || null;
if (!Array.isArray(retiredForfeits)) throw new Error('retired.ts: RETIRED_CARDS.forfeits not found');
// The app's own filter (src/data/retired.ts liveIndexes), so the pool is the
// one drawForfeit() deals from, by construction.
const forfeits = retired.liveIndexes(forfeitDeck, retiredForfeits).map((i) => forfeitDeck[i]);

const problems = [];
if (ranks.length !== 13) problems.push(`expected 13 ranks, got ${ranks.length}`);
if (suits.length !== 4) problems.push(`expected 4 suits, got ${suits.length}`);
if (kingTitles.length !== 4) problems.push(`expected 4 king titles, got ${kingTitles.length}`);
if (!ranks.some((r) => r.rank === 'K')) problems.push('no K rank');
const badRetired = retiredForfeits.filter((i) => !Number.isInteger(i) || i < 0 || i >= forfeitDeck.length);
if (badRetired.length) problems.push(`RETIRED_CARDS.forfeits out of range: ${badRetired.join(', ')}`);
if (forfeits.length === 0) problems.push('no live forfeits');
if (forfeits.length !== forfeitDeck.length - new Set(retiredForfeits).size) problems.push('live forfeit count does not match deck minus retired');
const check = (where, s) => {
  if (typeof s !== 'string' || s.trim() === '') problems.push(`${where}: empty or not a string`);
  else if (/[\u2013\u2014<>{}]/.test(s)) problems.push(`${where}: dash, angle bracket or brace in "${s}"`);
};
ranks.forEach((r, i) => {
  check(`ranks[${i}].rank`, r.rank);
  check(`ranks[${i}].title`, r.title);
  check(`ranks[${i}].party`, r.party);
});
suits.forEach((s, i) => check(`suits[${i}]`, s));
kingTitles.forEach((s, i) => check(`kingTitles[${i}]`, s));
forfeits.forEach((s, i) => check(`forfeits[${i}]`, s));
if (problems.length) {
  console.error('export-four-kings: refusing to write:\n  ' + problems.join('\n  '));
  process.exit(1);
}

const data = { ranks, suits, kingTitles, forfeits };
const header =
  '// AUTO-GENERATED by .tools/export-four-kings.mjs from the Antics app repo:\n' +
  '// src/data/ringOfFire.ts (rankRules, suits), src/i18n/strings.en.ts\n' +
  '// (rof.kingTitle) and src/data/forfeits.ts minus RETIRED_CARDS.forfeits.\n' +
  '// Verbatim from the app (the rules are Guy’s own canon). Do not hand-edit;\n' +
  '// regenerate instead.\n' +
  `// Generated ${new Date().toISOString()}.\n`;
writeFileSync(OUT, header + 'window.ANTICS_FOUR_KINGS = ' + JSON.stringify(data, null, 2) + ';\n');
console.log(`export-four-kings: wrote ${OUT} (${ranks.length} ranks x ${suits.length} suits, ${kingTitles.length} king titles, ${forfeits.length} live forfeits of ${forfeitDeck.length})`);

if (WANT_QR) {
  if (!/[?&]c=([a-z0-9-]{1,32})$/.test(QR_TARGET)) throw new Error('bad tag ' + QR_TARGET);
  const QRCode = createRequire(join(APP, 'package.json'))('qrcode');
  const qrOut = join(SITE, 'four-kings-online', 'qr.png');
  await QRCode.toFile(qrOut, QR_TARGET, { width: 600, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0E0A1F', light: '#FFFFFF' } });
  console.log(`export-four-kings: wrote ${qrOut} (${QR_TARGET})`);
}
