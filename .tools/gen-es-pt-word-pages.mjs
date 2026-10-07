#!/usr/bin/env node
// ---------------------------------------------------------------------------
// GEN ES/PT WORD PAGES (7 Oct 2026, lever 7 of the app repo's
// ops/research/organic-visibility-2026-10-05.md). Builds
//   /es/palabras-juego-del-impostor/index.html  (es-419)
//   /pt/palavras-jogo-do-impostor/index.html    (pt-BR)
// from the SAME arrays the app deals from, with the SAME filters as the app
// repo's ops/export-imposter-web-words.mjs (copied, not imported):
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
//      (/es/juego-del-impostor/words.json, /pt/jogo-do-impostor/words.json)
//   5. OPTIONAL, with --live <commit>: the lists must also equal what the app
//      at that commit deals (the live binary's release commit); its es/pt
//      words, easy hints, access and retired indexes are read with git show
// Only the EASY hint is shown: HARD_TIER_LANGS in src/data/localizedDecks.ts
// is ['en'], so the app never deals an es or pt hard hint.
//
// WHY IT LIVES HERE: these two pages say every word on them is in the app,
// so they must be regenerated after ANY Imposter retire or es/pt mirror
// repair, in the same sitting as ops/export-imposter-web-words.mjs. The site
// repo's pre-commit hook (.githooks/check-word-pages.mjs) refuses a commit when
// either page no longer equals its dealer's words.json, which is exactly
// the state a fresh export leaves behind. The dot folder keeps this file off
// the published site (GitHub Pages skips dot folders). Moving it into the
// app repo as an export mode is a job for a session allowed to edit that
// repo; until then, this is the one generator.
//
// Reads the app repo read-only. Writes only into the site checkout.
// Usage (from a site checkout or worktree):
//   source ~/.nvm/nvm.sh
//   node --no-warnings .tools/gen-es-pt-word-pages.mjs            # regenerate
//   node --no-warnings .tools/gen-es-pt-word-pages.mjs --check    # compare only
//   options: --site <dir> (default: the checkout holding this file)
//            --app <dir>  (default: /Users/guymatthews/Antics)
//            --live <commit> (rule 5)
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, existsSync, rmSync } from 'node:fs';
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

const imp = (rel) => import(pathToFileURL(join(APP, rel)).href);
const decks = await imp('src/data/imposterDecks.ts');
const locations = await imp('src/data/imposter.ts');
const { RETIRED_CARDS } = await imp('src/data/retired.ts');
const MIRROR = {
  es: { decks: await imp('src/data/es/imposterDecks.ts'), locations: await imp('src/data/es/imposter.ts'), strings: 'src/i18n/strings.es.ts' },
  pt: { decks: await imp('src/data/pt/imposterDecks.ts'), locations: await imp('src/data/pt/imposter.ts'), strings: 'src/i18n/strings.pt.ts' },
};
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
  LIVE = {
    es: { decks: await liveModule('src/data/es/imposterDecks.ts'), locations: await liveModule('src/data/es/imposter.ts') },
    pt: { decks: await liveModule('src/data/pt/imposterDecks.ts'), locations: await liveModule('src/data/pt/imposter.ts') },
  };
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
for (const lang of ['es', 'pt']) {
  const L = MIRROR[lang];
  const strings = readFileSync(join(APP, L.strings), 'utf8');
  const dealer = JSON.parse(readFileSync(join(SITE, lang === 'es' ? 'es/juego-del-impostor/words.json' : 'pt/jogo-do-impostor/words.json'), 'utf8'));
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

// --- page copy (PROPOSALS for Guy; every visible sentence is listed in the
// branch report) ------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const TONES = ['tone-cyan', 'tone-pink', 'tone-orange', 'tone-purple'];

const COPY = {
  es: {
    htmlLang: 'es-419', path: '/es/palabras-juego-del-impostor/', dir: 'es/palabras-juego-del-impostor',
    ogLocale: 'es_MX', ogAlt: ['en_GB', 'pt_BR'],
    title: 'Palabras para el juego del impostor: lista para imprimir',
    desc: 'Palabras para el juego del impostor con la pista de cada una, en cuatro categorías. Para imprimir, para jugar sin celular y para jugar de a 3. Gratis.',
    ogTitle: 'Palabras para el juego del impostor, con la pista de cada una',
    crumbLabel: 'Ruta de navegación', langHome: '/es/', langName: 'Español',
    crumbGame: 'Juego del impostor online', gamePath: '/es/juego-del-impostor/', crumbHere: 'Palabras',
    ldGame: 'Juego del impostor online', ldHere: 'Palabras para el juego del impostor',
    h1: 'Palabras para el juego del impostor',
    standfirst: 'Cuatro categorías completas del juego del impostor, con la pista que recibe el impostor para cada palabra. Sirven para jugar en papel, sin celular, y se imprimen con una categoría por hoja.',
    note: '¿Van a jugar ya? <a class="inline" href="/es/juego-del-impostor/">Repartan las palabras en un solo celular</a>, gratis y sin descargar nada.',
    ilangLabel: 'Idioma',
    ilang: '<a href="/imposter-game-words/" hreflang="en" lang="en">English</a>\n      <span aria-current="page">Español</span>\n      <a href="/pt/palavras-jogo-do-impostor/" hreflang="pt" lang="pt-BR">Português</a>',
    tocLabel: 'En esta página',
    tocAfter: [['sin-celular', 'Sin celular'], ['de-a-3', 'De a 3']],
    wordsH2: 'Las palabras y la pista del impostor',
    wordsP: 'Cada palabra de esta página sale en la app Antics en español latinoamericano, con la misma pista. La pista es lo que ve el impostor en lugar de la palabra: algo que lo acerca sin regalarle la respuesta. En papel, ustedes deciden si se la dan o no.',
    printTip: 'Para imprimir: en la computadora, usen Imprimir (Ctrl+P, o Cmd+P en Mac). Cada categoría sale en su propia hoja.',
    thWord: 'Palabra secreta', thHint: 'Pista del impostor',
    paperId: 'sin-celular',
    paperH2: 'Cómo jugar al impostor sin celular ni app',
    paperP: 'No hace falta celular (o móvil) ni app: solo papel, algo para escribir y esta lista. En cada ronda, una persona reparte y no juega.',
    paperSteps: [
      'Quien reparte elige una palabra de la lista y no se la dice a nadie.',
      'Corta un papelito por cada jugador. Escribe la palabra en todos menos en uno, y en ese escribe Impostor. Si quieren ayudar al impostor, escribe también la pista.',
      'Doblen los papelitos, revuélvanlos y que cada quien saque uno sin mostrarlo.',
      'Den una vuelta: cada quien dice un detalle de la palabra, sin decirla. El impostor finge que la sabe.',
      'A las tres, todos señalan a su sospechoso. Si atrapan al impostor, tiene un intento para adivinar la palabra, y si acierta, gana igual.',
      'En la siguiente ronda reparte la persona de la izquierda.',
    ],
    paperAfter: 'Sin papel también se puede: la app Antics le muestra la palabra a todos menos al impostor, que recibe una pista, y así nadie tiene que quedarse fuera.',
    threeId: 'de-a-3',
    threeH2: 'Cómo jugar al impostor de a 3',
    threeP: 'De a tres, los dos que saben la palabra solo tienen que confiar el uno en el otro, y la votación se acaba antes de empezar. Con estos cuatro cambios vuelve a ser un juego:',
    threeSteps: [
      'Repartan en un celular, no en papel: de a tres nadie puede quedarse fuera para escribir los papelitos. <a class="inline" href="/es/juego-del-impostor/">El juego del impostor online</a> funciona desde tres jugadores.',
      'Una sola palabra por persona y una sola vuelta. Luego voten.',
      'Cualquiera puede empezar, también el impostor. Si quien empieza nunca es el impostor, los otros lo descartan de entrada.',
      'Dejen la pista activada y lleven la cuenta: el impostor gana un punto si se salva en la votación y otro si adivina la palabra, lo hayan atrapado o no, y los otros dos ganan un punto cada uno si señalan a quien era. Gana el primero en llegar a cinco.',
    ],
    // Copied exactly from the /es/ hub's closing box (tags are this page's own)
    cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Nueve juegos. Un celular.</h2>
        <p>Sin anuncios, sin registro, y todos juegan.</p>
        <a class="cta" href="/get/?c=site-es-palabras">Descarga Antics gratis</a>
        <div class="cta-qr">
          <img src="/es/palabras-juego-del-impostor/qr.png" width="120" height="120" alt="Código QR que abre Antics en tu celular" loading="lazy">
          <p>¿Estás en la computadora? Apunta aquí la cámara de tu celular.</p>
        </div>
      </div>`,
    guides: `<nav class="guides tone-cyan" aria-label="Más juegos en español">
        <strong>Más juegos en español</strong>
        <ul class="link-list">
          <li><a href="/es/juego-del-impostor/">Juego del impostor online, en un solo celular</a></li>
          <li><a href="/es/preguntas-yo-nunca-nunca/">Yo nunca nunca: preguntas y cómo se juega</a></li>
          <li><a href="/es/preguntas-verdad-o-reto/">Verdad o reto: preguntas y retos</a></li>
          <li><a href="/es/preguntas-que-prefieres/">¿Qué prefieres? Preguntas para dividir al grupo</a></li>
          <li><a href="/es/preguntas-quien-es-mas-probable/">¿Quién es más probable que…? Preguntas para señalar</a></li>
          <li><a href="/es/">Antics en español: todos los juegos</a></li>
        </ul>
      </nav>`,
    footer: `<footer class="site-foot">
    <a href="/es/">Antics: juegos de fiesta</a> · <a href="/privacy.html" hreflang="en">Privacidad (en inglés)</a><br>
    18+ · Cuiden a sus amigos.
  </footer>`,
    installbar: `<aside class="installbar" aria-label="Descarga la app">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Juegos de fiesta</span></p>
  <a class="btn btn--sm" href="/get/?c=site-es-palabras-bar">Descargar gratis</a>
</aside>`,
    qr: 'https://anticsapp.com/get/?c=site-es-palabras-qr',
  },
  pt: {
    htmlLang: 'pt-BR', path: '/pt/palavras-jogo-do-impostor/', dir: 'pt/palavras-jogo-do-impostor',
    ogLocale: 'pt_BR', ogAlt: ['en_GB', 'es_MX'],
    title: 'Palavras para jogo do impostor: lista para imprimir',
    desc: 'Palavras para jogo do impostor com a dica de cada uma, em quatro categorias. Para imprimir, para jogar sem celular e para jogar com 3 pessoas. Grátis.',
    ogTitle: 'Palavras para jogo do impostor, com a dica de cada uma',
    crumbLabel: 'Caminho de navegação', langHome: '/pt/', langName: 'Português',
    crumbGame: 'Jogo do impostor online', gamePath: '/pt/jogo-do-impostor/', crumbHere: 'Palavras',
    ldGame: 'Jogo do impostor online', ldHere: 'Palavras para jogo do impostor',
    h1: 'Palavras para o jogo do impostor',
    standfirst: 'Quatro categorias completas do jogo do impostor, com a dica que o impostor recebe para cada palavra. Dá para jogar no papel, sem celular, e imprimir uma categoria por folha.',
    note: 'Vão jogar agora? <a class="inline" href="/pt/jogo-do-impostor/">Distribuam as palavras em um celular só</a>, grátis e sem baixar nada.',
    ilangLabel: 'Idioma',
    ilang: '<a href="/imposter-game-words/" hreflang="en" lang="en">English</a>\n      <a href="/es/palabras-juego-del-impostor/" hreflang="es" lang="es-419">Español</a>\n      <span aria-current="page">Português</span>',
    tocLabel: 'Nesta página',
    tocAfter: [['sem-celular', 'Sem celular'], ['com-3-pessoas', 'Com 3 pessoas']],
    wordsH2: 'As palavras e a dica do impostor',
    wordsP: 'Cada palavra desta página aparece no app Antics em português do Brasil, com a mesma dica. A dica é o que o impostor vê no lugar da palavra: algo que chega perto sem entregar a resposta. No papel, vocês decidem se ele recebe a dica ou não.',
    printTip: 'Para imprimir: no computador, use Imprimir (Ctrl+P, ou Cmd+P no Mac). Cada categoria sai em uma folha própria.',
    thWord: 'Palavra secreta', thHint: 'Dica do impostor',
    paperId: 'sem-celular',
    paperH2: 'Como jogar o jogo do impostor sem celular e sem app',
    paperP: 'Não precisa de celular nem de app: só papel, caneta e esta lista. Em cada rodada, uma pessoa distribui e não joga.',
    paperSteps: [
      'Quem distribui escolhe uma palavra da lista e não conta para ninguém.',
      'Corte um papelzinho para cada jogador. Escreva a palavra em todos menos um, e nesse escreva Impostor. Se quiserem ajudar o impostor, escreva também a dica.',
      'Dobrem os papéis, misturem e cada um pega um sem mostrar.',
      'Façam uma roda: cada um fala um detalhe da palavra, sem dizer qual é. O impostor finge que sabe.',
      'No três, todo mundo aponta para o suspeito. Se o impostor for pego, tem um chute para acertar a palavra, e se acertar, ganha mesmo assim.',
      'Na rodada seguinte, quem distribui é a pessoa da esquerda.',
    ],
    paperAfter: 'Sem papel também dá: o app Antics mostra a palavra para todo mundo menos o impostor, que recebe uma dica, e assim ninguém precisa ficar de fora.',
    threeId: 'com-3-pessoas',
    threeH2: 'Como jogar o jogo do impostor com 3 pessoas',
    threeP: 'Com três, os dois que sabem a palavra só precisam confiar um no outro, e a votação acaba antes de começar. Com estas quatro mudanças, vira jogo de novo:',
    threeSteps: [
      'Distribuam no celular, não no papel: com três, ninguém pode ficar de fora para escrever os papéis. <a class="inline" href="/pt/jogo-do-impostor/">O jogo do impostor online</a> funciona a partir de três jogadores.',
      'Uma palavra só por pessoa e uma volta só. Depois votem.',
      'Qualquer um pode começar, inclusive o impostor. Se quem começa nunca é o impostor, os outros descartam essa pessoa logo de cara.',
      'Deixem a dica ligada e marquem pontos: o impostor ganha um ponto se escapar da votação e outro se acertar a palavra, pego ou não, e os outros dois ganham um ponto cada se apontarem a pessoa certa. Ganha quem chegar a cinco primeiro.',
    ],
    // Copied exactly from the /pt/ hub's closing box (tags are this page's own)
    cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Nove jogos. Um celular.</h2>
        <p>Sem anúncios, sem cadastro, e todo mundo joga.</p>
        <a class="cta" href="/get/?c=site-pt-palavras">Baixe o Antics grátis</a>
        <div class="cta-qr">
          <img src="/pt/palavras-jogo-do-impostor/qr.png" width="120" height="120" alt="Código QR que abre o Antics no seu celular" loading="lazy">
          <p>Está no computador? Aponte a câmera do celular para cá.</p>
        </div>
      </div>`,
    guides: `<nav class="guides tone-cyan" aria-label="Mais jogos em português">
        <strong>Mais jogos em português</strong>
        <ul class="link-list">
          <li><a href="/pt/jogo-do-impostor/">Jogo do impostor online, em um celular só</a></li>
          <li><a href="/pt/perguntas-eu-nunca/">Eu nunca: perguntas e como jogar</a></li>
          <li><a href="/pt/perguntas-verdade-ou-desafio/">Verdade ou desafio: perguntas e desafios</a></li>
          <li><a href="/pt/perguntas-o-que-voce-prefere/">O que você prefere? Perguntas para dividir o grupo</a></li>
          <li><a href="/pt/perguntas-quem-e-mais-provavel/">Quem é mais provável? Perguntas para apontar o dedo</a></li>
          <li><a href="/pt/">Antics em português: todos os jogos</a></li>
        </ul>
      </nav>`,
    footer: `<footer class="site-foot">
    <a href="/pt/">Antics: jogos de festa</a> · <a href="/privacy.html" hreflang="en">Privacidade (em inglês)</a><br>
    18+ · Cuidem dos amigos.
  </footer>`,
    installbar: `<aside class="installbar" aria-label="Baixe o app">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Jogos de festa</span></p>
  <a class="btn btn--sm" href="/get/?c=site-pt-palavras-bar">Baixar grátis</a>
</aside>`,
    qr: 'https://anticsapp.com/get/?c=site-pt-palavras-qr',
  },
};

const ORIGIN = 'https://anticsapp.com';
function render(lang) {
  const C = COPY[lang];
  const cats = OUT[lang].map((d, n) => ({ ...d, anchor: slugify(d.name), tone: TONES[n % TONES.length] }));
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
  <link rel="alternate" hreflang="es" href="${ORIGIN}${COPY.es.path}">
  <link rel="alternate" hreflang="pt" href="${ORIGIN}${COPY.pt.path}">
  <link rel="alternate" hreflang="x-default" href="${ORIGIN}/imposter-game-words/">
  <meta property="og:site_name" content="Antics">
  <meta property="og:locale" content="${C.ogLocale}">
${C.ogAlt.map((l) => `  <meta property="og:locale:alternate" content="${l}">`).join('\n')}
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
      ${C.ilang}
  </nav>

  <div class="guide-body">
    <nav class="toc" aria-label="${esc(C.tocLabel)}">
      <span class="label">${esc(C.tocLabel)}</span>
      <ol>
${toc}
      </ol>
    </nav>

    <div class="prose">
      <section class="section tone-lime" id="${lang === 'es' ? 'palabras' : 'palavras'}">
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
  const stale = ['es', 'pt'].filter((lang) => {
    const f = join(SITE, COPY[lang].dir, 'index.html');
    return !existsSync(f) || readFileSync(f, 'utf8') !== render(lang);
  });
  if (stale.length) { console.error(`Stale: ${stale.map((l) => COPY[l].dir).join(', ')}. Run without --check to regenerate.`); process.exit(1); }
  console.log(`Both pages are current (${passed}).`);
  process.exit(0);
}
const require = createRequire(join(APP, 'package.json'));
const QRCode = require('qrcode');
for (const lang of ['es', 'pt']) {
  const C = COPY[lang];
  mkdirSync(join(SITE, C.dir), { recursive: true });
  writeFileSync(join(SITE, C.dir, 'index.html'), render(lang));
  if (!/[?&]c=([a-z0-9-]{1,32})$/.test(C.qr)) throw new Error('bad tag ' + C.qr);
  await QRCode.toFile(join(SITE, C.dir, 'qr.png'), C.qr, { width: 600, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0E0A1F', light: '#FFFFFF' } });
  console.log(`Wrote ${C.dir}/index.html and qr.png (${C.qr})`);
  for (const d of OUT[lang]) console.log(`  ${d.id.padEnd(17)} ${String(d.words.length).padStart(3)}  ${d.name}`);
}
console.log(`All checks passed: ${passed}.`);
