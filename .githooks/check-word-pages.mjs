#!/usr/bin/env node
// ---------------------------------------------------------------------------
// CHECK WORD PAGES (7 Oct 2026). Run by pre-commit with --staged. The
// printable Imposter word lists in Spanish and Portuguese say every word on
// them is in the app, and they are built from the same arrays as the web
// dealer's words.json. So each category table on those pages must equal the
// deck of the same name in its dealer's words.json, word for word and hint
// for hint, in order. When an Imposter word is retired or a mirror word
// repaired, the app repo's ops/export-imposter-web-words.mjs rewrites
// words.json; this check then refuses the commit until the pages are
// regenerated with
//   node --no-warnings .tools/gen-es-pt-word-pages.mjs
// --staged reads the copies about to be committed (the index); without it,
// the files on disk. A page that does not exist yet is skipped. No
// dependencies, no network.
// ---------------------------------------------------------------------------
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STAGED = process.argv.includes('--staged');
const PAIRS = [
  ['es/palabras-juego-del-impostor/index.html', 'es/juego-del-impostor/words.json'],
  ['pt/palavras-jogo-do-impostor/index.html', 'pt/jogo-do-impostor/words.json'],
];
// Returns the file's text, or null when it does not exist (on disk or in the index).
function read(rel) {
  if (!STAGED) return existsSync(join(ROOT, rel)) ? readFileSync(join(ROOT, rel), 'utf8') : null;
  try { return execFileSync('git', ['-C', ROOT, 'show', `:${rel}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return null; }
}
const decode = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&amp;/g, '&');

const problems = [];
for (const [pagePath, dealerPath] of PAIRS) {
  const html = read(pagePath);
  if (html === null) continue;
  let dealer;
  try { dealer = JSON.parse(read(dealerPath)); }
  catch (e) { problems.push(`${dealerPath}: cannot read (${e.message})`); continue; }
  const sections = [...html.matchAll(/<section class="[^"]*\bwl-cat\b[^"]*"[^>]*>\s*<h2>([^<]*)<\/h2>([\s\S]*?)<\/section>/g)];
  if (sections.length === 0) { problems.push(`${pagePath}: no category tables found`); continue; }
  for (const [, rawName, body] of sections) {
    const name = decode(rawName);
    const rows = [...body.matchAll(/<tr><td>([^<]*)<\/td><td>([^<]*)<\/td><\/tr>/g)].map((m) => [decode(m[1]), decode(m[2])]);
    const deck = ((dealer && dealer.decks) || []).find((d) => d.name === name);
    if (!deck) { problems.push(`${pagePath}: "${name}" is not a deck in ${dealerPath}`); continue; }
    if (JSON.stringify(rows) !== JSON.stringify(deck.words)) problems.push(`${pagePath}: "${name}" differs from ${dealerPath} (${rows.length} rows on the page, ${deck.words.length} in the dealer)`);
  }
}
if (problems.length) {
  console.error('check-word-pages:\n  ' + problems.join('\n  '));
  console.error('Regenerate: source ~/.nvm/nvm.sh && node --no-warnings .tools/gen-es-pt-word-pages.mjs');
  process.exit(1);
}
