#!/usr/bin/env node
// ---------------------------------------------------------------------------
// RENDER PARTY CHARTS (7 Oct 2026, lever 13 of the app repo's
// ops/research/organic-visibility-2026-10-05.md, the site half). Draws the
// press-ready chart images for /party-data/ from the page's own CSV:
//   party-data/charts/<slug>.png            1600 x 900  (landscape)
//   party-data/charts/<slug>-portrait.png   1080 x 1350 (portrait, 4:5)
//   party-data/charts/thumbs/<slug>.webp     800 x 450  (the on-page preview)
// and the /press/ page's wordmark files (see "press kit wordmark" below),
// then rewrites the "Download the charts" list between the markers
//   <!-- charts:start --> ... <!-- charts:end -->
// in party-data/index.html and press/index.html, so the file sizes printed on
// those pages always match the files. Run from anywhere:
//   source ~/.nvm/nvm.sh && node .tools/render-party-charts.mjs
// (--no-pages renders the images only and leaves both pages alone)
// sharp comes from the app repo's node_modules (~/Antics), as for the app
// repo's assets/source/og-cards.mjs; the site repo has no package.json.
//
// HOUSE LAW FOR THESE IMAGES (the house marketing rules of 5 Oct 2026):
//   - every figure is read from party-data/antics-party-data-2026-10.csv, the
//     file the page publishes, and is a SHARE, a RATIO or an INDEX. Never an
//     absolute count of parties, players, sessions, downloads or cards.
//   - the source and window are set into every image.
//   - brand only (the Antics team, no person named), no em or en dashes, no drink words, no
//     Spicy label (the card-time chart shows seven games and says so; the
//     page's table carries the full set).
// lawCheck() refuses any string that breaks these before anything is written.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(join(homedir(), 'Antics', 'package.json'));
const sharp = require('sharp');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CSV = join(ROOT, 'party-data', 'antics-party-data-2026-10.csv');
const OUT = join(ROOT, 'party-data', 'charts');
const PAGES = ['party-data/index.html', 'press/index.html'];

// Site tokens (css/site.css, css/data-page.css)
const C = {
  bg: '#0E0A1F', bgTop: '#150F2E', surface: '#150F2B',
  pink: '#FF2E7E', cyan: '#25E5FF', bar: '#6F6799',
  truth: '#1AA6C0', dare: '#FF2E7E',
  white: '#FFFFFF', text1: '#D8D3EE', text2: '#BDB6E0', text3: '#9C92C7',
  line: 'rgba(255,255,255,0.16)',
};
const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const PANGO_FONT = 'Helvetica Neue Bold';

// ------------------------------------------------------------------ the law
function lawCheck(s) {
  if (/[\u2014\u2013]/.test(s)) throw new Error(`dash in: ${s}`);
  if (/\b(drink|drinks|sip|shot|shots|chug|down it|pregame)\b/i.test(s)) throw new Error(`drink word in: ${s}`);
  if (/\b(school|classroom|kids)\b/i.test(s)) throw new Error(`banned audience word in: ${s}`);
  if (/\bspicy\b|18\+/i.test(s)) throw new Error(`Spicy or 18+ in: ${s}`);
  // absolute scale: a comma number, or 3+ digits, beside a scale noun
  if (/\b\d{1,3}(,\d{3})+\b/.test(s)) throw new Error(`comma number (a count?) in: ${s}`);
  if (/\b\d{3,}\s*(parties|party|players|sessions|downloads|installs|cards|games|groups|people)\b/i.test(s)) throw new Error(`absolute count in: ${s}`);
  return s;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ------------------------------------------------------------------ the data
function parseCsv(text) {
  const rows = [];
  for (const line of text.trim().split('\n')) {
    const cells = []; let cur = ''; let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    rows.push(cells);
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}
const DATA = parseCsv(readFileSync(CSV, 'utf8'));
function val(section, measure) {
  const row = DATA.find((r) => r.section === section && r.measure === measure);
  if (!row) throw new Error(`not in the CSV: ${section} / ${measure}`);
  const v = Number(row.value);
  if (!Number.isFinite(v)) throw new Error(`not a number: ${section} / ${measure}`);
  return v;
}
// Hours a start_time block covers, from the CSV's definition column ("7 hour block")
function blockHours(measure) {
  const row = DATA.find((r) => r.section === 'start_time' && r.measure === measure);
  const m = row && /(\d+) hour block/.exec(row.definition);
  if (!m) throw new Error(`no hour block in the definition of: ${measure}`);
  return Number(m[1]);
}
// Refuse any row whose unit is not a share, ratio, index or median time
for (const r of DATA) {
  if (!/^(%|index|times|median seconds)/.test(r.unit)) throw new Error(`unexpected unit in CSV: ${r.unit}`);
}

// ------------------------------------------------------------------ text
const widthCache = new Map();
async function measure(text, size) {
  const key = `${size}|${text}`;
  if (widthCache.has(key)) return widthCache.get(key);
  const { width } = await sharp({ text: { text: esc(text), font: `${PANGO_FONT} ${size}`, dpi: 72 } }).metadata();
  widthCache.set(key, width);
  return width;
}
async function wrap(text, size, maxW) {
  const words = text.split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && (await measure(next, size)) > maxW) { lines.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}
// Same line count, narrowest measure: no one-word last line on a headline
async function balance(text, size, maxW) {
  const lines = await wrap(text, size, maxW);
  if (lines.length < 2) return lines;
  let best = lines;
  for (let w = maxW - 10; w > maxW / 2; w -= 10) {
    const next = await wrap(text, size, w);
    if (next.length !== lines.length) break;
    best = next;
  }
  return best;
}
const t = (x, y, size, fill, text, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-weight="700" font-size="${size}" fill="${fill}" ${extra}>${esc(text)}</text>`;

// ------------------------------------------------------------------ chart kinds
// Vertical bars. rows: [{ label: [line, line?], v, key, per? }]
// per: a small second line under the value ("an hour"), so a bar that averages
// a longer stretch never reads as a bare share when the image is cropped.
async function vbars(box, rows, s, fmt, ref) {
  const { x, y, w, h } = box;
  const labelH = s.label * 1.25 * 2 + 14;
  const perH = s.label + 6;
  const valueH = s.value + 14 + (rows.some((r) => r.per) ? perH : 0) + (ref ? s.label + 24 : 0);
  let key = '';
  if (ref) {
    const lw = await measure(ref.label, s.label);
    const kx = x + w - lw - 56;
    key = `<line x1="${kx}" x2="${kx + 40}" y1="${y + s.label * 0.62}" y2="${y + s.label * 0.62}" stroke="${C.text1}" stroke-opacity="0.8" stroke-width="2" stroke-dasharray="8 8"/>` +
      t(kx + 56, y + s.label, s.label, C.text1, ref.label);
  }
  const base = y + h - labelH;
  const top = y + valueH;
  const max = Math.max(...rows.map((r) => r.v), ref ? ref.v : 0);
  const slot = w / rows.length;
  const bw = Math.min(slot * 0.62, 120);
  let out = '';
  if (ref) {
    // the reference line sits under the bars; its key sits top right
    const ry = base - ((base - top) * ref.v) / max;
    out += `<line x1="${x}" x2="${x + w}" y1="${ry.toFixed(1)}" y2="${ry.toFixed(1)}" stroke="${C.text1}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="8 8"/>`;
  }
  const knock = `stroke="#120C27" stroke-width="10" stroke-linejoin="round" paint-order="stroke"`;
  rows.forEach((r, i) => {
    const cx = x + slot * i + slot / 2;
    const bh = Math.max(4, ((base - top) * r.v) / max);
    out += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${(base - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="8" fill="${r.key ? C.pink : C.bar}"/>`;
    out += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${(base - Math.min(bh, 8)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.min(bh, 8).toFixed(1)}" fill="${r.key ? C.pink : C.bar}"/>`;
    const vy = base - bh - 14 - (r.per ? perH : 0);
    out += t(cx.toFixed(1), vy.toFixed(1), s.value, r.key ? C.white : C.text2, fmt(r.v), `text-anchor="middle" ${knock}`);
    if (r.per) out += t(cx.toFixed(1), (vy + perH).toFixed(1), s.label, r.key ? C.white : C.text3, lawCheck(r.per), `text-anchor="middle" ${knock}`);
    r.label.forEach((ln, j) => {
      out += t(cx.toFixed(1), (base + 14 + s.label * (j + 1) * 1.2).toFixed(1), s.label, r.key ? C.white : C.text2, ln, 'text-anchor="middle"');
    });
  });
  out += `<rect x="${x}" y="${base}" width="${w}" height="2" fill="${C.line}"/>`;
  return key + out;
}

// Horizontal bars. rows: [{ label, v, key }]
async function hbars(box, rows, s, fmt) {
  const { x, y, w, h } = box;
  let lw = 0;
  for (const r of rows) lw = Math.max(lw, await measure(r.label, s.label));
  lw += 28;
  let vw = 0;
  for (const r of rows) vw = Math.max(vw, await measure(fmt(r.v), s.value));
  vw += 20;
  const max = Math.max(...rows.map((r) => r.v));
  const rh = h / rows.length;
  const bh = Math.min(rh * 0.6, 50);
  const bx = x + lw;
  const bmax = w - lw - vw;
  let out = '';
  rows.forEach((r, i) => {
    const cy = y + rh * i + rh / 2;
    const len = Math.max(6, (bmax * r.v) / max);
    out += t(x, (cy + s.label * 0.36).toFixed(1), s.label, r.key ? C.white : C.text1, r.label);
    out += `<rect x="${bx}" y="${(cy - bh / 2).toFixed(1)}" width="${len.toFixed(1)}" height="${bh.toFixed(1)}" rx="8" fill="${r.key ? C.pink : C.bar}"/>`;
    out += `<rect x="${bx}" y="${(cy - bh / 2).toFixed(1)}" width="8" height="${bh.toFixed(1)}" fill="${r.key ? C.pink : C.bar}"/>`;
    out += t((bx + len + 16).toFixed(1), (cy + s.value * 0.36).toFixed(1), s.value, r.key ? C.white : C.text2, fmt(r.v));
  });
  return out;
}

// 100% split bars, truth then dare. rows: [{ label, truth }]
async function splits(box, rows, s) {
  const { x, y, w, h } = box;
  const legendH = s.label + 22;
  const rh = (h - legendH) / rows.length;
  const bh = Math.min(rh - s.label * 1.5 - 10, 60);
  let out = '';
  // legend, top right
  const lt = await measure('Truth', s.label); const ld = await measure('Dare', s.label);
  const sq = s.label * 0.8;
  let lx = x + w - (sq + 10 + ld) - 32 - (sq + 10 + lt);
  out += `<rect x="${lx}" y="${y + 4}" width="${sq}" height="${sq}" rx="4" fill="${C.truth}"/>` + t(lx + sq + 10, y + sq + 2, s.label, C.text1, 'Truth');
  lx += sq + 10 + lt + 32;
  out += `<rect x="${lx}" y="${y + 4}" width="${sq}" height="${sq}" rx="4" fill="${C.dare}"/>` + t(lx + sq + 10, y + sq + 2, s.label, C.text1, 'Dare');
  rows.forEach((r, i) => {
    const ty = y + legendH + rh * i;
    out += t(x, (ty + s.label).toFixed(1), s.label, C.text1, r.label);
    const by = ty + s.label * 1.5;
    const tw = (w * r.truth) / 100;
    out += `<rect x="${x}" y="${by.toFixed(1)}" width="${w}" height="${bh.toFixed(1)}" rx="8" fill="${C.dare}"/>`;
    out += `<rect x="${x}" y="${by.toFixed(1)}" width="${tw.toFixed(1)}" height="${bh.toFixed(1)}" rx="8" fill="${C.truth}"/>`;
    out += `<rect x="${(x + tw - 8).toFixed(1)}" y="${by.toFixed(1)}" width="8" height="${bh.toFixed(1)}" fill="${C.truth}"/>`;
    out += `<rect x="${(x + tw - 1.5).toFixed(1)}" y="${by.toFixed(1)}" width="3" height="${bh.toFixed(1)}" fill="${C.bg}"/>`;
    const my = (by + bh / 2 + s.value * 0.36).toFixed(1);
    out += t(x + 18, my, s.value, C.bg, `${r.truth}% truth`);
    out += t(x + w - 18, my, s.value, C.bg, `${100 - r.truth}% dare`, 'text-anchor="end"');
  });
  return out;
}

// Grouped vertical bars, each group with its own dashed reference line
// (Halloween 2026, 7 Nov 2026). groups: [{ name, ref, refLabel, rows: [{ label, v, key }] }]
// The key (top right) names the reference line; each group's own reference
// value is printed under its name, so a cropped image still carries it.
async function gbars(box, groups, s, fmt, refKey) {
  const { x, y, w, h } = box;
  const gap = Math.round(w * 0.06);
  const labelH = s.label * 1.25 + 14 + s.group * 1.5 + s.label * 1.4;
  const valueH = s.value + 14 + s.label + 24;
  const lw = await measure(refKey, s.label);
  const kx = x + w - lw - 56;
  let out = `<line x1="${kx}" x2="${kx + 40}" y1="${y + s.label * 0.62}" y2="${y + s.label * 0.62}" stroke="${C.text1}" stroke-opacity="0.8" stroke-width="2" stroke-dasharray="8 8"/>` +
    t(kx + 56, y + s.label, s.label, C.text1, lawCheck(refKey));
  const base = y + h - labelH;
  const top = y + valueH;
  const max = Math.max(...groups.flatMap((g) => [g.ref, ...g.rows.map((r) => r.v)]));
  const gw = (w - gap * (groups.length - 1)) / groups.length;
  const knock = `stroke="#120C27" stroke-width="10" stroke-linejoin="round" paint-order="stroke"`;
  groups.forEach((g, gi) => {
    const gx = x + gi * (gw + gap);
    const slot = gw / g.rows.length;
    const bw = Math.min(slot * 0.62, 120);
    // the reference line first: bars sit over it and the values' knockout masks it
    const ry = base - ((base - top) * g.ref) / max;
    out += `<line x1="${gx.toFixed(1)}" x2="${(gx + gw).toFixed(1)}" y1="${ry.toFixed(1)}" y2="${ry.toFixed(1)}" stroke="${C.text1}" stroke-opacity="0.75" stroke-width="2.5" stroke-dasharray="8 8"/>`;
    g.rows.forEach((r, i) => {
      const cx = gx + slot * i + slot / 2;
      const bh = Math.max(4, ((base - top) * r.v) / max);
      out += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${(base - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="8" fill="${r.key ? C.pink : C.bar}"/>`;
      out += `<rect x="${(cx - bw / 2).toFixed(1)}" y="${(base - Math.min(bh, 8)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.min(bh, 8).toFixed(1)}" fill="${r.key ? C.pink : C.bar}"/>`;
      // a value label the dashed line would run through sits just above the line instead
      let vy = base - bh - 14;
      if (ry > vy - s.value * 0.72 - 6 && ry < vy + 8) vy = ry - 12;
      out += t(cx.toFixed(1), vy.toFixed(1), s.value, r.key ? C.white : C.text2, fmt(r.v), `text-anchor="middle" ${knock}`);
      out += t(cx.toFixed(1), (base + 14 + s.label * 1.2).toFixed(1), s.label, r.key ? C.white : C.text2, lawCheck(r.label), 'text-anchor="middle"');
    });
    out += `<rect x="${gx.toFixed(1)}" y="${base}" width="${gw.toFixed(1)}" height="2" fill="${C.line}"/>`;
    const ny = base + 14 + s.label * 1.25 + 10 + s.group;
    out += t((gx + gw / 2).toFixed(1), ny.toFixed(1), s.group, C.white, lawCheck(g.name), 'text-anchor="middle"');
    out += t((gx + gw / 2).toFixed(1), (ny + s.label * 1.4).toFixed(1), s.label, C.text3, lawCheck(g.refLabel), 'text-anchor="middle"');
  });
  return out;
}

// ------------------------------------------------------------------ the frame
const FORMATS = {
  land: { W: 1600, H: 900, P: 110, word: 28, kick: 19, head: 62, headStep: 70, sub: 30, subStep: 40, cap: 19, note: 20, noteStep: 27, src: 22,
    bars: { value: 26, label: 22 }, hb: { label: 27, value: 26 }, sp: { label: 24, value: 25 },
    gb: { value: 28, label: 22, group: 27 } },
  port: { W: 1080, H: 1350, P: 80, word: 28, kick: 18, head: 62, headStep: 70, sub: 30, subStep: 40, cap: 18, note: 20, noteStep: 27, src: 21,
    bars: { value: 23, label: 20 }, hb: { label: 26, value: 25 }, sp: { label: 24, value: 25 },
    gb: { value: 24, label: 19, group: 24 } },
};

async function render(chart, fmtName) {
  const F = FORMATS[fmtName];
  const { W, H, P } = F;
  const inner = W - P - 90;            // right margin 90
  const head = await balance(lawCheck(chart.headline), F.head, inner);
  const sub = await wrap(lawCheck(chart.sub), F.sub, inner);
  const notes = await wrap(lawCheck(chart.note), F.note, inner);
  const source = lawCheck(`Source: Antics party data, ${chart.sourceUrl || 'anticsapp.com/party-data'}, ${chart.window}`);
  let svg = '';
  // wordmark and kicker
  let y = fmtName === 'land' ? 92 : 104;
  svg += `<text x="${P}" y="${y}" font-family="${FONT}" font-weight="700" font-size="${F.word}" letter-spacing="7"><tspan fill="${C.pink}">ANT</tspan><tspan fill="${C.white}">ICS</tspan></text>`;
  const kicker = lawCheck(`${chart.kicker || 'PARTY DATA'} · ${chart.window.toUpperCase()}`);
  if (fmtName === 'land') svg += t(W - 90, y, F.kick, C.text3, kicker, 'text-anchor="end" letter-spacing="3"');
  else { y += 46; svg += t(P, y, F.kick, C.text3, kicker, 'letter-spacing="3"'); }
  // headline
  y += fmtName === 'land' ? 96 : 92;
  head.forEach((ln, i) => { svg += t(P, y + i * F.headStep, F.head, C.white, ln); });
  y += (head.length - 1) * F.headStep;
  // standfirst
  y += 56;
  sub.forEach((ln, i) => { svg += t(P, y + i * F.subStep, F.sub, C.text1, ln); });
  y += (sub.length - 1) * F.subStep;
  // chart caption
  y += fmtName === 'land' ? 62 : 74;
  svg += t(P, y, F.cap, C.text3, lawCheck(chart.caption.toUpperCase()), 'letter-spacing="2.5"');
  // footer block (bottom up): source, then notes
  const srcY = H - (fmtName === 'land' ? 52 : 64);
  const noteTop = srcY - 46 - (notes.length - 1) * F.noteStep;
  // chart box
  const box = { x: P, y: y + 26, w: inner, h: noteTop - 66 - (y + 26) };
  if (box.h < 220) throw new Error(`${chart.slug} ${fmtName}: chart box only ${box.h}px tall`);
  svg += await chart.draw(box, F);
  notes.forEach((ln, i) => { svg += t(P, noteTop + i * F.noteStep, F.note, C.text3, ln); });
  svg += `<rect x="${P}" y="${srcY - 34}" width="${inner}" height="1" fill="${C.line}"/>`;
  svg += `<text x="${P}" y="${srcY}" font-family="${FONT}" font-weight="700" font-size="${F.src}" fill="${C.text1}">${esc(source)}</text>`;
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.bgTop}"/><stop offset="1" stop-color="${C.bg}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="14" height="${H}" fill="${C.pink}"/>
  ${svg}
</svg>`;
  return sharp(Buffer.from(doc)).png({ compressionLevel: 9, palette: true, quality: 100, effort: 10 }).toBuffer();
}

// ------------------------------------------------------------------ the charts
const WINDOW = '26 Aug to 4 Oct 2026';
const pct = (v) => `${v}%`;

const start = [
  ['5am to noon (UK time)', ['5am to', 'noon']],
  ['Noon to 6pm (UK time)', ['Noon to', '6pm']],
  ['6pm to 8pm (UK time)', ['6pm to', '8pm']],
  ['8pm to 9pm (UK time)', ['8pm']],
  ['9pm to 10pm (UK time)', ['9pm']],
  ['10pm to 11pm (UK time)', ['10pm']],
  ['11pm to midnight (UK time)', ['11pm']],
  ['Midnight to 5am (UK time)', ['Midnight', 'to 5am']],
].map(([m, label]) => ({ label, v: val('start_time', m), key: m.startsWith('9pm'), per: blockHours(m) > 1 ? 'an hour' : undefined }));
const peak = start.find((r) => r.key).v;
if (peak !== Math.max(...start.map((r) => r.v))) throw new Error('9pm is no longer the peak hour');

const nights = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  .map((d) => ({ label: [d.slice(0, 3)], v: val('night', `${d} night`), key: d === 'Saturday' }));
const satRatio = val('night', 'Saturday night against a Monday to Thursday night');

const perParty = [['One game', 'One game'], ['Two games', 'Two games'], ['Three games', 'Three games'], ['Four or more', 'Four or more games']]
  .map(([m, label]) => ({ label, v: val('games_per_party', m), key: m !== 'One game' }));
const switchShare = 100 - val('games_per_party', 'One game');
const fourPlus = val('games_per_party', 'Four or more');

const firstTruth = val('truth_or_dare', 'first pick is truth');
const dareAll = val('truth_or_dare', 'picks that are dare');
const tod = [
  { label: 'The first pick of a game', truth: firstTruth },
  { label: 'Every pick', truth: 100 - dareAll },
  { label: 'Long games: the first five picks', truth: 100 - val('truth_or_dare', 'dare share in first five picks of long games') },
  { label: 'Long games: after the twentieth pick', truth: 100 - val('truth_or_dare', 'dare share after the twentieth pick of long games') },
];

const dwellGames = ['Would You Rather', 'Truth or Dare', 'Most Likely To', 'Antics mode', 'The Four Kings', 'What Are The Odds', 'Never Have I Ever'];
const dwell = dwellGames.map((g) => ({ label: g, v: val('time_on_screen', g), key: g === 'Would You Rather' }));
const wyr = Math.round(val('time_on_screen', 'Would You Rather'));
const nhie = Math.round(val('time_on_screen', 'Never Have I Ever'));

const CHARTS = [
  {
    slug: 'party-start-time',
    title: '9pm is party o’clock',
    headline: '9pm is party o’clock',
    sub: `${Math.round(peak)}% of parties start between 9pm and 10pm, UK time: the busiest hour of the day.`,
    caption: 'Share of parties starting per hour, UK time',
    note: 'Longer stretches are shown per hour so they compare fairly with single hours. A party is one session of the app with at least 10 cards read.',
    window: WINDOW,
    alt: `Bar chart of the share of parties starting in each hour, UK time. 9pm to 10pm is the busiest hour at ${peak}%, then 8pm to 9pm at ${val('start_time', '8pm to 9pm (UK time)')}% and 10pm to 11pm at ${val('start_time', '10pm to 11pm (UK time)')}%; before 6pm it is under 3% an hour. Source: Antics party data, ${WINDOW}.`,
    draw: (box, F) => vbars(box, start, F.bars, pct),
  },
  {
    slug: 'party-night-of-week',
    title: 'Saturday is the big night',
    headline: 'Saturday is the big night',
    sub: `A Saturday night gets ${satRatio} times as many parties as a Monday to Thursday night.`,
    caption: 'Parties per night, where an average night is 100',
    note: 'A night runs 5am to 5am UK time, so a party at 1am on Sunday counts as Saturday night. The window covers freshers fortnight at most UK universities.',
    window: WINDOW,
    alt: `Bar chart of parties per night of the week, where an average night is 100. Saturday is highest at ${val('night', 'Saturday night')}, then Sunday at ${val('night', 'Sunday night')} and Friday at ${val('night', 'Friday night')}; Tuesday is lowest at ${val('night', 'Tuesday night')}. A Saturday night gets ${satRatio} times as many parties as a Monday to Thursday night. Source: Antics party data, ${WINDOW}.`,
    draw: (box, F) => vbars(box, nights, F.bars, (v) => String(v), { v: 100, label: 'Average night = 100' }),
  },
  {
    slug: 'party-games-per-party',
    title: 'Three in four parties play more than one game',
    headline: 'Three in four parties play more than one game',
    sub: `${switchShare}% of parties switch game at least once, and a third (${fourPlus}%) play four games or more.`,
    caption: 'Share of parties by how many games they play',
    note: 'Percentages are rounded, so they may not add to 100. A party is one session of the app with at least 10 cards read.',
    window: WINDOW,
    alt: `Bar chart of how many games a party plays: one game ${perParty[0].v}%, two games ${perParty[1].v}%, three games ${perParty[2].v}%, four or more ${perParty[3].v}%. ${switchShare}% of parties play more than one game. Source: Antics party data, ${WINDOW}.`,
    draw: (box, F) => hbars(box, perParty, F.hb, pct),
  },
  {
    slug: 'party-truth-or-dare',
    title: 'Truth goes first. Dare catches up',
    headline: 'Truth goes first. Dare catches up',
    sub: `${firstTruth}% of Truth or Dare games open with a truth, but ${dareAll}% of all picks are dares.`,
    caption: 'Truth or dare: what groups pick',
    note: 'A long game ran past 20 picks, and each game counts equally. In the app, Truth sits above Dare, which may nudge the first tap.',
    window: WINDOW,
    alt: `Split bar chart of truth against dare. The first pick of a game is ${tod[0].truth}% truth; across every pick ${dareAll}% are dares; in long games dares rise from ${100 - tod[2].truth}% of the first five picks to ${100 - tod[3].truth}% after the twentieth. Source: Antics party data, ${WINDOW}.`,
    draw: (box, F) => splits(box, tod, F.sp),
  },
  {
    slug: 'party-card-time',
    title: 'Would You Rather holds the room longest',
    headline: 'Would You Rather holds the room longest',
    sub: `A Would You Rather card stays up for about ${wyr} seconds. A Never Have I Ever card: about ${nhie}.`,
    caption: 'Typical (median) seconds a card stays on screen',
    note: 'Seven games shown; the full table is at anticsapp.com/party-data. Imposter deals rounds, not cards. Cards left up while the phone was in another app are left out.',
    window: '6 Sep to 4 Oct 2026',
    alt: `Bar chart of the median seconds a card stays on screen, by game: Would You Rather ${val('time_on_screen', 'Would You Rather')}, Truth or Dare ${val('time_on_screen', 'Truth or Dare')}, Most Likely To ${val('time_on_screen', 'Most Likely To')}, Antics mode ${val('time_on_screen', 'Antics mode')}, The Four Kings ${val('time_on_screen', 'The Four Kings')}, What Are The Odds ${val('time_on_screen', 'What Are The Odds')}, Never Have I Ever ${val('time_on_screen', 'Never Have I Ever')}. Source: Antics party data, 6 Sep to 4 Oct 2026.`,
    draw: (box, F) => hbars(box, dwell, F.hb, (v) => `${v.toFixed(1)} s`),
  },
];

// ------------------------------------------------------------------ the sets
// --set=halloween-2026 (7 Nov 2026) draws the Halloween 2026 release's chart
// from ITS CSV (party-data/halloween-2026/antics-halloween-data-2026.csv) into
// party-data/halloween-2026/charts/, rewrites only that page's charts list, and
// leaves the first release's charts, its two pages and the press wordmarks
// alone. With no --set the script does exactly what it did before.
const SET = (process.argv.find((a) => a.startsWith('--set=')) || '--set=main').slice(6);
const SETS = { main: { charts: CHARTS, out: OUT, base: '/party-data/charts', pages: PAGES } };
{
  const HDIR = join(ROOT, 'party-data', 'halloween-2026');
  const HCSV = join(HDIR, 'antics-halloween-data-2026.csv');
  if (existsSync(HCSV)) {
    const H = parseCsv(readFileSync(HCSV, 'utf8'));
    for (const r of H) if (!/^(%|times)/.test(r.unit)) throw new Error(`unexpected unit in the Halloween CSV: ${r.unit}`);
    const hv = (section, measure) => {
      const row = H.find((r) => r.section === section && r.measure === measure);
      if (!row) throw new Error(`not in the Halloween CSV: ${section} / ${measure}`);
      const v = Number(row.value);
      if (!Number.isFinite(v)) throw new Error(`not a number: ${section} / ${measure}`);
      return v;
    };
    const HW = '17 Oct to 1 Nov 2026';
    const stages = [['1st to 3rd Halloween card', '1st to 3rd'], ['4th to 8th Halloween card', '4th to 8th'], ['9th Halloween card or later', '9th or later']];
    const game = (g) => {
      const ref = hv('first_and_later', `${g}: everyday cards, same groups`);
      return { name: g, ref, refLabel: `Everyday cards: ${ref.toFixed(1)}%`,
        rows: stages.map(([m, label], i) => ({ label, v: hv('first_and_later', `${g}: a group's ${m}`), key: i === 2 })) };
    };
    const wear = [game('Never Have I Ever'), game('Most Likely To')];
    const f1 = (v) => `${v.toFixed(1)}%`;
    const [n, m] = wear;
    SETS['halloween-2026'] = {
      out: join(HDIR, 'charts'), base: '/party-data/halloween-2026/charts', pages: ['party-data/halloween-2026/index.html'],
      charts: [{
        slug: 'halloween-theme-wore-out',
        title: 'The theme wore out, not the cards',
        headline: 'The theme wore out, not the cards',
        sub: 'A group’s first three Halloween cards were skipped about as often as its everyday cards. From the ninth on, one in three.',
        caption: 'Halloween cards skipped, by how many the group had met in that game',
        note: 'Dashed line: everyday cards in the same groups’ games. A skip is a card on screen for under two seconds.',
        window: HW, kicker: 'HALLOWEEN PARTY DATA', sourceUrl: 'anticsapp.com/party-data/halloween-2026',
        alt: `Grouped bar chart of Halloween cards skipped by how many the group had met in that game. Never Have I Ever: ${f1(n.rows[0].v)} for the 1st to 3rd, ${f1(n.rows[1].v)} for the 4th to 8th, ${f1(n.rows[2].v)} from the 9th, against ${f1(n.ref)} for everyday cards in the same groups' games. Most Likely To: ${f1(m.rows[0].v)}, ${f1(m.rows[1].v)} and ${f1(m.rows[2].v)}, against ${f1(m.ref)} for everyday cards. Source: Antics party data, Halloween 2026, ${HW}.`,
        draw: (box, F) => gbars(box, wear, F.gb, f1, 'Everyday cards, same groups'),
      }],
    };
  }
}
const S = SETS[SET];
if (!S) throw new Error(`no such set: ${SET} (sets: ${Object.keys(SETS).join(', ')})`);

// ------------------------------------------------------------------ write
mkdirSync(join(S.out, 'thumbs'), { recursive: true });
const kb = (file) => `${Math.max(1, Math.round(statSync(file).size / 1024))} KB`;
const items = [];
for (const c of S.charts) {
  lawCheck(c.title); lawCheck(c.alt);
  const land = join(S.out, `${c.slug}.png`);
  const port = join(S.out, `${c.slug}-portrait.png`);
  const thumb = join(S.out, 'thumbs', `${c.slug}.webp`);
  const landBuf = await render(c, 'land');
  writeFileSync(land, landBuf);
  writeFileSync(port, await render(c, 'port'));
  await sharp(landBuf).resize(800, 450).webp({ quality: 82, effort: 6 }).toFile(thumb);
  items.push({ ...c, landKb: kb(land), portKb: kb(port) });
  console.log(`${c.slug}: ${kb(land)} landscape, ${kb(port)} portrait, ${kb(thumb)} thumb`);
}

// ------------------------------------------------------------------ press kit wordmark
// The /press/ page's logo files: the wordmark of the main share card
// (img/og-card.png, drawn by the app repo's assets/source/og-cards.mjs: white
// ANTICS, letter-spaced, over a pink rule) on its own, without the phone
// frame, whose home screen shows a tile the press kit does not carry.
//   press/antics-banner.png               2400 x 1260, on the brand background
//   press/antics-wordmark-white.png       2000 x 560, transparent, for dark pages
//   press/antics-wordmark-dark.png        2000 x 560, transparent, for light pages
if (SET === 'main') {
const PRESS = join(ROOT, 'press');
mkdirSync(PRESS, { recursive: true });
function wordmark(cx, base, size, ink) {
  const ls = Math.round(size * 0.09);
  // letter-spacing trails the last letter, so shift left by half of it to centre
  return `<text x="${cx - ls / 2}" y="${base}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${size}" letter-spacing="${ls}" fill="${ink}">ANTICS</text>` +
    `<rect x="${cx - size * 1.1}" y="${base + size * 0.24}" width="${size * 2.2}" height="${Math.round(size * 0.075)}" rx="${Math.round(size * 0.0375)}" fill="${C.pink}"/>`;
}
const banner = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1260" viewBox="0 0 2400 1260">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#211942"/><stop offset="0.5" stop-color="#181131"/><stop offset="0.9" stop-color="${C.bg}"/></linearGradient></defs>
  <rect width="2400" height="1260" fill="url(#g)"/>
  <circle cx="2220" cy="0" r="590" fill="${C.pink}" fill-opacity="0.075"/>
  <circle cx="300" cy="1120" r="344" fill="${C.cyan}" fill-opacity="0.06"/>
  ${wordmark(1200, 640, 300, C.white)}
  ${t(1200, 930, 76, C.text1, lawCheck('Pass-the-phone party games'), 'text-anchor="middle"')}
</svg>`;
await sharp(Buffer.from(banner)).png({ compressionLevel: 9, palette: true, quality: 100, effort: 10 }).toFile(join(PRESS, 'antics-banner.png'));
for (const [file, ink] of [['antics-wordmark-white.png', C.white], ['antics-wordmark-dark.png', C.bg]]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="560" viewBox="0 0 2000 560">${wordmark(1000, 330, 300, ink)}</svg>`;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(PRESS, file));
}
for (const f of ['antics-banner.png', 'antics-wordmark-white.png', 'antics-wordmark-dark.png']) console.log(`press/${f}: ${kb(join(PRESS, f))}`);
}

// ------------------------------------------------------------------ the list on the pages
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const html = (s) => esc(s).replace(/’/g, '&rsquo;');
const list = [
  '<ul class="chart-dl">',
  ...items.map((c) => [
    '            <li>',
    `              <a class="chart-dl-img" href="${S.base}/${c.slug}.png"><img src="${S.base}/thumbs/${c.slug}.webp" alt="${attr(c.alt)}" width="800" height="450" loading="lazy"></a>`,
    `              <strong>${html(c.title)}</strong>`,
    `              <a href="${S.base}/${c.slug}.png" download>Landscape PNG, 1600 x 900 (${c.landKb})</a>`,
    `              <a href="${S.base}/${c.slug}-portrait.png" download>Portrait PNG, 1080 x 1350 (${c.portKb})</a>`,
    '            </li>',
  ].join('\n')),
  '          </ul>',
].join('\n');
for (const rel of process.argv.includes('--no-pages') ? [] : S.pages) {
  const file = join(ROOT, rel);
  if (!existsSync(file)) { console.log(`skip ${rel} (not there)`); continue; }
  const src = readFileSync(file, 'utf8');
  const re = /(<!-- charts:start -->)[\s\S]*?(<!-- charts:end -->)/;
  if (!re.test(src)) throw new Error(`${rel}: no charts markers`);
  const next = src.replace(re, `$1\n          ${list}\n          $2`);
  if (next !== src) { writeFileSync(file, next); console.log(`updated ${rel}`); }
  else console.log(`unchanged ${rel}`);
}
