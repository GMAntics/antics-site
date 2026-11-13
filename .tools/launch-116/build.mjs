#!/usr/bin/env node
// 1.1.6 launch pages (feat/116-launch-pages, 13 Nov 2026): the Blag and Name 3
// guides in the eight translated site languages, built from the English pages
// on feat/116-new-games (/blag-game/, /name-3-game/), plus the hreflang set and
// a language row on the English pages, sitemap entries and a "new in the app"
// block on each language hub. Copy lives in ./i18n-<lang>.mjs. Re-runnable:
// it rewrites the generated pages and patches the English pages and hubs only
// if the marker is absent. NOT FOR PUBLISH before 1.1.6 is live (30 Nov 2026).
//
// Usage: node .tools/launch-116/build.mjs   (from the site worktree root)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const LANGS = process.env.LAUNCH_LANGS ? process.env.LAUNCH_LANGS.split(',') : ['es', 'pt', 'de', 'fr', 'it', 'nl', 'pl', 'cs'];
const D = {};
for (const l of LANGS) D[l] = (await import(`./i18n-${l}.mjs`)).default;

const SITE = 'https://anticsapp.com';
const EN = {
  blag: '/blag-game/',
  n3: '/name-3-game/',
};
const NAMES = { en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch', fr: 'Français', it: 'Italiano', nl: 'Nederlands', pl: 'Polski', cs: 'Čeština' };
const LANGATTR = { en: 'en', es: 'es-419', pt: 'pt-BR', de: 'de', fr: 'fr', it: 'it', nl: 'nl', pl: 'pl', cs: 'cs' };
const OGLOC = { en: 'en_GB', es: 'es_MX', pt: 'pt_BR', de: 'de_DE', fr: 'fr_FR', it: 'it_IT', nl: 'nl_NL', pl: 'pl_PL', cs: 'cs_CZ' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (game, l) => (l === 'en' ? EN[game] : `/${l}/${D[l][game].slug}/`);

for (const l of LANGS) {
  for (const g of ['blag', 'n3']) {
    const s = JSON.stringify(D[l]);
    if (s.includes('\u2014')) throw new Error(`${l}: em dash in copy`);
    if (!/^[a-z0-9-]+$/.test(D[l][g].slug)) throw new Error(`${l}.${g}: bad slug`);
  }
}

function hreflangs(game) {
  const rows = ['en', ...LANGS].map((l) => `  <link rel="alternate" hreflang="${l}" href="${SITE}${url(game, l)}">`);
  rows.push(`  <link rel="alternate" hreflang="x-default" href="${SITE}${EN[game]}">`);
  return rows.join('\n');
}

function ilang(game, cur, aria) {
  const rows = ['en', ...LANGS].map((l) =>
    l === cur
      ? `        <span aria-current="page">${NAMES[l]}</span>`
      : `        <a href="${url(game, l)}" hreflang="${l}" lang="${LANGATTR[l]}">${NAMES[l]}</a>`);
  return `      <nav class="ilang" aria-label="${esc(aria)}">\n${rows.join('\n')}\n      </nav>`;
}

function faqLd(qa) {
  const items = qa.map(([q, a]) => `    {\n      "@type": "Question",\n      "name": ${JSON.stringify(q)},\n      "acceptedAnswer": { "@type": "Answer", "text": ${JSON.stringify(a)} }\n    }`);
  return `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [\n${items.join(',\n')}\n  ]\n}\n</script>`;
}

function head(l, game, extra = '') {
  const c = D[l].chrome; const p = D[l][game];
  const u = url(game, l);
  const alts = ['en', ...LANGS].filter((x) => x !== l).map((x) => `  <meta property="og:locale:alternate" content="${OGLOC[x]}">`).join('\n');
  return `<!DOCTYPE html>
<html lang="${LANGATTR[l]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="apple-itunes-app" content="app-id=6787743558">
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.desc)}">
  <link rel="canonical" href="${SITE}${u}">
${hreflangs(game)}
  <meta property="og:site_name" content="Antics">
  <meta property="og:locale" content="${OGLOC[l]}">
${alts}
  <meta property="og:title" content="${esc(p.ogTitle)}">
  <meta property="og:description" content="${esc(p.ogDesc)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE}${u}">
  <meta property="og:image" content="${SITE}/img/og-card.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/img/og-card.png">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Antics", "item": "${SITE}/" },
      { "@type": "ListItem", "position": 2, "name": ${JSON.stringify(NAMES[l])}, "item": "${SITE}/${l}/" },
      { "@type": "ListItem", "position": 3, "name": ${JSON.stringify(p.crumb)}, "item": "${SITE}${u}" }
    ]
  }
  </script>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16.png">
  <link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0E0A1F">
${extra}  <link rel="stylesheet" href="/css/site.css">
  <link rel="preload" href="/fonts/bricolage-800-latin.woff2" as="font" type="font/woff2" crossorigin>
${l === 'pl' || l === 'cs' ? '  <link rel="preload" href="/fonts/bricolage-800-latin-ext.woff2" as="font" type="font/woff2" crossorigin>\n' : ''}  <script src="/js/deal.js" defer></script>
${game === 'n3' ? N3_STYLE : ''}</head>
<body class="has-installbar">
<a class="skip" href="#main">${esc(c.skip)}</a>
<div class="page">
  <nav class="crumb" aria-label="${esc(c.crumbAria)}"><a href="/"><img src="/img/icon-192.png" alt="" width="32" height="32">Antics</a> <span class="crumb-step"><span aria-hidden="true">&rsaquo;</span>&nbsp;<a href="/${l}/">${NAMES[l]}</a></span> <span class="crumb-step"><span aria-hidden="true">&rsaquo;</span>&nbsp;${esc(p.crumb)}</span></nav>
<main id="main" tabindex="-1">
<article>

  <div class="hero">
    <header class="page-head">
      <h1>${esc(p.h1)}</h1>
      <p class="standfirst">${esc(p.standfirst)}</p>
    </header>
  </div>
${ilang(game, l, c.langAria)}
`;
}

const N3_STYLE = `  <link rel="stylesheet" href="/js/generator.css">
  <style>
    .agen[data-game="name3"] .agen-card::before { content: var(--n3-kicker); }
    .n3-clock { margin: 14px 0 0; font-size: 40px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
    .n3-clock.is-warn { color: #FF5C5C; }
    .n3-clock[hidden] { display: none; }
  </style>
`;

function toc(c, labels, ids) {
  const tones = ['cyan', 'pink', 'lime', 'orange', 'purple'];
  return `    <nav class="toc" aria-label="${esc(c.tocLabel)}">
      <span class="label">${esc(c.tocLabel)}</span>
      <ol>
${labels.map((t, i) => `        <li class="tone-${tones[i]}"><a href="#${ids[i]}">${esc(t)}</a></li>`).join('\n')}
      </ol>
    </nav>`;
}

function ctaBlock(c, cta, tag) {
  return `      <div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>${esc(cta.h2)}</h2>
        <p>${esc(cta.p)}</p>
        <p><a class="cta" href="/get/?c=${tag}">${esc(c.appStore)}</a></p>
        <p><a class="cta btn--ghost" href="/get/?c=${tag}">${esc(c.googlePlay)}</a></p>
        <p class="note">${esc(c.laptop)} <a href="/get/?c=${tag}-laptop">anticsapp.com/get</a> ${esc(c.laptopTail)}</p>
      </div>`;
}

function guides(l, c, game) {
  const other = game === 'blag' ? 'n3' : 'blag';
  const p = D[l][other];
  return `      <nav class="guides tone-cyan" aria-label="${esc(c.guidesAria)}">
        <strong>${esc(c.guidesAria)}</strong>
        <ul class="link-list">
          <li><a href="/${l}/${p.slug}/">${esc(p.linkText)}</a></li>
          <li><a href="${c.imposterUrl}">${esc(c.imposterText)}</a></li>
          <li><a href="/${l}/">${esc(c.hubText)}</a></li>
        </ul>
      </nav>`;
}

function foot(l, c, tag) {
  return `  <footer class="site-foot">
    <a href="/${l}/">${c.footerHome}</a> · <a href="/privacy.html" hreflang="en">${esc(c.privacy)}</a><br>
    ${esc(c.footerLine)}
  </footer>
</div>

<aside class="installbar" aria-label="${esc(c.installAria)}">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>${esc(c.installSub)}</span></p>
  <a class="btn btn--sm" href="/get/?c=${tag}-bar">${esc(c.installBtn)}</a>
</aside>
`;
}
const CF = `<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "66eb3dccc88d447ba345b48a8d5e2bb3"}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>
`;

function blagPage(l) {
  const c = D[l].chrome; const b = D[l].blag; const tag = `site-blag-${l}`;
  const ids = ['how-to-play', 'modes', 'phones', 'lying', 'faq'];
  return head(l, 'blag') + `
  <div class="guide-body">
${toc(c, b.toc, ids)}

    <div class="prose">
      <section class="section tone-cyan" id="how-to-play">
        <h2>${esc(b.how.h2)}</h2>
        <ol>
${b.how.steps.map((s) => `          <li>${esc(s)}</li>`).join('\n')}
        </ol>
        <p>${esc(b.how.p)}</p>
      </section>

      <section class="section tone-pink" id="modes">
        <h2>${esc(b.modes.h2)}</h2>
        <h3>${esc(b.modes.aboutH)}</h3>
        <p>${esc(b.modes.aboutP)}</p>
        <h3>${esc(b.modes.whoH)}</h3>
        <p>${esc(b.modes.whoP)}</p>
        <h3>${esc(b.modes.lieH)}</h3>
        <p>${esc(b.modes.lieP1)}<strong>${esc(b.modes.lieBtn)}</strong>${esc(b.modes.lieP2)}</p>
      </section>

      <section class="section tone-lime" id="phones">
        <h2>${esc(b.phones.h2)}</h2>
        <p>${esc(b.phones.p1)}</p>
        <p>${esc(b.phones.p2)}</p>
      </section>

      <section class="section tone-orange" id="lying">
        <h2>${esc(b.lying.h2)}</h2>
        <ul>
${b.lying.items.map(([h, t]) => `          <li><strong>${esc(h)}</strong> ${esc(t)}</li>`).join('\n')}
        </ul>
      </section>

      <section class="section faq tone-purple" id="faq">
        <h2>${esc(b.faq.h2)}</h2>
${b.faq.qa.map(([q, a]) => `
        <h3>${esc(q)}</h3>
        <p>${esc(a)}</p>`).join('\n')}
      </section>

${ctaBlock(c, b.cta, tag)}

${guides(l, c, 'blag')}
    </div>
  </div>
</article>
</main>

${foot(l, c, tag)}
${faqLd(b.faq.qa)}
${CF}`;
}

function n3Script(l) {
  const t = D[l].n3.tool;
  const S = {
    cats: D[l].n3.cats10, clock: 5, start: t.start, again: t.goAgain, next: t.next, restart: t.restart,
    timeUp: t.timeUp, count: t.count, doneQ: t.doneQ, doneCount: t.doneCount,
  };
  return `<script>
// Name 3 taster, ${l} (feat/116-launch-pages). The same ten FREE categories as
// /name-3-game/ (src/data/nameThree.ts indexes 0, 1, 3, 9, 10, 21, 22, 24, 30,
// 36, all in FREE_CARDS.nameThree), copied from the app's ${l} mirror
// src/data/${l}/nameThree.ts. Five seconds, NAME_THREE_DEFAULT_CLOCK_S.
(function () {
  'use strict';
  var S = ${JSON.stringify(S)};
  var q = document.getElementById('n3-q');
  var clock = document.getElementById('n3-clock');
  var start = document.getElementById('n3-start');
  var next = document.getElementById('n3-next');
  var count = document.getElementById('n3-count');
  if (!q || !clock || !start || !next || !count) return;
  var order = S.cats.slice();
  for (var i = order.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = order[i]; order[i] = order[j]; order[j] = t;
  }
  var at = 0;
  var timer = null;
  var done = false;
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function show() {
    stop();
    q.textContent = order[at];
    clock.hidden = true;
    clock.classList.remove('is-warn');
    start.disabled = false;
    start.textContent = S.start;
    count.textContent = S.count.replace('{n}', String(at + 1)).replace('{of}', String(order.length));
  }
  start.addEventListener('click', function () {
    stop();
    var left = S.clock;
    clock.hidden = false;
    clock.textContent = String(left);
    clock.classList.remove('is-warn');
    start.disabled = true;
    timer = setInterval(function () {
      left -= 1;
      if (left <= 0) {
        stop();
        clock.textContent = S.timeUp;
        clock.classList.add('is-warn');
        start.disabled = false;
        start.textContent = S.again;
        return;
      }
      clock.textContent = String(left);
      if (left <= 3) clock.classList.add('is-warn');
    }, 1000);
  });
  next.addEventListener('click', function () {
    if (done) {
      done = false;
      at = 0;
      next.textContent = S.next;
      show();
      return;
    }
    at += 1;
    if (at >= order.length) {
      stop();
      done = true;
      q.textContent = S.doneQ;
      clock.hidden = true;
      start.disabled = true;
      next.textContent = S.restart;
      count.textContent = S.doneCount;
      return;
    }
    show();
  });
  show();
})();
</script>`;
}

function n3Page(l) {
  const c = D[l].chrome; const n = D[l].n3; const t = n.tool; const tag = `site-name3-${l}`;
  const ids = ['how-to-play', 'try-it', 'rules', 'categories', 'faq'];
  return head(l, 'n3') + `
  <div class="guide-body">
${toc(c, n.toc, ids)}

    <div class="prose">
      <section class="section tone-cyan" id="how-to-play">
        <h2>${esc(n.how.h2)}</h2>
        <ol>
${n.how.steps.map((s) => `          <li>${esc(s)}</li>`).join('\n')}
        </ol>
        <p>${esc(n.how.p)}</p>
      </section>

      <section class="section tone-pink" id="try-it">
        <h2>${esc(n.tryIt.h2)}</h2>
        <p>${esc(n.tryIt.p)}</p>
        <div class="tool-wrap">
          <div id="n3" class="agen" data-game="name3" style="--n3-kicker: '${esc(n.kicker)}'">
            <div class="agen-card" aria-live="polite" aria-atomic="true">
              <p class="agen-q" id="n3-q">${esc(n.cats10[1])}</p>
              <p class="n3-clock" id="n3-clock" hidden>5</p>
            </div>
            <div class="agen-controls">
              <button class="agen-next" type="button" id="n3-start">${esc(t.start)}</button>
              <button class="agen-next" type="button" id="n3-next">${esc(t.next)}</button>
            </div>
            <p class="agen-count" id="n3-count">${esc(t.countInit)}</p>
            <div class="agen-cta">
              <p class="agen-cta-h">${esc(t.ctaH)}</p>
              <a class="agen-btn" href="/get/?c=${tag}-taster">${esc(c.installBtnLong)}</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section tone-lime" id="rules">
        <h2>${esc(n.rules.h2)}</h2>
${n.rules.items.map(([h, p]) => `        <h3>${esc(h)}</h3>\n        <p>${esc(p)}</p>`).join('\n')}
      </section>

      <section class="section tone-orange" id="categories">
        <h2>${esc(n.catsSec.h2)}</h2>
        <p>${esc(n.catsSec.p1)}</p>
        <ul>
${[0, 2, 6, 7, 8].map((i) => `          <li>${esc(n.cats10[i])}</li>`).join('\n')}
        </ul>
        <p>${esc(n.catsSec.p2)}</p>
      </section>

      <section class="section faq tone-purple" id="faq">
        <h2>${esc(n.faq.h2)}</h2>
${n.faq.qa.map(([q, a]) => `        <h3>${esc(q)}</h3>\n        <p>${esc(a)}</p>`).join('\n')}
      </section>

${ctaBlock(c, n.cta, tag)}

${guides(l, c, 'n3')}
    </div>
  </div>
</article>
</main>

${foot(l, c, tag)}
${n3Script(l)}
${faqLd(n.faq.qa)}
${CF}`;
}

const written = [];
for (const l of LANGS) {
  for (const [g, fn] of [['blag', blagPage], ['n3', n3Page]]) {
    const rel = `${l}/${D[l][g].slug}/index.html`;
    fs.mkdirSync(path.dirname(path.join(ROOT, rel)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, rel), fn(l));
    written.push(rel);
  }
}

// English pages: hreflang set after the canonical, language row after the hero.
const MARK = '<!-- launch-116 hreflang -->';
for (const g of ['blag', 'n3']) {
  const rel = EN[g].slice(1) + 'index.html';
  let h = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (!h.includes(MARK)) {
    const canon = `  <link rel="canonical" href="${SITE}${EN[g]}">\n`;
    if (!h.includes(canon)) throw new Error(`${rel}: canonical not found`);
    h = h.replace(canon, canon + hreflangs(g) + '\n  ' + MARK + '\n');
    const heroEnd = '    </header>\n  </div>\n';
    if (h.split(heroEnd).length !== 2) throw new Error(`${rel}: hero end not unique`);
    h = h.replace(heroEnd, heroEnd + ilang(g, 'en', 'Language') + '\n');
    fs.writeFileSync(path.join(ROOT, rel), h);
  }
  written.push(rel + ' (patched)');
}

// Language hubs: a "new in the app" pair of tiles before the closing box.
const HMARK = '<!-- launch-116 hub tiles -->';
for (const l of LANGS) {
  const rel = `${l}/index.html`;
  let h = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  if (h.includes(HMARK)) continue;
  const at = '      <div class="cta-block">';
  if (h.split(at).length !== 2) throw new Error(`${rel}: cta-block not unique`);
  const hub = D[l].hub;
  const block = `      ${HMARK}
      <section class="section tone-pink" id="${hub.id}">
        <h2>${esc(hub.h2)}</h2>
        <ul class="game-tiles">
          <li><a class="tile-blag" href="/${l}/${D[l].blag.slug}/"><span class="game-tile-art" aria-hidden="true">🤥</span><span class="game-tile-text"><strong>Blag</strong><span>${esc(hub.blag)}</span></span></a></li>
          <li><a class="tile-odds" href="/${l}/${D[l].n3.slug}/"><span class="game-tile-art" aria-hidden="true">⏱️</span><span class="game-tile-text"><strong>${esc(D[l].n3.name)}</strong><span>${esc(hub.n3)}</span></span></a></li>
        </ul>
      </section>

`;
  h = h.replace(at, block + at);
  fs.writeFileSync(path.join(ROOT, rel), h);
  written.push(rel + ' (patched)');
}

// Sitemap: one entry per new page, after the English pair.
let sm = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const today = '2026-11-13';
const anchor = `  <url><loc>${SITE}/blag-game/</loc><lastmod>`;
const line = sm.split('\n').find((x) => x.startsWith(anchor));
if (!line) throw new Error('sitemap: blag-game entry not found');
const adds = [];
for (const l of LANGS) for (const g of ['blag', 'n3']) {
  const loc = `${SITE}${url(g, l)}`;
  if (!sm.includes(`<loc>${loc}</loc>`)) adds.push(`  <url><loc>${loc}</loc><lastmod>${today}</lastmod></url>`);
}
if (adds.length) sm = sm.replace(line, line + '\n' + adds.join('\n'));
sm = sm.replace(/(<loc>https:\/\/anticsapp\.com\/(blag-game|name-3-game)\/<\/loc><lastmod>)[0-9-]+/g, `$1${today}`);
for (const l of LANGS) sm = sm.replace(new RegExp(`(<loc>https://anticsapp\\.com/${l}/</loc><lastmod>)[0-9-]+`), `$1${today}`);
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sm);
written.push('sitemap.xml (patched)');

// Every inline script on every page touched passes node --check (7 Sep 2026 law).
const tmp = fs.mkdtempSync('/private/tmp/launch116-check-');
let n = 0;
for (const w of written) {
  const rel = w.replace(/ \(patched\)$/, '');
  if (!rel.endsWith('.html')) continue;
  const h = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  for (const m of h.matchAll(/<script(?![^>]*(?:application\/ld\+json|src=))[^>]*>([\s\S]*?)<\/script>/g)) {
    const f = path.join(tmp, `s${n++}.js`);
    fs.writeFileSync(f, m[1]);
    execFileSync('node', ['--check', f]);
  }
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
}
console.log(`wrote/patched ${written.length} files; node --check passed on ${n} inline scripts; JSON-LD parsed`);
console.log(written.join('\n'));
