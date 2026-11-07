#!/usr/bin/env node
// Gate for the home page redesign (design/deal-home, 7 Nov 2026): diff what
// search and visitors read in index.html against origin/main, and print EVERY
// difference. Nothing is judged here; the builder's notes list which
// differences are intentional, and anything else is a bug.
//
// Compared:
//   - <title>, every <meta name|property>, the canonical, every hreflang link
//   - every JSON-LD block (parsed, compared as data)
//   - every href in the document, as a multiset (a link that appears twice
//     and now once is reported)
//   - img alt text
//   - visible text, as a multiset of sentences: the text of each block
//     element (inline tags merged), split after . ? ! so moving a block or
//     changing <strong> to <h3> is not a difference, but any added, removed
//     or reworded sentence is (case-sensitive)
//   - heading texts (h1 to h6) in order, case-sensitive
//
// Run from the site worktree: node .tools/home-diff-vs-main.mjs [ref]
// (ref defaults to origin/main). Exit 0 always; read the output.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ref = process.argv[2] || 'origin/main';
const before = execFileSync('git', ['-C', SITE, 'show', `${ref}:index.html`], { encoding: 'utf8' });
const after = fs.readFileSync(path.join(SITE, 'index.html'), 'utf8');

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', nbsp: ' ', middot: '·', rarr: '→', hellip: '…' };
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => (n in ENT ? ENT[n] : m))
  .replace(/ /g, ' ');
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i')); return m ? decode(m[2] ?? m[3]) : null; };

function read(html) {
  const head = html.slice(0, html.search(/<body[\s>]/i));
  const body = html.slice(html.search(/<body[\s>]/i));
  const out = {};
  out.title = decode((head.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
  out.meta = (head.match(/<meta\b[^>]*>/gi) || []).map((t) => `${attr(t, 'name') || attr(t, 'property') || attr(t, 'charset') && 'charset' || attr(t, 'http-equiv')} = ${attr(t, 'content') ?? attr(t, 'charset')}`).sort();
  out.canonical = (head.match(/<link\b[^>]*rel="canonical"[^>]*>/gi) || []).map((t) => attr(t, 'href'));
  out.hreflang = (head.match(/<link\b[^>]*hreflang=[^>]*>/gi) || []).map((t) => `${attr(t, 'hreflang')} ${attr(t, 'href')}`).sort();
  out.jsonld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => JSON.stringify(JSON.parse(m[1])));
  out.hrefs = [...html.matchAll(/\bhref\s*=\s*("([^"]*)"|'([^']*)')/gi)].map((m) => decode(m[2] ?? m[3]));
  out.alts = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => attr(m[0], 'alt'));
  const clean = body.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  out.headings = [...clean.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => `h${m[1]} ${decode(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()}`);
  // Block boundaries become newlines; inline tags vanish.
  const BLOCK = 'p|div|li|ul|ol|h[1-6]|section|nav|main|footer|header|form|button|label|input|br|table|tr|td|th|dl|dt|dd|details|summary|figure|figcaption|article|aside|select|option|textarea';
  const text = decode(clean.replace(new RegExp(`<\\/?(?:${BLOCK})\\b[^>]*>`, 'gi'), '\n').replace(/<[^>]+>/g, ''));
  out.sentences = text.split('\n').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
    .flatMap((s) => s.split(/(?<=[.?!])\s+/)).map((s) => s.trim()).filter(Boolean);
  return out;
}

function multiset(a, b) {
  const count = (xs) => xs.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  const A = count(a), B = count(b), lines = [];
  for (const k of new Set([...A.keys(), ...B.keys()])) {
    const d = (B.get(k) || 0) - (A.get(k) || 0);
    if (d) lines.push(`${d > 0 ? '+' : '-'}${Math.abs(d) > 1 ? Math.abs(d) + 'x ' : ' '}${k}`);
  }
  return lines.sort((x, y) => x.slice(1).localeCompare(y.slice(1)));
}

const A = read(before), B = read(after);
let diffs = 0;
function section(name, lines) {
  console.log(`\n== ${name}: ${lines.length ? lines.length + ' difference(s)' : 'identical'}`);
  for (const l of lines) console.log('  ' + l);
  diffs += lines.length;
}
section('title', A.title === B.title ? [] : [`- ${A.title}`, `+ ${B.title}`]);
section('meta', multiset(A.meta, B.meta));
section('canonical', multiset(A.canonical, B.canonical));
section('hreflang', multiset(A.hreflang, B.hreflang));
section('JSON-LD blocks', multiset(A.jsonld, B.jsonld));
section('hrefs (multiset)', multiset(A.hrefs, B.hrefs));
section('hrefs (set: a destination gone or new)', multiset([...new Set(A.hrefs)], [...new Set(B.hrefs)]));
section('img alt', multiset(A.alts, B.alts));
section('headings (multiset, case-sensitive)', multiset(A.headings, B.headings));
section('visible text (sentences, case-sensitive)', multiset(A.sentences, B.sentences));
console.log(`\n${diffs} difference line(s) against ${ref}.`);
