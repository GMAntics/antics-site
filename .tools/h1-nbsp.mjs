// A24 (PAGES builder, 7 Nov 2026), revised by the review fixer the same night (findings P-5 and IT-10). Idempotent.
// Keep a game's name together in three H1s that otherwise split it ("Never Have I / Ever:", "Truth or / Dare generator").
// The name is wrapped in <span style="white-space:nowrap">, so the H1's text BYTES stay identical to main (the first
// version turned the spaces into &nbsp;, which changed the indexed bytes and which some exact-phrase matchers may not
// equate with a space). An inline span, not inline-block: it adds no accessibility object. The style is inline so the
// fix does not depend on a site.css rule. Measured 7 Nov: at 320px "Never Have I Ever:" is 282.6px in a 280px H1, so it
// runs 2.6px into the 20px gutter and the page does not scroll sideways; at 360px and up it fits.
// A page still carrying the first version's &nbsp; form is converted back to plain spaces inside the wrapper.
import { apply } from './lib.mjs';
const OPEN = '<span style="white-space:nowrap">', CLOSE = '</span>';
const FIX = {
  'never-have-i-ever-questions/index.html': 'Never Have I Ever:',
  'de/ich-hab-noch-nie-fragen/index.html': 'Ich hab noch nie:',
  'truth-or-dare-generator/index.html': 'Truth or Dare',
};
const res = apply('h1-nbsp', (rel, s) => {
  const name = FIX[rel]; if (!name) return null;
  const m = s.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/); if (!m) return { note: 'no h1' };
  const wrapped = OPEN + name + CLOSE, nbsp = name.replace(/ /g, '&nbsp;');
  if (m[0].includes(wrapped)) return s;                                   // already applied
  let h = m[0];
  if (h.includes(nbsp)) h = h.replace(nbsp, name);                         // undo the first version
  if (!h.includes(name)) return { note: 'UNEXPECTED: h1 does not contain ' + name };
  if (h.split(name).length !== 2) return { note: 'UNEXPECTED: ' + name + ' occurs more than once in the h1' };
  return s.replace(m[0], h.replace(name, wrapped));
});
for (const n of res.notes) console.log('  ' + n);
