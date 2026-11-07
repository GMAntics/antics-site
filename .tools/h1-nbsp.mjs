// A24 (PAGES builder, 7 Nov 2026). Idempotent.
// Keep the game's name together in two H1s that otherwise split it ("Never Have I / Ever:"). Only the spaces inside the
// name become &nbsp;; no word, title, meta or structured data changes (search engines read a no-break space as a space).
import { apply } from './lib.mjs';
const FIX = {
  'never-have-i-ever-questions/index.html': ['Never Have I Ever:', 'Never&nbsp;Have&nbsp;I&nbsp;Ever:'],
  'de/ich-hab-noch-nie-fragen/index.html': ['Ich hab noch nie:', 'Ich&nbsp;hab&nbsp;noch&nbsp;nie:'],
};
const res = apply('h1-nbsp', (rel, s) => {
  const fix = FIX[rel]; if (!fix) return null;
  const m = s.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/); if (!m) return { note: 'no h1' };
  if (m[0].includes(fix[1])) return s;                         // already applied
  if (!m[0].includes(fix[0])) return { note: 'UNEXPECTED: h1 does not contain ' + fix[0] };
  return s.replace(m[0], m[0].replace(fix[0], fix[1]));
});
for (const n of res.notes) console.log('  ' + n);
