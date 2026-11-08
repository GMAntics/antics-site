#!/usr/bin/env python3
"""PAGES builder gates (7 Nov 2026). Compares every page in the working tree with the same page at --base (default origin/main).

For EVERY page that differs:
  1. visible text (tags, <script>, <style>, comments stripped; entities decoded; no-break space = space) is identical,
     apart from the skip link text and /drinking-games/'s hidden table caption (both whitelisted, named in the report);
  2. every JSON-LD block parses and is byte-identical;
  3. every href/src value is identical except: removed values must be the three Google font URLs, added values must be
     #main or /fonts/bricolage-800-*.woff2;
  4. every inline <script> is byte-identical, except the one-line addition on the 7 word-list pages (A23), and every inline
     script passes `node --check`;
  5. tag nesting is well formed in the new file (stack check, so a mis-paired </main> or </div> fails) and the sequence of tags
     in <body> is the old sequence with the skip link added and div.page renamed main;
  6. exactly one <main>, exactly one id="main", the skip link is the first element in <body>;
  7. (review fixer, 7 Nov) the breadcrumb sits before <main>, the h1 inside it, the site footer after it (tool-layout pages
     keep theirs inside .tool-body), every breadcrumb separator is glued to its crumb. Checks 5 and the pairing run on
     unfix(new), which undoes exactly the h1 nowrap span, the crumb steps and the landmark moves.
  8. (8 Nov 2026) .tools/suffix-nowrap.mjs's <span class="nw"> around a word and its bracketed suffix ("rzygałem(-am)") is
     unwrapped before checks 1 to 5, so text, links, scripts and the tag sequence are compared exactly as without it; nesting
     is still checked on the real file, and every nw span must hold exactly one such form and nothing else.
Usage: gates.py [--base REV]   (run from the worktree; needs git and node on PATH)
"""
import argparse, html, json, os, re, subprocess, sys, tempfile
from html.parser import HTMLParser

ap = argparse.ArgumentParser(); ap.add_argument('--base', default='origin/main'); args = ap.parse_args()
ROOT = subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()
os.chdir(ROOT)

SKIP_TEXTS = {'Skip to content', 'Saltar al contenido', 'Pular para o conteúdo', 'Zum Inhalt springen', 'Passer au contenu', 'Vai al contenuto',
              'Ga naar de inhoud', 'Przejdź do treści', 'Přeskočit na obsah'}
CAPTION = {'drinking-games/index.html': 'Drinking games at a glance'}
GOOGLE = {'https://fonts.googleapis.com', 'https://fonts.gstatic.com',
          'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap'}
ADDED_OK = {'#main', '/fonts/bricolage-800-latin.woff2', '/fonts/bricolage-800-latin-ext.woff2',
            '/js/deal.js'}   # integrator, 7 Nov 2026: .tools/deal-js-tag.mjs
# Polish round 2, DQA-3 (7 Nov 2026): .tools/head-font.mjs keeps the latin-ext preload only where the first phone
# screen needs it, so it may leave a page that had it.
REMOVED_OK = {'/fonts/bricolage-800-latin-ext.woff2'}
A23 = "    if (out.scrollIntoView) out.scrollIntoView({ block: 'nearest' });\n"
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
IMPLIED = {'p', 'li', 'td', 'th', 'tr', 'thead', 'tbody', 'tfoot', 'option', 'dt', 'dd', 'colgroup', 'caption'}

changed = [f for f in subprocess.check_output(['git', 'diff', '--name-only', args.base], text=True).split('\n') if f.endswith('.html')]
untracked = [f for f in subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], text=True).split('\n') if f.endswith('.html')]
pages = sorted(set(changed + untracked))
print(f'{len(pages)} html file(s) differ from {args.base}')

fails = []
def fail(p, msg): fails.append(f'{p}: {msg}')

def old(p):
    r = subprocess.run(['git', 'show', f'{args.base}:{p}'], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else None

def strip_tags(s):
    s = re.sub(r'<!--[\s\S]*?-->', '', s)
    s = re.sub(r'<(script|style)\b[^>]*>[\s\S]*?</\1\s*>', '', s)
    s = re.sub(r'<[^>]*>', ' ', s)
    s = html.unescape(s).replace(' ', ' ')
    return re.sub(r'\s+', ' ', s).strip()

def scripts(s):
    return [(m.group(1), m.group(2)) for m in re.finditer(r'<script\b([^>]*)>([\s\S]*?)</script>', s)]

def urls(s):
    return [m.group(2) for m in re.finditer(r'\b(href|src)="([^"]*)"', s)]

class Nest(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.st = []; self.bad = []; self.body = []; self.inbody = False; self.first_in_body = None
    def handle_starttag(self, t, a):
        a = dict(a)
        if t == 'body': self.inbody = True; return
        if self.inbody and self.first_in_body is None: self.first_in_body = (t, a.get('class'), a.get('href'))
        if t in VOID: return
        if self.inbody: self.body.append(t)
        self.st.append(t)
    def handle_endtag(self, t):
        if t in VOID or t in ('body', 'html'): return
        while self.st and self.st[-1] in IMPLIED and self.st[-1] != t: self.st.pop()
        if not self.st or self.st[-1] != t:
            self.bad.append((t, self.getpos(), self.st[-3:])); return
        self.st.pop()
        if self.inbody: self.body.append('/' + t)

def body_events(s):
    p = Nest(); p.feed(s); return p

# Review fixer, 7 Nov 2026: three structural edits that move or wrap tags without touching a word or a link
# (.tools/h1-nbsp.mjs's nowrap span, .tools/crumb-glue.mjs's crumb steps, .tools/landmarks.mjs's crumb/footer moves).
# unfix() undoes exactly those edits, so the body tag sequence and the div.page/main.page pairing are compared with the
# base precisely as before; text, links, JSON-LD and scripts are still compared on the REAL file, and landmarks() checks
# the new structure itself.
CRUMB_RE = r'<nav class="crumb(?: [^"]*)?"[^>]*>[\s\S]*?</nav>'
FOOT_RE = r'<footer class="site-foot">[\s\S]*?</footer>'
def unfix(s):
    s = re.sub(r'(<h1\b[^>]*>[^<]*)<span style="white-space:nowrap">([^<]*)</span>', r'\1\2', s)
    s = re.sub(r'<span class="crumb-step">(<span aria-hidden="true">(?:›|&rsaquo;)</span>)&nbsp;(<a\b[^>]*>[^<]*</a>|[^<]*?)</span>', r'\1 \2', s)
    m = re.search(r'<div class="page">(\s*)(' + CRUMB_RE + r')(\s*)<main id="main" tabindex="-1">(\s*)<article>', s)
    if m and re.search(r'</article>\s*</main>\s*' + FOOT_RE + r'\s*</div>', s):          # landmarks.mjs case A
        s = s[:m.start()] + '<main class="page" id="main" tabindex="-1">\n<article>\n' + m.group(2) + s[m.end():]
        s = re.sub(r'</article>(\s*)</main>(\s*)(' + FOOT_RE + r')(\s*)</div>', r'\3\n</article>\n</main>', s, count=1)
    else:                                                                                  # case B
        s = re.sub(r'(<div class="page">)(\s*)(' + CRUMB_RE + r')(\s*)(<main\b[^>]*\bid="main"[^>]*>)', r'\1\2\5\4\3', s, count=1)
        s = re.sub(r'</main>(\s*)(' + FOOT_RE + r')(\s*)</div>', r'\2\1</main>\3</div>', s, count=1)
    return s

def landmarks(p, new):
    if 'id="main"' not in new: return
    a, b = new.find('<main'), new.find('</main>')
    c = re.search(CRUMB_RE, new)
    if c and not c.end() <= a: fail(p, 'breadcrumb is inside <main> (the skip link would not skip it)')
    h = new.find('<h1')
    if h != -1 and not a < h < b: fail(p, 'the h1 is not inside <main>')
    f = new.find('<footer class="site-foot">')
    if f != -1 and 'class="tool-layout"' not in new and not f > b: fail(p, 'site footer is inside <main>')
    if c and '<span aria-hidden="true">' in c.group(0) and re.search(r'(?<!crumb-step">)<span aria-hidden="true">', c.group(0)):
        fail(p, 'a breadcrumb separator is not glued to its crumb (crumb-glue.mjs)')

# Suffix nowrap (8 Nov 2026): .tools/suffix-nowrap.mjs wraps each word plus bracketed gender suffix in visible body text in
# <span class="nw">...</span> so the browser cannot break after the hyphen. NW_FORM is the same letter class the script and
# js/generator.js use. unwrap_nw() removes exactly that wrapper and nothing else, so with it undone the page must be the
# base page; nw_check() fails any nw span that holds anything but one form (a word change hidden inside one would still
# fail check 1, since the unwrapped text is compared).
NW_FORM = r'[A-Za-z\u00C0-\u024F]+\(-[A-Za-z\u00C0-\u024F]+\)'
def unwrap_nw(s): return re.sub(r'<span class="nw">(' + NW_FORM + r')</span>', r'\1', s)
def nw_check(p, s):
    total = s.count('class="nw"')
    ok = len(re.findall(r'<span class="nw">' + NW_FORM + r'</span>', s))
    if total != ok: fail(p, f'{total - ok} nw span(s) hold something other than one word(-suffix) form')
    for a, b in scripts(s):
        if 'class="nw"' in b: fail(p, 'an nw span sits inside a <script> (JSON-LD or inline code)')
    hd = s.split('<body', 1)[0]
    if 'class="nw"' in hd: fail(p, 'an nw span sits in <head>')

# Integrator, 7 Nov 2026 (merged Direction A tree): pages another builder rebuilt ON PURPOSE. This gate was written for
# the PAGES builder's scripted edits; these two are gated by their own builders' checks and by the whole-site
# preserve.mjs run (report: ops/research/site-design-2026-11-06/build/preserve-report.txt). Here they still get the
# checks that bind every page: JSON-LD byte-identical and parsing, and every inline script passing node --check.
OTHER_GATE = {'index.html': 'HOME: .tools/home-diff-vs-main.mjs and .tools/home-cards-verify.mjs',
              'play/index.html': 'PLAY: its text gate (build/PLAY.md)'}
# Pages whose inline script another builder owns (TOOLS: A22 and the install bar tuck); node --check still runs.
SCRIPT_OWNED = {'four-kings-online/index.html'}

# Review fix IT-6 (7 Nov 2026): on /four-kings-online/ the "In the Antics app this game is The Four Kings" note moved from the
# header, under the lead, to the first child of .tool-body, so the card opens the first screen on a phone. Same words, same
# element; only its position changed. undo_moves() puts it back before the text and tag-sequence comparisons.
MOVED_NOTE = {'four-kings-online/index.html'}
def undo_moves(p, s):
    if p not in MOVED_NOTE: return s
    m = re.search(r'(<div class="tool-body prose">\s*)(<p class="note">[^<]*</p>)\s*', s)
    if not m: return s
    s = s[:m.start()] + m.group(1) + s[m.end():]
    return re.sub(r'(<p class="lead">[^<]*</p>)', lambda k: k.group(1) + '\n      ' + m.group(2), s, count=1)

# Polish round 2 (7 Nov 2026): against a base that already carries the redesign (origin/main from 5c8e3ac: its pages
# have the skip link, the landmark moves, the nowrap spans and the moved Four Kings note) the transforms above would
# undo or strip things on ONE side only. Such a page is compared like with like instead: text, link list, JSON-LD, inline
# scripts and the whole body tag sequence straight against the base, with no transform at all (stricter, not looser).
def post_redesign(o): return o is not None and 'class="skip"' in o

n_ok = 0
for p in pages:
    raw = open(p, encoding='utf-8').read(); o = old(p); post = post_redesign(o)
    nw_check(p, raw); real = raw if post else undo_moves(p, raw)
    new = unwrap_nw(real)
    if o is None:
        fail(p, 'new file (no base copy), not gated'); continue
    if p in OTHER_GATE:
        if [b for a, b in scripts(o) if 'ld+json' in a] != [b for a, b in scripts(new) if 'ld+json' in a]: fail(p, 'JSON-LD changed')
        for k, b in enumerate(b for a, b in scripts(new) if 'src=' not in a and 'ld+json' not in a and 'json' not in a):
            with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f: f.write(b)
            r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True); os.unlink(f.name)
            if r.returncode: fail(p, f'node --check failed on inline script {k}: {r.stderr.strip()[:200]}')
        print(f'{p}: per-page diff checks left to {OTHER_GATE[p]}; JSON-LD and node --check run here')
        n_ok += 1; continue
    # 1. visible text
    to, tn = strip_tags(o), strip_tags(new)
    for st in (() if post else SKIP_TEXTS):
        tn = tn.replace(' ' + st + ' ', ' ', 1) if (' ' + st + ' ') in tn else (tn[len(st) + 1:] if tn.startswith(st + ' ') else tn)
    if p in CAPTION and not post: tn = tn.replace(CAPTION[p] + ' ', '', 1)
    if to != tn:
        i = next((k for k in range(min(len(to), len(tn))) if to[k] != tn[k]), min(len(to), len(tn)))
        fail(p, f'VISIBLE TEXT differs near: old "{to[max(0,i-40):i+60]}" new "{tn[max(0,i-40):i+60]}"')
    # 2. JSON-LD
    ld_o = [b for a, b in scripts(o) if 'ld+json' in a]; ld_n = [b for a, b in scripts(new) if 'ld+json' in a]
    if ld_o != ld_n: fail(p, 'JSON-LD changed')
    for b in ld_n:
        try: json.loads(b)
        except Exception as e: fail(p, f'JSON-LD does not parse: {e}')
    # 3. hrefs and srcs
    uo, un = urls(o), urls(new)
    from collections import Counter
    co, cn = Counter(uo), Counter(un)
    for u, k in (co - cn).items():
        if u not in GOOGLE and u not in REMOVED_OK: fail(p, f'URL removed that is not a Google font URL: {u}')
    for u, k in (cn - co).items():
        if u not in ADDED_OK: fail(p, f'URL added that is not allowed: {u}')
    # 4. inline scripts
    so = [b for a, b in scripts(o) if 'src=' not in a and 'ld+json' not in a]
    sn = [b for a, b in scripts(new) if 'src=' not in a and 'ld+json' not in a]
    if len(so) != len(sn): fail(p, 'inline script count changed')
    else:
        for x, y in zip(so, sn):
            if x != y and p not in SCRIPT_OWNED and not (y.replace(A23, '', 1) == x and 'wl-draw-out' in new):
                fail(p, 'inline script changed beyond the A23 line')
    for k, b in enumerate(sn):
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f: f.write(b)
        r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True); os.unlink(f.name)
        if r.returncode: fail(p, f'node --check failed on inline script {k}: {r.stderr.strip()[:200]}')
    # 5. nesting and body tag sequence (the sequence on unfix(new): see unfix above)
    landmarks(p, new)
    nu = new if post else unfix(new)
    eo, en, enu = body_events(o), body_events(real), body_events(nu)   # en: nesting of the real file, nw spans included
    if en.bad: fail(p, f'tag nesting broken in new file: {en.bad[:2]}')
    if enu.bad: fail(p, f'tag nesting broken in the unfixed copy (unfix() did not undo cleanly): {enu.bad[:2]}')
    seq_o = eo.body
    seq_n = [t for t in enu.body]
    # remove the skip link (a start + end) and map main.page back to div
    if 'class="skip"' in new and not post:
        i = seq_n.index('a'); assert seq_n[i + 1] == '/a'; del seq_n[i:i + 2]
    if '<main class="page" id="main"' in nu and not post:
        seq_n = ['div' if t == 'main' else ('/div' if t == '/main' else t) for t in seq_n]
        # the converted pair must also be the SAME pair: compare the nesting of the old file's div.page with the new main
    if 'compare' in new and p == 'drinking-games/index.html':
        pass  # table cells changed td -> th and a caption was added: sequence legitimately differs inside the table; checked by text and nesting
    elif seq_o != seq_n:
        i = next((k for k in range(min(len(seq_o), len(seq_n))) if seq_o[k] != seq_n[k]), min(len(seq_o), len(seq_n)))
        fail(p, f'BODY TAG SEQUENCE differs at event {i}: old {seq_o[i-2:i+3]} new {seq_n[i-2:i+3]}')
    # 6. landmarks
    if 'class="skip"' in new or '<main' in new:
        if new.count('<main') != 1 or new.count('</main>') != 1: fail(p, 'main count != 1')
        if len(re.findall(r'\bid="main"', new)) != 1: fail(p, 'id="main" count != 1')
        if 'class="skip"' in new and en.first_in_body != ('a', 'skip', '#main'): fail(p, f'skip link is not first in body: {en.first_in_body}')
        if '<main class="page" id="main"' in new:
            # mirror check on the old file: its div.page closed at the same event index as the new main
            pass
    n_ok += 1

# the converted pairs: confirm main closes exactly where div.page closed (event index of the matching end)
def pair_index(s, start_tag_re, name):
    p = Nest(); stack = []; idx = 0; res = None
    class Q(HTMLParser):
        def __init__(self): super().__init__(); self.st = []; self.n = 0; self.open = None; self.close = None; self.started = False
        def handle_starttag(self, t, a):
            if t in VOID or t in ('html', 'head', 'body'): return
            self.n += 1
            if not self.started and t == name and re.search(start_tag_re, dict(a).get('class', '') or ''): self.started = True; self.open = self.n; self.depth = len(self.st)
            self.st.append(t)
        def handle_endtag(self, t):
            if t in VOID or t in ('html', 'head', 'body'): return
            while self.st and self.st[-1] in IMPLIED and self.st[-1] != t: self.st.pop();
            if self.st and self.st[-1] == t:
                self.st.pop(); self.n += 1
                if self.started and self.close is None and len(self.st) == self.depth: self.close = self.n
    q = Q(); q.feed(s); return (q.open, q.close)

pairs = 0
for p in pages:
    new = unfix(open(p, encoding='utf-8').read()); o = old(p)
    if o and not post_redesign(o) and '<main class="page" id="main"' in new:
        a = pair_index(o, r'\bpage\b', 'div'); b = pair_index(new, r'\bpage\b', 'main')
        # the new file has the skip link (2 more events before the pair): shift by 2
        extra = 2 if p == 'drinking-games/index.html' else 0   # its table gained a <caption> start and end event inside the pair
        # integrator, 7 Nov 2026: the head's <script src="/js/deal.js" defer></script> adds a start and end event before the pair
        head = 2 if ('<script src="/js/deal.js" defer></script>' in new and '/js/deal.js' not in o) else 0
        if None in a or None in b or b[0] - a[0] != 2 + head or b[1] - a[1] != 2 + head + extra: fail(p, f'div.page / main.page pairing differs: old {a} new {b}')
        else: pairs += 1
print(f'{n_ok} page(s) passed the per-page checks; {pairs} div.page -> main.page conversions confirmed to close at the same element')

# global: font coverage
out = subprocess.run("grep -rL 'bricolage-800-latin' --include='*.html' . | sort", shell=True, capture_output=True, text=True).stdout.split()
loaded = set(subprocess.run("git grep -l 'fonts.googleapis.com' " + args.base + " -- '*.html' | sed 's/^[^:]*://' | sort", shell=True, capture_output=True, text=True).stdout.split())
unexpected = [f[2:] for f in out if f[2:] in loaded and f[2:] not in ('index.html',)]
print(f"{len(out)} html files lack the preload; of those, previously loaded Google fonts: {sorted(set(f[2:] for f in out) & loaded)}")
if unexpected: fail('(global)', f'pages that loaded the Google sheet but lack the preload: {unexpected}')
r = subprocess.run("grep -rl 'fonts.googleapis.com\\|fonts.gstatic.com' --include='*.html' . | sort", shell=True, capture_output=True, text=True).stdout.split()
print('files still naming a Google font host:', r)
if set(r) - {'./index.html'}: fail('(global)', f'Google font host still referenced: {set(r) - {"./index.html"}}')

print('\nFAILS:' if fails else '\nALL GATES PASS')
for f in fails[:60]: print(' ', f)
print(f'({len(fails)} failure(s))' if fails else '')
sys.exit(1 if fails else 0)
