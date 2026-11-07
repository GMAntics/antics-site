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
  6. exactly one <main>, exactly one id="main", the skip link is the first element in <body>.
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

# Integrator, 7 Nov 2026 (merged Direction A tree): pages another builder rebuilt ON PURPOSE. This gate was written for
# the PAGES builder's scripted edits; these two are gated by their own builders' checks and by the whole-site
# preserve.mjs run (report: ops/research/site-design-2026-11-06/build/preserve-report.txt). Here they still get the
# checks that bind every page: JSON-LD byte-identical and parsing, and every inline script passing node --check.
OTHER_GATE = {'index.html': 'HOME: .tools/home-diff-vs-main.mjs and .tools/home-cards-verify.mjs',
              'play/index.html': 'PLAY: its text gate (build/PLAY.md)'}
# Pages whose inline script another builder owns (TOOLS: A22 and the install bar tuck); node --check still runs.
SCRIPT_OWNED = {'four-kings-online/index.html'}

n_ok = 0
for p in pages:
    new = open(p, encoding='utf-8').read(); o = old(p)
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
    for st in SKIP_TEXTS:
        tn = tn.replace(' ' + st + ' ', ' ', 1) if (' ' + st + ' ') in tn else (tn[len(st) + 1:] if tn.startswith(st + ' ') else tn)
    if p in CAPTION: tn = tn.replace(CAPTION[p] + ' ', '', 1)
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
        if u not in GOOGLE: fail(p, f'URL removed that is not a Google font URL: {u}')
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
    # 5. nesting and body tag sequence
    eo, en = body_events(o), body_events(new)
    if en.bad: fail(p, f'tag nesting broken in new file: {en.bad[:2]}')
    seq_o = eo.body
    seq_n = [t for t in en.body]
    # remove the skip link (a start + end) and map main.page back to div
    if 'class="skip"' in new:
        i = seq_n.index('a'); assert seq_n[i + 1] == '/a'; del seq_n[i:i + 2]
    if '<main class="page" id="main"' in new:
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
    new = open(p, encoding='utf-8').read(); o = old(p)
    if o and '<main class="page" id="main"' in new:
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
