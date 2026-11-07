#!/usr/bin/env python3
"""A11: compute the "Bricolage Fallback" @font-face metrics from the real font tables.

Not guessed: every number below is read from the font files' head, hhea, OS/2 and hmtx tables
(through fontTools) and printed, so the log in build/PAGES.md can be re-derived.

Inputs (all fetched from the SAME Google Fonts CSS URL the site used, see build/PAGES.md):
  --woff2-latin / --woff2-ext : the two served woff2 files (variable: opsz 12..96, wght pinned 800)
  --ttf                       : the static TTF Google serves to an old User-Agent (a DIFFERENT opsz instance)
  --arial / --arial-bold      : the fallback fonts (macOS /System/Library/Fonts/Supplemental/Arial*.ttf)
  --site                      : the site worktree, whose h1/h2/h3 text is the sample

Needs fontTools + brotli (a scratch venv is enough: python3 -m venv v && v/bin/pip install fonttools brotli uharfbuzz).
Usage: font-metrics.py --site <dir> --woff2-latin f --woff2-ext f --ttf f --arial f --arial-bold f
"""
import argparse, os, re, sys, collections, html
from html.parser import HTMLParser
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
import io
try:
    import uharfbuzz as hb
except ImportError:
    hb = None

ap = argparse.ArgumentParser()
ap.add_argument('--site', required=True)
ap.add_argument('--woff2-latin', required=True)
ap.add_argument('--woff2-ext', required=True)
ap.add_argument('--ttf', required=True)
ap.add_argument('--arial', required=True)
ap.add_argument('--arial-bold', required=True)
args = ap.parse_args()


def tables(path):
    f = TTFont(path)
    o = f['OS/2']
    return f, dict(
        upem=f['head'].unitsPerEm, hhea_asc=f['hhea'].ascent, hhea_desc=f['hhea'].descent, hhea_gap=f['hhea'].lineGap,
        typo_asc=o.sTypoAscender, typo_desc=o.sTypoDescender, typo_gap=o.sTypoLineGap,
        win_asc=o.usWinAscent, win_desc=o.usWinDescent, xavg=o.xAvgCharWidth,
        use_typo=bool(o.fsSelection & (1 << 7)), os2_version=o.version)


def widths(font):
    """codepoint -> advance (font units)"""
    cmap, hmtx = font.getBestCmap(), font['hmtx']
    return {cp: hmtx[g][0] for cp, g in cmap.items()}


# ---------------------------------------------------------------- 1. the tables, printed
print('== TABLES (head, hhea, OS/2)')
fonts = {}
for key, path in [('bricolage woff2 latin (served, variable)', args.woff2_latin),
                  ('bricolage woff2 latin-ext (served, variable)', args.woff2_ext),
                  ('bricolage TTF (old-UA static instance)', args.ttf),
                  ('Arial Regular', args.arial), ('Arial Bold', args.arial_bold)]:
    f, t = tables(path)
    fonts[key] = f
    print(f'{key}: {t}')
    if 'fvar' in f:
        print('   fvar axes:', [(a.axisTag, a.minValue, a.defaultValue, a.maxValue) for a in f['fvar'].axes])

# ---------------------------------------------------------------- 2. sample text: every heading on the site
class H(HTMLParser):
    def __init__(self):
        super().__init__(); self.depth = 0; self.buf = []; self.out = []
    def handle_starttag(self, tag, attrs):
        if tag in ('h1', 'h2', 'h3'): self.depth += 1
    def handle_endtag(self, tag):
        if tag in ('h1', 'h2', 'h3') and self.depth:
            self.depth -= 1
            if not self.depth:
                self.out.append(re.sub(r'\s+', ' ', ''.join(self.buf)).strip()); self.buf = []
    def handle_data(self, d):
        if self.depth: self.buf.append(d)

heads = []
for root, _, fs in os.walk(args.site):
    if '/.git' in root or '/.tools' in root: continue
    for fn in fs:
        if fn.endswith('.html'):
            p = H(); p.feed(open(os.path.join(root, fn), encoding='utf-8').read()); heads += p.out
text = ' '.join(html.unescape(h) for h in heads)
print(f'\n== SAMPLE: {len(heads)} headings, {len(text)} characters (h1, h2, h3 of every page, all languages)')

# English letter frequency (capsize style) for a second, text-independent number
EN = dict(zip('etaoinshrdlcumwfgypbvkjxqz', [12.49, 9.28, 8.04, 7.64, 7.57, 7.23, 6.51, 6.28, 5.95, 4.07, 4.06, 3.34, 2.73, 2.51, 2.52, 2.40, 2.00, 1.99, 1.92, 1.69, 1.30, 0.94, 0.15, 0.15, 0.10, 0.07]))
EN[' '] = 18.0
tot = sum(EN.values())

A_UPEM = 2048
# ---------------------------------------------------------------- 2b. kerning-aware widths (HarfBuzz shapes with GPOS/kern like a browser does)
def ttf_bytes(font):
    b = io.BytesIO(); font.flavor = None; font.save(b); return b.getvalue()

class Shaper:
    """Width of a string in em, shaped with the font's own kerning. Characters are routed to latin or latin-ext like unicode-range does."""
    def __init__(self, blobs, upem, opsz=None):
        self.fonts = []
        for data in blobs:
            face = hb.Face(hb.Blob(data)); f = hb.Font(face)
            if opsz is not None: f.set_variations({'opsz': opsz})
            self.fonts.append((f, set(TTFont(io.BytesIO(data)).getBestCmap()), upem))
    def width(self, s):
        tot, run, cur = 0.0, '', None
        def flush():
            nonlocal tot, run, cur
            if run:
                f, _, upem = self.fonts[cur]; buf = hb.Buffer(); buf.add_str(run); buf.guess_segment_properties()
                hb.shape(f, buf, {'kern': True, 'liga': True}); tot += sum(p.x_advance for p in buf.glyph_positions) / upem
            run = ''
        for ch in s:
            idx = next((i for i, (_, cm, _) in enumerate(self.fonts) if ord(ch) in cm), None)
            if idx is None: continue                      # glyph in neither file: falls to a system font, ignore
            if idx != cur: flush(); cur = idx
            run += ch
        flush(); return tot

BRIC_BLOBS = [ttf_bytes(TTFont(args.woff2_latin)), ttf_bytes(TTFont(args.woff2_ext))]
ARIAL_B = Shaper([open(args.arial_bold, 'rb').read()], A_UPEM) if hb else None
ARIAL_R = Shaper([open(args.arial, 'rb').read()], A_UPEM) if hb else None

# ---------------------------------------------------------------- 3. widths at several optical sizes
arial, arial_b = widths(fonts['Arial Regular']), widths(fonts['Arial Bold'])
A_UPEM = 2048


def adv(wmap, upem, s):
    n = 0.0; miss = 0
    for ch in s:
        w = wmap.get(ord(ch))
        if w is None: miss += 1; continue
        n += w / upem
    return n, miss


def bric_at(opsz):
    maps = {}
    for key in ('bricolage woff2 latin (served, variable)', 'bricolage woff2 latin-ext (served, variable)'):
        src = TTFont(args.woff2_latin if 'latin (' in key else args.woff2_ext)
        inst = instancer.instantiateVariableFont(src, {'opsz': opsz}, inplace=False)
        maps[key] = widths(inst)
    m = dict(maps['bricolage woff2 latin-ext (served, variable)']); m.update(maps['bricolage woff2 latin (served, variable)'])
    return m


print('\n== RATIO bricolage-800 / Arial, by optical size (size-adjust candidate = this ratio)')
print('opsz | heading-text vs Arial Bold | heading-text vs Arial Regular | EN-freq vs Arial Bold | EN-freq vs Arial Regular | glyphs missing in Bricolage | HarfBuzz-shaped (kerning) ratios')
res = {}
for opsz in (12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 84, 96):
    b = bric_at(opsz)
    bw, miss = adv(b, 1000, text)
    aw_b, _ = adv(arial_b, A_UPEM, text)
    aw_r, _ = adv(arial, A_UPEM, text)
    # EN-frequency weighted average advance (em)
    fb = sum(EN[c] * b[ord(c)] / 1000 for c in EN) / tot
    fab = sum(EN[c] * arial_b[ord(c)] / A_UPEM for c in EN) / tot
    far = sum(EN[c] * arial[ord(c)] / A_UPEM for c in EN) / tot
    res[opsz] = dict(head_b=bw / aw_b, head_r=bw / aw_r, en_b=fb / fab, en_r=fb / far, miss=miss, fb=fb)
    if hb:
        sb = Shaper(BRIC_BLOBS, 1000, opsz)
        # shape each heading on its own (a heading is one line of text) and sum, so kerning never crosses a heading boundary
        bs = sum(sb.width(html.unescape(h)) for h in heads); ab_s = sum(ARIAL_B.width(html.unescape(h)) for h in heads); ar_s = sum(ARIAL_R.width(html.unescape(h)) for h in heads)
        res[opsz].update(shaped_b=bs / ab_s, shaped_r=bs / ar_s)
    print(f'{opsz:>4} | {bw / aw_b:.4f} | {bw / aw_r:.4f} | {fb / fab:.4f} | {fb / far:.4f} | {miss}' + (f" | shaped (kerned) vs Bold {res[opsz]['shaped_b']:.4f}, vs Regular {res[opsz]['shaped_r']:.4f}" if hb else ''))

# ---------------------------------------------------------------- 4. the static TTF cross-check (the brief's "old UA" file)
ttf = fonts['bricolage TTF (old-UA static instance)']
tw = widths(ttf)
tb, _ = adv(tw, ttf['head'].unitsPerEm, text)
ab, _ = adv(arial_b, A_UPEM, text)
print(f"\n== OLD-UA STATIC TTF: heading-text width / Arial Bold = {tb / ab:.4f}; OS/2 xAvgCharWidth {ttf['OS/2'].xAvgCharWidth}/{ttf['head'].unitsPerEm}"
      f"  (the served woff2 at opsz 96 has xAvg {fonts['bricolage woff2 latin (served, variable)']['OS/2'].xAvgCharWidth}). "
      "The TTF is a different optical-size instance, so it is NOT used for size-adjust.")

# ---------------------------------------------------------------- 5. choose
# Display type on the site lives between about 18px and 84px. Chrome and Safari set opsz = font-size in px
# (font-optical-sizing: auto), and the face gets NARROWER as it grows, so no single size-adjust is exact.
# Headings (h1 step-3, h2 step-2, card prompts) sit mostly at 28..64px, so the number is the MEAN of the
# heading-text ratio over opsz 28..64 (step 4), which keeps the error within about +-3% over that range.
GRID = list(range(28, 65, 4))
for key in ('head_b', 'head_r') + (('shaped_b', 'shaped_r') if hb else ()):
    vals = [res[o][key] for o in GRID]
    print(f'{key}: mean over opsz 28..64 = {sum(vals) / len(vals):.4f}, min {min(vals):.4f}, max {max(vals):.4f}')

# Which Arial to fall back to: the face is declared weight 800, so Arial Bold is the honest partner.
KEY = 'shaped_b' if hb else 'head_b'    # prefer the kerning-aware ratio: it is what a browser lays out
print(f'size-adjust is taken from the {KEY} column (kerning-aware if HarfBuzz is installed)')
size_adjust = sum(res[o][KEY] for o in GRID) / len(GRID)
b0 = fonts['bricolage woff2 latin (served, variable)']
asc, desc, gap, upem = b0['hhea'].ascent, -b0['hhea'].descent, b0['hhea'].lineGap, b0['head'].unitsPerEm
print(f'\n== RESULT (mean heading-text ratio vs Arial Bold, opsz 28..64)')
print(f'size-adjust       = {size_adjust * 100:.2f}%')
print(f'ascent-override   = hhea.ascent / upem / size-adjust    = {asc} / {upem} / {size_adjust:.4f} = {asc / upem / size_adjust * 100:.2f}%')
print(f'descent-override  = |hhea.descent| / upem / size-adjust = {desc} / {upem} / {size_adjust:.4f} = {desc / upem / size_adjust * 100:.2f}%')
print(f'line-gap-override = hhea.lineGap / upem / size-adjust   = {gap} / {upem} / {size_adjust:.4f} = {gap / upem / size_adjust * 100:.2f}%')
print('\n== RESIDUAL ERROR of the chosen size-adjust (fallback width / Bricolage width - 1), by font-size in px')
for o in (20, 28, 38, 48, 56, 68, 84):
    k = min(res, key=lambda x: abs(x - o))
    print(f'{o:>3}px (opsz~{k}): {size_adjust / res[k][KEY] * 100 - 100:+.1f}%')
