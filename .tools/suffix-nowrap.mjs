// Suffix nowrap (8 Nov 2026). Idempotent: a second run prints "0 changed".
// Polish cards write both genders as a word plus a bracketed suffix, "rzygałem(-am)". The browser may break a line after
// the hyphen, leaving "rzygałem(-" at the end of one line and "am)" on the next. Guy was told on 7 Nov 2026 this would be
// fixed WITHOUT CHANGING A WORD OR A CHARACTER (no U+2011 swap, no rewording: that is a content ruling he has not given).
// So each form is wrapped in <span class="nw">...</span> (.nw { white-space: nowrap } in css/site.css, section 2) and the
// page's text bytes stay identical. js/generator.js does the same for the cards it deals, with DOM nodes.
// Scope: visible text in <body> only. Never inside a tag or attribute, a comment, <script> (JSON-LD included), <style>,
// <title> or <textarea>. The form: letters, "(-", letters, ")" (FORM below, the same class js/generator.js uses).
// Re-running first unwraps every existing nw span around exactly one form, then wraps again, so the output is fixed.
// Scan of 8 Nov 2026: 109 forms, all in pl/pytania-nigdy-przenigdy/index.html; no other page and no other language.
// Spanish slash forms (8 Nov 2026, the same fix): Spanish cards write both genders as "soltero/a", and the browser may break
// after the slash. The second alternative of FORM is a word, "/", then a one or two letter ending ("/a", "/as") that is not
// followed by another letter or slash, and the word must not follow a letter, ".", "/" or ":", so a link in visible text
// ("anticsapp.com/j") is never wrapped. Scan of 8 Nov 2026: 13 forms on four es/ question pages, none anywhere else. The
// Polish alternative is unchanged, so the Polish page comes out byte for byte as before.
import { apply } from './lib.mjs';
const L = 'A-Za-z\\u00C0-\\u024F';                      // Latin letters incl. Latin-1 and Extended-A/B (ą ę ł ś ż č ř ...)
const BODY = `[${L}]+(?:\\(-[${L}]+\\)|/[${L}]{1,2})`;     // what an nw span holds: one form of either kind
const FORM = new RegExp(`[${L}]+\\(-[${L}]+\\)|(?<![${L}./:])[${L}]+/[${L}]{1,2}(?![${L}/])`, 'g');
const WRAPPED = new RegExp(`<span class="nw">(${BODY})</span>`, 'g');
const ANY_FORM = /\p{L}\(\s*-\s*\p{L}|(?<![\p{L}./:])\p{L}+\/\p{L}{1,2}(?![\p{L}/])/u; // cross-check: a form FORM would miss (another script, a space)
const SKIP = /<!--[\s\S]*?-->|<(script|style|title|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>|<[^>]*>/g;

function wrapText(t) { return t.replace(FORM, (m) => `<span class="nw">${m}</span>`); }

const counts = [];
apply('suffix-nowrap', (rel, s) => {
  const b = s.search(/<body\b/);
  if (b < 0 || !FORM.test(s.slice(b)) && !ANY_FORM.test(s.slice(b)) && !s.includes('<span class="nw">')) { FORM.lastIndex = 0; return null; }
  FORM.lastIndex = 0;
  const head = s.slice(0, b), body = s.slice(b).replace(WRAPPED, '$1');    // unwrap, then wrap: idempotent
  let out = '', last = 0, m, n = 0;
  SKIP.lastIndex = 0;
  while ((m = SKIP.exec(body))) {
    const text = body.slice(last, m.index);
    const w = wrapText(text); n += (w.length - text.length) / '<span class="nw"></span>'.length;
    out += w + m[0]; last = SKIP.lastIndex;
  }
  const tail = body.slice(last); const wt = wrapText(tail); n += (wt.length - tail.length) / '<span class="nw"></span>'.length;
  out = head + out + wt;
  const left = out.replace(WRAPPED, '').replace(SKIP, ' ');
  counts.push(`${rel}: ${n} form(s) in visible text` + (ANY_FORM.test(left) ? '; UNEXPECTED: a gender form FORM does not match is left unwrapped' : ''));
  return out;
});
for (const c of counts) console.log('  ' + c);
