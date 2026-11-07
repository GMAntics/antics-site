// Review fixer, 7 Nov 2026 (finding IT-14). Idempotent.
// On a narrow phone the breadcrumb wrapped with a lone "›" at the end of one line and its crumb on the next. .crumb is a
// flex row, so every child (link, separator span, bare text) is its own flex item and a no-break space between them glues
// nothing (measured at 360px: an &nbsp; became an extra flex item with its own 8px gap and still did not hold the pair).
// So each separator and the crumb after it go into one <span class="crumb-step">, with a no-break space between them:
//   <span aria-hidden="true">›</span> <a href="/x/">X</a>   ->   <span class="crumb-step"><span aria-hidden="true">›</span>&nbsp;<a href="/x/">X</a></span>
// The step wraps as one piece. No word, link, href or order changes; the home link stays the nav's first child, so the
// phone rule `.crumb a:first-child` (icon only) still hits only it. No CSS is needed (the span is a plain flex item).
import { apply } from './lib.mjs';
const NAV = /(<nav class="crumb(?: [^"]*)?"[^>]*>)([\s\S]*?)(<\/nav>)/;
const SEP = '<span aria-hidden="true">(?:›|&rsaquo;)<\\/span>';
const STEP = new RegExp('(\\s*)(' + SEP + ')\\s+(<a\\b[^>]*>[^<]*<\\/a>|[^<]+?)(?=\\s*<span aria-hidden="true">|\\s*$)', 'g');
const text = (h) => h.replace(/<[^>]*>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&rsaquo;/g, '›').replace(/\s+/g, ' ').trim();
const res = apply('crumb-glue', (rel, s) => {
  const m = s.match(NAV); if (!m) return null;
  if (m[2].includes('class="crumb-step"')) return s;                     // already applied
  const seps = (m[2].match(new RegExp(SEP, 'g')) || []).length; if (!seps) return s;
  let steps = 0;
  const inner = m[2].replace(STEP, (all, ws, sep, item) => { steps++; return `${ws}<span class="crumb-step">${sep}&nbsp;${item}</span>`; });
  if (steps !== seps) return { note: `UNEXPECTED: ${seps} separators but ${steps} steps matched, left alone` };
  if (text(inner) !== text(m[2])) return { note: 'UNEXPECTED: crumb text changed, left alone' };
  if ((inner.match(/href="[^"]*"/g) || []).join() !== (m[2].match(/href="[^"]*"/g) || []).join()) return { note: 'UNEXPECTED: links changed, left alone' };
  return s.replace(m[0], m[1] + inner + m[3]);
});
for (const n of res.notes) console.log('  ' + n);
