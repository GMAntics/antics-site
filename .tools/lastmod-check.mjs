#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LASTMOD CHECK (29 Oct 2026, SEO route item 8). Warns when a page's main
// content has changed but its <lastmod> in sitemap.xml has not caught up.
// It NEVER writes: not the sitemap, not a page, nothing. The date is a human
// call (a footer, nav or hreflang edit keeps its date on purpose, because a
// site-wide date churn is how Google learns to ignore lastmod), so this only
// prints and always exits 0.
//
//   node .tools/lastmod-check.mjs            one WARN line per stale URL
//   node .tools/lastmod-check.mjs --report   also a line for every URL: its
//                                            lastmod and the date its main
//                                            content last changed
//
// "Main content" is the text inside the page's <main> element, or its
// <article> when it has no <main> (most pages here use <article>), with
// every <nav>, <footer>, <script>, <style> and HTML comment taken out. What is
// compared: the visible text, the image alt text, and the path of every link
// (query strings and #fragments dropped, so a ?c= campaign tag is not a
// change). So a breadcrumb, a guides strip, the seasonal nav block, a footer
// link, hreflang or any other head tag never counts; a new sentence, a new
// body link or a changed heading does.
//
// When it changed: the newest commit on the first-parent line of HEAD (so a
// merge counts on the day it landed) whose copy of the page differs in main
// content from its first parent's, dated with the commit date (%cs). If the
// working tree copy already differs from HEAD, the date is today in London.
// A URL warns when that date is later than its lastmod. It also warns on a
// sitemap URL with no file, no lastmod, or a lastmod in the future.
// Reads the working tree's sitemap.xml (the one about to be pushed). Run from
// anywhere; the site root is this file's parent folder. No dependencies, no
// network. Content dealt by a script (a generator's card bank in /js/) is not
// seen: only the HTML.
// ---------------------------------------------------------------------------
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://anticsapp.com/';
const REPORT = process.argv.includes('--report');
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const git = (args) => execFileSync('git', ['-c', 'core.quotepath=off', ...args], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });

// ---- sitemap ---------------------------------------------------------------
const sitemapPath = join(ROOT, 'sitemap.xml');
if (!existsSync(sitemapPath)) { console.log('lastmod-check: no sitemap.xml at the site root, nothing to check'); process.exit(0); }
const urls = [...readFileSync(sitemapPath, 'utf8').matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, u]) => {
  const loc = (u.match(/<loc>\s*([^<]*?)\s*<\/loc>/) || [])[1] || '';
  const lastmod = (u.match(/<lastmod>\s*([^<]*?)\s*<\/lastmod>/) || [])[1] || '';
  let path = loc.startsWith(SITE) ? loc.slice(SITE.length) : null;
  if (path !== null && (path === '' || path.endsWith('/'))) path += 'index.html';
  return { loc, lastmod: lastmod.slice(0, 10), path };
});

// ---- main content signature ------------------------------------------------
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', ndash: '\u2013', mdash: '\u2014', rsaquo: '›', lsaquo: '‹', raquo: '»', laquo: '«', middot: '·', rarr: '→', larr: '←', times: '×', pound: '£', euro: '€', copy: '©', eacute: 'é' };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);

export function mainSignature(html) {
  if (!html) return '';
  const m = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i) || html.match(/<article\b[^>]*>([\s\S]*)<\/article>/i) || html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  let s = m ? m[1] : html;
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<(nav|footer)\b[\s\S]*?<\/\1\s*>/gi, ' ');
  const links = [...s.matchAll(/<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1/gi)].map(([, , h]) => decode(h).split('#')[0].split('?')[0]);
  const alts = [...s.matchAll(/<img\b[^>]*?\balt\s*=\s*(["'])(.*?)\1/gi)].map(([, , a]) => decode(a).trim()).filter(Boolean);
  const text = decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  return `${text}\u0001${links.join(' ')}\u0001${alts.join(' ')}`;
}

// ---- git: blobs in one batch call -------------------------------------------
function blobs(specs) {
  if (!specs.length) return [];
  const r = spawnSync('git', ['cat-file', '--batch'], { cwd: ROOT, input: specs.join('\n') + '\n', maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`git cat-file failed: ${r.stderr}`);
  const out = r.stdout; const res = []; let i = 0;
  for (let k = 0; k < specs.length; k++) {
    const nl = out.indexOf(10, i); const head = out.subarray(i, nl).toString('utf8'); i = nl + 1;
    if (/ missing$| ambiguous$/.test(head)) { res.push(null); continue; }
    const size = Number(head.split(' ')[2]);
    res.push(out.subarray(i, i + size).toString('utf8')); i += size + 1;
  }
  return res;
}

let inRepo = true;
try { git(['rev-parse', '--verify', '-q', 'HEAD']); } catch { inRepo = false; }

// First-parent history: path -> [{ c, p, date, subj }], newest first.
const history = new Map();
if (inRepo) {
  const log = git(['log', '--first-parent', '--diff-merges=first-parent', '--no-renames', '--name-only', '--format=%x00%H%x09%P%x09%cs%x09%s', 'HEAD']);
  for (const block of log.split('\0').slice(1)) {
    const [head, ...files] = block.split('\n');
    const [c, parents, date, ...subj] = head.split('\t');
    const p = parents.split(' ')[0] || null;
    for (const f of files) if (f) {
      if (!history.has(f)) history.set(f, []);
      history.get(f).push({ c, p, date, subj: subj.join('\t') });
    }
  }
}

// ---- when did each page's main content last change ---------------------------
const pages = urls.filter((u) => u.path && existsSync(join(ROOT, u.path)));
const headCopies = inRepo ? blobs(pages.map((u) => `HEAD:${u.path}`)) : pages.map(() => null);
const pending = [];
pages.forEach((u, k) => {
  const work = mainSignature(readFileSync(join(ROOT, u.path), 'utf8'));
  if (!inRepo || headCopies[k] === null || work !== mainSignature(headCopies[k])) { u.changed = TODAY; u.by = 'working tree (not committed)'; return; }
  u.queue = [...(history.get(u.path) || [])];
  pending.push(u);
});
// Walk back one commit per page per round, so each round is one git call.
let open = pending.filter((u) => u.queue.length);
while (open.length) {
  const specs = [];
  for (const u of open) { const h = u.queue[0]; specs.push(`${h.c}:${u.path}`, h.p ? `${h.p}:${u.path}` : `${h.c}:__no_parent__`); }
  const got = blobs(specs);
  open.forEach((u, k) => {
    const h = u.queue.shift();
    const now = got[2 * k]; const before = h.p ? got[2 * k + 1] : null;
    if (mainSignature(now) !== mainSignature(before)) { u.changed = h.date; u.by = `${h.c.slice(0, 7)} ${h.subj.slice(0, 70)}`; }
  });
  open = open.filter((u) => !u.changed && u.queue.length);
}

// ---- report --------------------------------------------------------------------
const warns = [];
const valid = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d);
for (const u of urls) {
  const name = u.path === null ? u.loc : '/' + u.path.replace(/index\.html$/, '');
  if (u.path === null) { warns.push(`WARN ${u.loc}: not an ${SITE} URL`); continue; }
  if (!existsSync(join(ROOT, u.path))) { warns.push(`WARN ${name}: in the sitemap but ${u.path} does not exist`); continue; }
  if (!valid(u.lastmod)) { warns.push(`WARN ${name}: no valid <lastmod> (read "${u.lastmod}")`); continue; }
  if (u.lastmod > TODAY) warns.push(`WARN ${name}: lastmod ${u.lastmod} is in the future (today ${TODAY})`);
  if (u.changed && u.changed > u.lastmod) warns.push(`WARN ${name}: main content changed ${u.changed} (${u.by}), sitemap lastmod still ${u.lastmod}`);
}
if (REPORT) {
  console.log(`lastmod-check --report (today ${TODAY}): lastmod | main content last changed | where`);
  for (const u of urls) {
    if (!u.path) continue;
    const name = '/' + u.path.replace(/index\.html$/, '');
    const flag = !u.changed ? '?' : u.changed > u.lastmod ? 'STALE' : u.changed < u.lastmod ? 'newer' : 'same';
    console.log(`${flag.padEnd(5)} ${u.lastmod || '----------'} | ${u.changed || 'unknown   '} | ${name} | ${u.by || ''}`);
  }
}
console.log(`lastmod-check: ${urls.length} sitemap URLs, ${warns.length} warning${warns.length === 1 ? '' : 's'} (read only, nothing rewritten; today ${TODAY})`);
for (const w of warns) console.log(w);
process.exit(0);
