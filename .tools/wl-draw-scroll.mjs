// A23 (PAGES builder, 7 Nov 2026). Idempotent.
// The word-list pages (7 languages) carry an inline "draw a word" widget. After the dealt word and its two hints are written,
// scroll the result into view ('nearest': no movement if it is already visible), so it is not left under the install bar
// (html scroll-padding-bottom from PLAN A3 keeps it clear of the bar). Guarded for browsers without scrollIntoView.
import { apply } from './lib.mjs';
const ANCHOR = "    if (w.hard) out.appendChild(line(w.hardLabel, w.hard));\n";
const ADD = "    if (out.scrollIntoView) out.scrollIntoView({ block: 'nearest' });\n";
const res = apply('wl-draw-scroll', (rel, s) => {
  if (!s.includes('wl-draw-out')) return null;
  if (s.includes("out.scrollIntoView")) return s;
  if (s.split(ANCHOR).length !== 2) return { note: 'UNEXPECTED: anchor line not found exactly once' };
  return s.replace(ANCHOR, ANCHOR + ADD);
});
for (const n of res.notes) console.log('  ' + n);
