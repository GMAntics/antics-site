// INTEGRATOR (7 Nov 2026): load /js/deal.js (the deal-in and the closing-box bar tuck) on every page that has a
// .tier-card, a .cta-block or the .installbar. Idempotent: a second run prints "0 changed".
// The tag goes in <head>, on its own line straight after the site.css link and any font preloads that follow it
// (fonts are fetched first; defer runs it after parsing, so the head placement only starts the download early).
// Never /j/ (another session's page) and never the tool folder; /play/ and the home page carry none of the classes.
import { apply } from './lib.mjs';
const TAG = '<script src="/js/deal.js" defer></script>';
const HAS = /class="[^"]*\b(tier-card|cta-block|installbar)\b/;
const AFTER = /^([ \t]*)<link rel="stylesheet" href="\/css\/site\.css">[ \t]*\r?\n(?:[ \t]*<link rel="preload" href="\/fonts\/[^"]+" as="font"[^>]*>[ \t]*\r?\n)*/m;
const res = apply('deal-js-tag', (rel, s) => {
  if (rel.startsWith('j/') || rel.startsWith('.tools/')) return null;
  if (!HAS.test(s)) return null;
  if (s.includes(TAG)) return s;
  const m = s.match(AFTER);
  if (!m) return { note: 'UNEXPECTED: no /css/site.css link, left alone' };
  return s.slice(0, m.index + m[0].length) + m[1] + TAG + '\n' + s.slice(m.index + m[0].length);
}, { includeSkipped: true });
for (const n of res.notes) console.log('  ' + n);
