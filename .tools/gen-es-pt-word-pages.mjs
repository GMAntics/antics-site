#!/usr/bin/env node
// ---------------------------------------------------------------------------
// GEN WORD PAGES (7 Oct 2026, lever 7 of the app repo's
// ops/research/organic-visibility-2026-10-05.md; made data-driven per
// language 10 Oct 2026, file name kept so every page's own comment and the
// pre-commit message stay true). Builds the printable Imposter word list
// page of every language that has a config in .tools/word-pages/:
//   /es/palabras-juego-del-impostor/index.html  (es-419, word-pages/es.mjs)
//   /pt/palavras-jogo-do-impostor/index.html    (pt-BR,  word-pages/pt.mjs)
//   ...and any other language added the way described below.
//
// HOW TO ADD A LANGUAGE (de, fr, it, nl, pl, cs; any code with an app mirror
// in src/data/<lang>/ and a dictionary src/i18n/strings.<lang>.ts):
//   1. Export the dealer's words first (app repo):
//        node --no-warnings ops/export-imposter-web-words.mjs <site> --lang de --out <site>/de/<dealer-slug>/words.json
//   2. Copy .tools/word-pages/es.mjs to .tools/word-pages/de.mjs and rewrite
//      every value for the new language: lang, order (the next free number:
//      it fixes where the language sits in every page's hreflang list and
//      switcher), hreflang, dealerWords (the words.json from step 1, relative
//      to the site root), wordsId, htmlLang, path and dir (path is '/' + dir +
//      '/', dir starts with '<lang>/'), ogLocale, langName (the language's own
//      name, as the switcher shows it), langHome, gamePath and every sentence.
//      The word tables are never written there: they come from the mirror.
//   3. node --no-warnings .tools/gen-es-pt-word-pages.mjs --lang de --app <app>
//      writes de's page and QR only. Then --check --lang de must pass.
//   Adding a language also adds it to the hreflang lines, og:locale
//   alternates and switcher of EVERY other word page, so once all new configs
//   are in, the publishing session runs the generator once with no --lang to
//   bring every page up to date (and --check with no --lang to prove it).
//   With only es.mjs and pt.mjs present, both pages are byte for byte what
//   this generator wrote before the change (proved 10 Oct 2026).
//
// Every page is built from the SAME arrays the app deals from, with the SAME
// filters as the app repo's ops/export-imposter-web-words.mjs (copied, not
// imported):
//   1. RETIRED_CARDS from src/data/retired.ts (a retired index reaches nobody)
//   2. ACCESS: only decks registered 'free' and not seasonal (no Brands,
//      Sports, Halloween; ALLOW_FOLLOW stays empty)
//   3. English pass: every English word and easy hint must already be on the
//      published English category page, and the page must carry no retired
//      or unknown word
//   3b. Mirrors at exactly the indexes the English pass emits, 1:1 lengths,
//      no empty word, no missing hint where English has one, no angle
//      bracket, no em or en dash
// Extra checks for these pages:
//   4. the lists must equal the web dealer's own words.json in this checkout
//      (the config's dealerWords: es/juego-del-impostor/words.json,
//      pt/jogo-do-impostor/words.json, ...)
//   5. OPTIONAL, with --live <commit>: the lists must also equal what the app
//      at that commit deals (the live binary's release commit); its mirror
//      words, easy hints, access and retired indexes are read with git show
//   6. each config is checked before anything is written: required fields,
//      path and dir agree, no em or en dash, no "17+", no Spicy mention.
// Only the EASY hint is shown. The app also deals a hard tier in every
// language since 8 Oct 2026 (HARD_TIER_LANGS in src/data/localizedDecks.ts);
// that stays an app feature and never reaches these pages.
//
// WHY IT LIVES HERE: these pages say every word on them is in the app,
// so they must be regenerated after ANY Imposter retire or mirror repair, in
// the same sitting as ops/export-imposter-web-words.mjs. The site repo's
// pre-commit hook (.githooks/check-word-pages.mjs) refuses a commit when a
// page no longer equals its dealer's words.json, which is exactly the state a
// fresh export leaves behind. The dot folder keeps this file off the
// published site (GitHub Pages skips dot folders).
//
// Reads the app repo read-only. Writes only into the site checkout.
// Usage (from a site checkout or worktree):
//   source ~/.nvm/nvm.sh
//   node --no-warnings .tools/gen-es-pt-word-pages.mjs            # regenerate every language
//   node --no-warnings .tools/gen-es-pt-word-pages.mjs --check    # compare only
//   options: --lang <code>[,<code>] (only these pages; repeatable; default all)
//            --site <dir> (default: the checkout holding this file)
//            --app <dir>  (default: /Users/guymatthews/Antics)
//            --live <commit> (rule 5)
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';

const argv = process.argv.slice(2);
const opt = (name) => { const i = argv.indexOf(name); return i === -1 ? undefined : argv[i + 1]; };
const CHECK = argv.includes('--check');
const APP = opt('--app') || '/Users/guymatthews/Antics';
const SITE = opt('--site') || join(dirname(fileURLToPath(import.meta.url)), '..');
const LIVE_COMMIT = opt('--live');
if (!existsSync(join(SITE, 'sitemap.xml'))) { console.error(`not a site checkout: ${SITE}`); process.exit(1); }
if (!existsSync(join(APP, 'src/data/imposterDecks.ts'))) { console.error(`not the app repo: ${APP}`); process.exit(1); }
if (LIVE_COMMIT !== undefined && !/^[0-9a-f]{7,40}$/.test(LIVE_COMMIT)) { console.error('--live takes a commit hash'); process.exit(1); }

// --- page configs (.tools/word-pages/<lang>.mjs), rule 6 ------------------
const CONFIG_DIR = join(SITE, '.tools', 'word-pages');
const LANG_ARGS = argv.flatMap((a, i) => (argv[i - 1] === '--lang' ? a.split(',') : [])).map((l) => l.trim()).filter(Boolean);
const REQUIRED = ['lang', 'order', 'hreflang', 'dealerWords', 'wordsId', 'htmlLang', 'path', 'dir', 'ogLocale', 'title', 'desc', 'ogTitle',
  'crumbLabel', 'langHome', 'langName', 'crumbGame', 'gamePath', 'crumbHere', 'ldGame', 'ldHere', 'h1', 'standfirst', 'note', 'ilangLabel',
  'tocLabel', 'tocAfter', 'wordsH2', 'wordsP', 'printTip', 'thWord', 'thHint', 'paperId', 'paperH2', 'paperP', 'paperSteps', 'paperAfter',
  'threeId', 'threeH2', 'threeP', 'threeSteps', 'cta', 'guides', 'footer', 'installbar', 'qr'];
function configProblems(file, C) {
  const out = [];
  const lang = file.replace(/\.mjs$/, '');
  if (!C || typeof C !== 'object') return [`${file}: no default export`];
  for (const k of REQUIRED) if (C[k] === undefined || C[k] === '') out.push(`${file}: missing ${k}`);
  if (C.lang !== lang) out.push(`${file}: lang '${C.lang}' does not match the file name`);
  if (!Number.isInteger(C.order)) out.push(`${file}: order must be a whole number`);
  if (typeof C.dir === 'string' && !C.dir.startsWith(`${lang}/`)) out.push(`${file}: dir must start with '${lang}/'`);
  if (C.path !== `/${C.dir}/`) out.push(`${file}: path must be '/' + dir + '/'`);
  if (typeof C.dealerWords === 'string' && !existsSync(join(SITE, C.dealerWords))) out.push(`${file}: dealerWords ${C.dealerWords} does not exist (export the words first)`);
  if (typeof C.qr === 'string' && !/^https:\/\/anticsapp\.com\/get\/\?c=[a-z0-9-]{1,32}$/.test(C.qr)) out.push(`${file}: qr must be https://anticsapp.com/get/?c=<tag>`);
  const text = JSON.stringify(C);
  if (/[\u2013\u2014]/.test(text)) out.push(`${file}: em or en dash`);
  if (/17\+/.test(text)) out.push(`${file}: "17+" (the rating is 18+)`);
  if (/spicy/i.test(text)) out.push(`${file}: mentions Spicy`);
  return out;
}
const CONFIGS = {};
const configErrors = {};
for (const file of readdirSync(CONFIG_DIR).filter((f) => /^[a-z]{2}(-[a-z]{2,4})?\.mjs$/i.test(f)).sort()) {
  const lang = file.replace(/\.mjs$/, '');
  try {
    const C = (await import(pathToFileURL(join(CONFIG_DIR, file)).href)).default;
    const bad = configProblems(file, C);
    if (bad.length) configErrors[lang] = bad; else CONFIGS[lang] = C;
  } catch (e) { configErrors[lang] = [`${file}: cannot load (${e.message})`]; }
}
for (const l of LANG_ARGS) if (!CONFIGS[l] && !configErrors[l]) { console.error(`--lang ${l}: no config at .tools/word-pages/${l}.mjs`); process.exit(1); }
const byOrder = (a, b) => (CONFIGS[a]?.order ?? 999) - (CONFIGS[b]?.order ?? 999) || a.localeCompare(b);
const LANGS = (LANG_ARGS.length ? [...new Set(LANG_ARGS)] : Object.keys({ ...CONFIGS, ...configErrors })).sort(byOrder);
// A broken config of a language being built stops the run. A broken config of
// ANOTHER language (a parallel builder mid-edit) only leaves that language out
// of this run's hreflang lines and switcher, with a warning; the final run
// with no --lang then requires every config to be sound.
const selectedErrors = LANGS.flatMap((l) => configErrors[l] || []);
if (selectedErrors.length) { console.error('Refusing to write, bad config:\n  ' + selectedErrors.join('\n  ')); process.exit(1); }
for (const [l, errs] of Object.entries(configErrors)) if (!LANGS.includes(l)) console.warn(`warning: ${l} left out of the alternates this run (${errs[0]})`);
const ALTS = Object.values(CONFIGS).sort((a, b) => a.order - b.order || a.lang.localeCompare(b.lang));
const orders = ALTS.map((c) => c.order);
if (new Set(orders).size !== orders.length) { console.error(`two configs share an order number (${orders.join(', ')})`); process.exit(1); }

const imp = (rel) => import(pathToFileURL(join(APP, rel)).href);
const decks = await imp('src/data/imposterDecks.ts');
const locations = await imp('src/data/imposter.ts');
const { RETIRED_CARDS } = await imp('src/data/retired.ts');
const MIRROR = {};
for (const lang of LANGS) {
  if (!existsSync(join(APP, `src/data/${lang}/imposterDecks.ts`))) { console.error(`no app mirror src/data/${lang}/ in ${APP}`); process.exit(1); }
  MIRROR[lang] = { decks: await imp(`src/data/${lang}/imposterDecks.ts`), locations: await imp(`src/data/${lang}/imposter.ts`), strings: `src/i18n/strings.${lang}.ts` };
}
const EN_MODULES = { decks, locations };

// Rule 5: the release commit's copies, written to a temporary folder and
// imported (git show is a read-only operation on the app repo).
let LIVE = null, LIVE_RETIRED = null, LIVE_REGISTRY = null;
if (LIVE_COMMIT) {
  const tmp = mkdtempSync(join(tmpdir(), 'wl-live-'));
  const liveModule = async (rel) => {
    const src = execFileSync('git', ['-C', APP, 'show', `${LIVE_COMMIT}:${rel}`], { encoding: 'utf8' });
    const out = join(tmp, rel);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, src);
    return import(pathToFileURL(out).href);
  };
  LIVE = {};
  for (const lang of LANGS) LIVE[lang] = { decks: await liveModule(`src/data/${lang}/imposterDecks.ts`), locations: await liveModule(`src/data/${lang}/imposter.ts`) };
  LIVE_RETIRED = (await liveModule('src/data/retired.ts')).RETIRED_CARDS;
  LIVE_REGISTRY = execFileSync('git', ['-C', APP, 'show', `${LIVE_COMMIT}:src/data/imposterCategories.ts`], { encoding: 'utf8' });
  rmSync(tmp, { recursive: true, force: true });
}

const DECKS = [
  { id: 'food', app: 'foodAndDrinks', kind: 'word', from: 'decks', words: 'foodAndDrinksWords', hints: 'foodAndDrinksHints', retiredKey: 'imposterFoodAndDrinks' },
  { id: 'celebrities', app: 'famousPeople', kind: 'word', from: 'decks', words: 'famousPeopleWords', hints: 'famousPeopleHints', retiredKey: 'imposterFamousPeople' },
  { id: 'places', app: 'locations', kind: 'place', from: 'locations', words: 'imposterLocations', hints: 'imposterLocationHints', retiredKey: 'imposter' },
  { id: 'everyday-objects', app: 'everydayObjects', kind: 'word', from: 'decks', words: 'everydayObjectsWords', hints: 'everydayObjectsHints', retiredKey: 'imposterEverydayObjects' },
];
const ALLOW_FOLLOW = new Set([]);

const registry = readFileSync(join(APP, 'src/data/imposterCategories.ts'), 'utf8');
function accessOf(reg, appId) {
  const at = reg.indexOf(`id: '${appId}'`);
  if (at === -1) throw new Error(`deck ${appId} is not in imposterCategories.ts`);
  const block = reg.slice(at, reg.indexOf('}', at));
  const m = /access:\s*'(\w+)'/.exec(block);
  if (!m) throw new Error(`deck ${appId} has no access line`);
  if (/\bseason:/.test(block)) throw new Error(`deck ${appId} is seasonal and never ships to the web`);
  return m[1];
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', eacute: 'é', nbsp: ' ' };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (n in ENTITIES ? ENTITIES[n] : m))
  .trim();
function publishedTable(slug) {
  const html = readFileSync(join(SITE, 'imposter-game-words', slug, 'index.html'), 'utf8');
  const rows = new Map();
  for (const m of html.matchAll(/<tr><td>([^<]*)<\/td><td>([^<]*)<\/td><td>([^<]*)<\/td><\/tr>/g)) rows.set(decode(m[1]), decode(m[2]));
  if (rows.size === 0) throw new Error(`no word rows on ${slug}`);
  return rows;
}

const problems = [];
// --- English pass (rules 1 to 3) -------------------------------------------
const emitted = new Map();
for (const d of DECKS) {
  for (const [label, reg] of [['HEAD', registry], ...(LIVE_COMMIT ? [[LIVE_COMMIT, LIVE_REGISTRY]] : [])]) {
    const access = accessOf(reg, d.app);
    if (access === 'premium') throw new Error(`${d.app} is premium (${label})`);
    if (access === 'follow' && !ALLOW_FOLLOW.has(d.app)) throw new Error(`${d.app} is a follow deck (${label})`);
    if (access !== 'free') throw new Error(`${d.app} access '${access}' is not free (${label})`);
  }
  if (!RETIRED_CARDS[d.retiredKey]) throw new Error(`RETIRED_CARDS has no key ${d.retiredKey}`);
  const retired = new Set(RETIRED_CARDS[d.retiredKey]);
  if (LIVE_COMMIT) {
    const liveRetired = new Set(LIVE_RETIRED[d.retiredKey] || []);
    if ([...retired].sort().join() !== [...liveRetired].sort().join()) problems.push(`${d.id}: retired list differs from ${LIVE_COMMIT} (${[...liveRetired]} vs ${[...retired]})`);
  }
  const enWords = EN_MODULES[d.from][d.words];
  const enHints = EN_MODULES[d.from][d.hints];
  const page = publishedTable(d.id);
  const idx = [];
  enWords.forEach((word, i) => {
    if (retired.has(i)) return;
    const hint = enHints[i] || '';
    if (typeof word !== 'string' || !word.trim()) { problems.push(`${d.id}[${i}]: empty word`); return; }
    if (/[<>]/.test(word + hint)) { problems.push(`${d.id}[${i}]: angle bracket`); return; }
    if (!page.has(word)) { problems.push(`${d.id}[${i}]: "${word}" not published on /imposter-game-words/${d.id}/`); return; }
    if (page.get(word) !== hint) { problems.push(`${d.id}[${i}]: hint "${hint}" differs from published "${page.get(word)}"`); return; }
    idx.push(i);
  });
  for (const w of page.keys()) {
    const i = enWords.indexOf(w);
    if (i === -1) problems.push(`${d.id}: page publishes "${w}", not in the app deck`);
    else if (retired.has(i)) problems.push(`${d.id}: page publishes "${w}", RETIRED (${i})`);
  }
  emitted.set(d.id, idx);
}

// --- mirror pass (rule 3b) plus rules 4 and 5 ------------------------------
const OUT = {};
for (const lang of LANGS) {
  const L = MIRROR[lang];
  const strings = readFileSync(join(APP, L.strings), 'utf8');
  const dealer = JSON.parse(readFileSync(join(SITE, CONFIGS[lang].dealerWords), 'utf8'));
  OUT[lang] = [];
  for (const d of DECKS) {
    const words = L[d.from][d.words];
    const hints = L[d.from][d.hints];
    const liveWords = LIVE ? LIVE[lang][d.from][d.words] : null;
    const liveHints = LIVE ? LIVE[lang][d.from][d.hints] : null;
    const enWords = EN_MODULES[d.from][d.words];
    const enHints = EN_MODULES[d.from][d.hints];
    if (words.length !== enWords.length) problems.push(`${lang} ${d.id}: ${words.length} words vs English ${enWords.length}`);
    const nm = new RegExp(`\\b${d.app}:\\s*'([^']+)'`).exec(strings);
    if (!nm) { problems.push(`${lang} ${d.id}: no localized name`); continue; }
    const retired = new Set(RETIRED_CARDS[d.retiredKey]);
    const list = [];
    for (const i of emitted.get(d.id)) {
      const word = words[i];
      const hint = hints[i] || '';
      if (retired.has(i)) { problems.push(`${lang} ${d.id}[${i}]: retired`); continue; }
      if (typeof word !== 'string' || !word.trim()) { problems.push(`${lang} ${d.id}[${i}]: empty word`); continue; }
      if (!hint.trim() && (enHints[i] || '').trim()) { problems.push(`${lang} ${d.id}[${i}]: no easy hint`); continue; }
      if (/[<>]/.test(word + hint)) { problems.push(`${lang} ${d.id}[${i}]: angle bracket`); continue; }
      if (/[\u2014\u2013]/.test(word + hint)) { problems.push(`${lang} ${d.id}[${i}]: em or en dash`); continue; }
      if (LIVE && (liveWords[i] !== word || (liveHints[i] || '') !== hint)) problems.push(`${lang} ${d.id}[${i}]: "${word}"/"${hint}" is not what ${LIVE_COMMIT} deals ("${liveWords[i]}"/"${liveHints[i]}")`);
      list.push([word, hint]);
    }
    const dd = (dealer.decks || []).find((x) => x.id === d.id);
    if (!dd || JSON.stringify(dd.words) !== JSON.stringify(list)) problems.push(`${lang} ${d.id}: differs from the web dealer's words.json`);
    if (!dd || dd.name !== nm[1]) problems.push(`${lang} ${d.id}: name "${nm[1]}" differs from the dealer's "${dd && dd.name}"`);
    OUT[lang].push({ id: d.id, name: nm[1], kind: d.kind, words: list });
  }
}
if (problems.length) { console.error('Refusing to write:\n  ' + problems.join('\n  ')); process.exit(1); }

// --- page copy: one config per language in .tools/word-pages/ (PROPOSALS
// for Guy; every visible sentence is listed in the branch report) ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// German anchors transliterate umlauts (ä to ae), as the de slugs do
// (wuerdest, woerter); only de, so every other language's anchors are unchanged.
const DE_UMLAUT = { ä: 'ae', ö: 'oe', ü: 'ue', Ä: 'Ae', Ö: 'Oe', Ü: 'Ue' };
const slugify = (s, lang) => (lang === 'de' ? s.replace(/[äöüÄÖÜ]/g, (m) => DE_UMLAUT[m]) : s).replace(/ł/g, 'l').replace(/Ł/g, 'L').replace(/ß/g, 'ss').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const TONES = ['tone-cyan', 'tone-pink', 'tone-orange', 'tone-purple'];
const COPY = CONFIGS;
// The switcher: English first, then every config in order; this page is the
// one plain span. With es and pt alone this is exactly the markup the two
// configs used to carry by hand.
const ilang = (lang) => ['<a href="/imposter-game-words/" hreflang="en" lang="en">English</a>',
  ...ALTS.map((c) => (c.lang === lang ? `<span aria-current="page">${esc(c.langName)}</span>` : `<a href="${c.path}" hreflang="${c.hreflang}" lang="${c.htmlLang}">${esc(c.langName)}</a>`))].join('\n      ');

const ORIGIN = 'https://anticsapp.com';
function render(lang) {
  const C = COPY[lang];
  const cats = OUT[lang].map((d, n) => ({ ...d, anchor: slugify(d.name, lang), tone: TONES[n % TONES.length] }));
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Antics', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: C.langName, item: `${ORIGIN}${C.langHome}` },
      { '@type': 'ListItem', position: 3, name: C.ldGame, item: `${ORIGIN}${C.gamePath}` },
      { '@type': 'ListItem', position: 4, name: C.ldHere, item: `${ORIGIN}${C.path}` },
    ],
  };
  const toc = [...cats.map((c) => [c.anchor, c.name]), ...C.tocAfter]
    .map(([id, label], n) => `        <li class="${['tone-lime', ...TONES][n % 5]}"><a href="#${id}">${esc(label)}</a></li>`).join('\n');
  const tables = cats.map((c) => `      <section class="section ${c.tone} wl-cat" id="${c.anchor}">
        <h2>${esc(c.name)}</h2>
        <div class="table-wrap">
          <table class="wl-table">
            <thead>
              <tr><th>${esc(C.thWord)}</th><th>${esc(C.thHint)}</th></tr>
            </thead>
            <tbody>
${c.words.map(([w, h]) => `              <tr><td>${esc(w)}</td><td>${esc(h)}</td></tr>`).join('\n')}
            </tbody>
          </table>
        </div>
      </section>`).join('\n\n');
  const steps = (arr) => arr.map((s) => `          <li>${s}</li>`).join('\n');
  return `<!DOCTYPE html>
<html lang="${C.htmlLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="apple-itunes-app" content="app-id=6787743558">
  <title>${esc(C.title)}</title>
  <meta name="description" content="${esc(C.desc)}">
  <link rel="canonical" href="${ORIGIN}${C.path}">
  <link rel="alternate" hreflang="en" href="${ORIGIN}/imposter-game-words/">
${ALTS.map((c) => `  <link rel="alternate" hreflang="${c.hreflang}" href="${ORIGIN}${c.path}">`).join('\n')}
  <link rel="alternate" hreflang="x-default" href="${ORIGIN}/imposter-game-words/">
  <meta property="og:site_name" content="Antics">
  <meta property="og:locale" content="${C.ogLocale}">
${['en_GB', ...ALTS.filter((c) => c.lang !== lang).map((c) => c.ogLocale)].map((l) => `  <meta property="og:locale:alternate" content="${l}">`).join('\n')}
  <meta property="og:title" content="${esc(C.ogTitle)}">
  <meta property="og:description" content="${esc(C.desc)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${ORIGIN}${C.path}">
  <meta property="og:image" content="${ORIGIN}/img/og-card.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${ORIGIN}/img/og-card.png">
  <script type="application/ld+json">
${JSON.stringify(breadcrumb, null, 2)}
  </script>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16.png">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0E0A1F">
  <link rel="stylesheet" href="/css/site.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap">
  <!-- Word tables generated from the app's src/data/${lang} Imposter mirrors (free decks only, retired indexes removed, easy hint only) by .tools/gen-es-pt-word-pages.mjs in the site repo. Regenerate rather than hand-edit. -->
</head>
<body class="has-installbar wl-page">
<div class="page">
<article>
  <nav class="crumb" aria-label="${esc(C.crumbLabel)}"><a href="/"><img src="/img/icon-192.png" alt="" width="32" height="32">Antics</a> <span aria-hidden="true">&rsaquo;</span> <a href="${C.langHome}">${esc(C.langName)}</a> <span aria-hidden="true">&rsaquo;</span> <a href="${C.gamePath}">${esc(C.crumbGame)}</a> <span aria-hidden="true">&rsaquo;</span> ${esc(C.crumbHere)}</nav>

  <header class="page-head">
    <h1>${esc(C.h1)}</h1>
    <p class="standfirst">${esc(C.standfirst)}</p>
    <p class="note">${C.note}</p>
  </header>
  <nav class="ilang" aria-label="${esc(C.ilangLabel)}">
      ${ilang(lang)}
  </nav>

  <div class="guide-body">
    <nav class="toc" aria-label="${esc(C.tocLabel)}">
      <span class="label">${esc(C.tocLabel)}</span>
      <ol>
${toc}
      </ol>
    </nav>

    <div class="prose">
      <section class="section tone-lime" id="${C.wordsId}">
        <h2>${esc(C.wordsH2)}</h2>
        <p>${esc(C.wordsP)}</p>
        <p class="note wl-print-tip">${esc(C.printTip)}</p>
      </section>

${tables}

      <section class="section tone-lime wl-after" id="${C.paperId}">
        <h2>${esc(C.paperH2)}</h2>
        <p>${esc(C.paperP)}</p>
        <ol class="stack steps">
${steps(C.paperSteps.map(esc))}
        </ol>
        <p>${esc(C.paperAfter)}</p>
      </section>

      <section class="section tone-cyan" id="${C.threeId}">
        <h2>${esc(C.threeH2)}</h2>
        <p>${esc(C.threeP)}</p>
        <ol class="stack steps">
${steps(C.threeSteps)}
        </ol>
      </section>

      ${C.cta}

      ${C.guides}
    </div>
  </div>

  ${C.footer}
</article>
</div>

${C.installbar}
<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "66eb3dccc88d447ba345b48a8d5e2bb3"}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>
`;
}

const passed = 'retired applied, free non-seasonal decks only, English-published indexes, equal to the web dealer words.json' + (LIVE_COMMIT ? `, equal to ${LIVE_COMMIT}` : '');
if (CHECK) {
  // Compare only: the pages on disk must be exactly what this run renders.
  const stale = LANGS.filter((lang) => {
    const f = join(SITE, COPY[lang].dir, 'index.html');
    return !existsSync(f) || readFileSync(f, 'utf8') !== render(lang);
  });
  if (stale.length) { console.error(`Stale: ${stale.map((l) => COPY[l].dir).join(', ')}. Run without --check to regenerate.`); process.exit(1); }
  const n = LANGS.length;
  console.log(`${n === 1 ? 'The page is' : n === 2 ? 'Both pages are' : `All ${n} pages are`} current (${LANGS.join(', ')}; ${passed}).`);
  process.exit(0);
}
const require = createRequire(join(APP, 'package.json'));
const QRCode = require('qrcode');
for (const lang of LANGS) {
  const C = COPY[lang];
  mkdirSync(join(SITE, C.dir), { recursive: true });
  writeFileSync(join(SITE, C.dir, 'index.html'), render(lang));
  if (!/[?&]c=([a-z0-9-]{1,32})$/.test(C.qr)) throw new Error('bad tag ' + C.qr);
  await QRCode.toFile(join(SITE, C.dir, 'qr.png'), C.qr, { width: 600, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0E0A1F', light: '#FFFFFF' } });
  console.log(`Wrote ${C.dir}/index.html and qr.png (${C.qr})`);
  for (const d of OUT[lang]) console.log(`  ${d.id.padEnd(17)} ${String(d.words.length).padStart(3)}  ${d.name}`);
}
console.log(`All checks passed: ${passed}.`);
