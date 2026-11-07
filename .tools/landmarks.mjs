// Review fixer, 7 Nov 2026 (findings A11Y-4 and P-7). Idempotent; runs straight after main-skip.mjs.
// main-skip.mjs made the whole page frame the <main>, so the skip link landed on a <main> that still began with the logo
// and breadcrumb (the next Tab after skipping was the logo link it should have jumped) and that ended with the site footer
// (which therefore was not a contentinfo landmark). This moves the breadcrumb out in front of <main> and, where the footer
// is the frame's last child, the footer out after it. Nothing is reworded, relinked or reordered: the breadcrumb was the
// first thing in the frame and stays first, the footer was the last and stays last. The skip target is still
// <main id="main" tabindex="-1">, so site.css's `main[tabindex="-1"]:focus { outline: none }` still applies.
//   A. the guide template (99 pages): <main class="page" id="main" tabindex="-1"><article>CRUMB ... FOOTER</article></main>
//      becomes <div class="page">CRUMB<main id="main" tabindex="-1"><article> ... </article></main>FOOTER</div>
//      (div.page is exactly the base file's frame again; <main> wraps only the article).
//   B. a <main> that sits inside div.page and starts with the breadcrumb (the 16 tool-layout pages, /support/): the
//      breadcrumb moves in front of <main>; a footer that is <main>'s last child (/support/) moves after it. On the tool
//      pages the footer lives inside .tool-body, a grid column, and stays there (moving it would widen it on desktop).
// No CSS depends on the crumb or footer being inside article or main (checked 7 Nov: only `.tool-layout > .crumb`, whose
// grid-column 1 / -1 is what a block above the grid gets anyway; the grid has no row gap, and the page-head is placed
// explicitly in row 2, so the empty row 1 is 0px tall).
import { apply } from './lib.mjs';
const CRUMB = '<nav class="crumb(?: [^"]*)?"[^>]*>[\\s\\S]*?<\\/nav>', FOOT = '<footer class="site-foot">[\\s\\S]*?<\\/footer>';
const A_OPEN = new RegExp('<main class="page" id="main" tabindex="-1">(\\s*)<article>(\\s*)(' + CRUMB + ')');
const A_CLOSE = new RegExp('(\\s*)(' + FOOT + ')(\\s*)<\\/article>(\\s*)<\\/main>');
const B_OPEN = new RegExp('(<div class="page">)(\\s*)(<main\\b[^>]*\\bid="main"[^>]*>)(\\s*)(' + CRUMB + ')');
const B_CLOSE = new RegExp('(\\s*)(' + FOOT + ')(\\s*)<\\/main>(\\s*)<\\/div>');
const count = (s, re) => (s.match(new RegExp(re.source, 'g')) || []).length;
const res = apply('landmarks', (rel, s) => {
  if (!/<main\b[^>]*\bid="main"/.test(s)) return null;
  let t = s;
  if (A_OPEN.test(t)) {
    if (count(t, A_OPEN) !== 1 || count(t, A_CLOSE) !== 1) return { note: 'UNEXPECTED: guide frame not found exactly once, left alone' };
    t = t.replace(A_OPEN, (m, w1, w2, crumb) => `<div class="page">${w1}  ${crumb}${w1}<main id="main" tabindex="-1">${w1}<article>`);
    t = t.replace(A_CLOSE, (m, w1, foot, w2, w3) => `${w2}</article>${w3}</main>${w1}${foot}${w3}</div>`);
  } else if (B_OPEN.test(t)) {
    if (count(t, B_OPEN) !== 1) return { note: 'UNEXPECTED: main+crumb found more than once, left alone' };
    t = t.replace(B_OPEN, (m, div, w1, main, w2, crumb) => `${div}${w2}${crumb}${w1}${main}`);
    // the footer moves out only when it is <main>'s own last child, directly before the frame closes
    const mains = count(t, B_CLOSE);
    if (mains === 1) t = t.replace(B_CLOSE, (m, w1, foot, w2, w3) => `${w2}</main>${w1}${foot}${w3}</div>`);
  } else return s;                                                  // already applied, or a shape this script does not own
  const crumbs = count(t, new RegExp(CRUMB)), mains = (t.match(/<main\b/g) || []).length;
  if (crumbs !== 1 || mains !== 1 || (t.match(/<\/main>/g) || []).length !== 1) return { note: 'UNEXPECTED: counts wrong after edit, left alone' };
  // the breadcrumb must now sit outside <main>
  if (t.indexOf(t.match(new RegExp(CRUMB))[0]) > t.search(/<main\b/)) return { note: 'UNEXPECTED: crumb still inside main, left alone' };
  return t;
});
for (const n of res.notes) console.log('  ' + n);
