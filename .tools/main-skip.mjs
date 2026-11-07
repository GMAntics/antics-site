// A25 (PAGES builder, 7 Nov 2026). Idempotent.
// 1. <div class="page"> becomes <main class="page" id="main" tabindex="-1"> and its MATCHING </div> becomes </main>
//    (matched with a quote- and script-aware tag walk, not a regex over the closing tag).
// 2. Pages that already have a <main> (the tool-layout template) get id="main" tabindex="-1" on it.
// 3. A skip link, text in the page's own language, is inserted as the first child of <body>.
// CSS for the link and for the tabindex target is in .tools/skip-link.css (the coordinator places it in site.css).
import { apply } from './lib.mjs';
// Three-word UI strings, no marketing copy. Keyed by the <html lang> value; fall back on the primary subtag.
const TEXT = { 'en': 'Skip to content', 'es': 'Saltar al contenido', 'pt-BR': 'Pular para o conteúdo', 'pt-PT': 'Saltar para o conteúdo', 'pt': 'Saltar para o conteúdo',
  'de': 'Zum Inhalt springen', 'fr': 'Passer au contenu', 'it': 'Vai al contenuto', 'nl': 'Ga naar de inhoud', 'pl': 'Przejdź do treści', 'cs': 'Přeskočit na obsah' };
const skipText = (lang) => TEXT[lang] || TEXT[lang.split('-')[0]];
const TAG = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
function matchingDivClose(s, from) {          // from = index just after the opening tag of the div; returns [start, end] of its </div>
  TAG.lastIndex = from; let depth = 1, m;
  while ((m = TAG.exec(s))) {
    if (m[3] !== 'div') continue;
    if (m[2] === '/') { depth--; if (!depth) return [m.index, TAG.lastIndex]; }
    else if (!/\/\s*$/.test(m[4])) depth++;
  }
  return null;
}
const OPEN = /<div class="page">/;
const res = apply('main-skip', (rel, s) => {
  // Scope: the guide template, i.e. pages that load /css/site.css (the .skip rule lives there) and wrap content in div.page or already have a <main>.
  if (!/href="\/css\/site\.css"/.test(s)) return null;
  const mains = (s.match(/<main\b/g) || []).length, o = OPEN.exec(s);
  if (!o && !mains) return null;
  const lang = (s.match(/<html[^>]*\blang="([^"]+)"/) || [])[1];
  if (!lang) return { note: 'no lang attribute, left alone' };
  const text = skipText(lang); if (!text) return { note: 'no skip text for lang ' + lang + ', left alone' };
  let t = s;
  if (mains === 1) {                                          // 2. an existing <main> keeps its element (even inside a div.page), gains the id
    if (!/<main\b[^>]*\bid="main"/.test(t)) t = t.replace(/<main\b([^>]*)>/, (m, a) => `<main${a} id="main" tabindex="-1">`);
  } else if (mains > 1) {
    return { note: 'UNEXPECTED: ' + mains + ' <main> elements, left alone' };
  } else {                                                    // 1. the div.page template: div -> main, matching close -> </main>
    const end = o.index + o[0].length, close = matchingDivClose(t, end);
    if (!close) return { note: 'UNMATCHED div.page, left alone' };
    t = t.slice(0, o.index) + '<main class="page" id="main" tabindex="-1">' + t.slice(end, close[0]) + '</main>' + t.slice(close[1]);
  }
  if (!/class="skip"/.test(t)) {                              // 3. the link, first child of body
    if (!/<body\b[^>]*>/.test(t)) return { note: 'no body tag, left alone' };
    t = t.replace(/(<body\b[^>]*>)/, `$1\n<a class="skip" href="#main">${text}</a>`);
  }
  if ((t.match(/<main\b/g) || []).length !== 1 || (t.match(/<\/main>/g) || []).length !== 1 || (t.match(/\bid="main"/g) || []).length !== 1) return { note: 'UNEXPECTED: main/id count wrong after edit, left alone' };
  return t;
});
for (const n of res.notes) console.log('  ' + n);
