# Interface polish checklist

**When this applies.** Work through this list for the parts of a page you are
already changing for another reason. It is never a reason to open a page on
its own, and never a standalone redesign. It never changes indexed text
(titles, headings, body copy, FAQ wording, JSON-LD, link text, URLs) or the
page layout and landmarks the SEO work depends on (`.tools/gates.py` checks
those): a polish fix is CSS only, and goes in `css/site.css` or the page's own
`<style>` block, in the plain CSS the site already uses.

This lives in `.github/` beside the README because Jekyll never serves dot
folders: a Markdown file at the root would become a public page.

## The list

Hover, press and focus

1. Every link and button has a visible hover state that changes colour,
   background or brightness only, never size or position of the text around it.
2. Hover styles that lift, move or recolour a control sit inside
   `@media (hover: hover)`, so a tap on a phone does not leave a control stuck
   in its hover look.
3. Pressed controls shrink a touch (`transform: scale()` between 0.95 and
   0.98), never smaller than 0.95.
4. Keyboard focus uses the one site ring (`:focus-visible`, 3px lime, 3px
   offset), never `outline: none` without a replacement, and the ring is not
   clipped by `overflow` on a parent.
5. Disabled controls look disabled (lower opacity, default cursor) and do not
   react to hover or press.

Size and spacing

6. Anything tappable is at least 44 by 44px (`--tap-min`); use padding with a
   matching negative margin, or a pseudo-element, when the visible part is
   smaller.
7. No two tap areas overlap, and a small control inside a larger link is
   either part of that link's target or a full 44px target of its own.

Surfaces

8. Corner radii come from the tokens (`--r-card`, `--r-control`, `--r-chip`,
   `--r-small`), not one-off pixel values.
9. Nested corners are concentric: the outer radius equals the inner radius
   plus the padding between them.
10. Depth comes from shadows (the `--deck-edge` stack or a soft `box-shadow`);
    borders are for structure: dividers, inputs, outlined buttons and
    selected states.
11. App icons and photos sitting on the dark surfaces carry a faint 1px
    neutral outline (white at about 10%), never one tinted to the palette.
12. Icons are text glyphs or single-colour SVG drawn in `currentColor`, so
    their hover and active states come from CSS colour, not a second file.
13. An icon beside a label is optically centred with it, not just
    geometrically (check play triangles, arrows and stars by eye).

Type

14. Headings use `text-wrap: balance`; short paragraphs, list items and
    captions use `text-wrap: pretty`; long text and code use neither.
15. Any number that changes in place (counters, steps, scores, percentages
    in a table) uses `font-variant-numeric: tabular-nums`.
16. `-webkit-font-smoothing: antialiased` is set once on the body, not
    re-declared per component.

Motion

17. Every transition names its properties; never `transition: all`.
18. Hover and colour changes take 150ms or less; a one-off entrance takes
    around 300ms and never more than half a second; an exit is shorter than
    its entrance.
19. State changes (hover, open, tuck) use CSS transitions, which can reverse
    mid-way; keyframes are kept for one-off sequences.
20. Something the visitor triggers again and again (next card, a stepper)
    gets an instant change or a short fade, not a full animation each time.
21. Motion is never the only sign that something changed: colour, text or an
    icon changes too.
22. Nothing animates in on page load for content already on screen; entrances
    play only when something scrolls into view or is asked for.
23. Under `prefers-reduced-motion: reduce` movement is removed (the static
    state still shows), and smooth scrolling is off.
24. `will-change` is used only to cure a seen first-frame stutter, only for
    `transform`, `opacity` or `filter`, and never `will-change: all`.

Checking

25. Before the commit, step through the changed parts at phone width
    (375px) and desktop width: hover, focus by Tab, press, and reduced motion
    on, with the browser's animation panel slowed to 10% for anything that
    moves.

Source: rules adapted in our own words from
[make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better)
by Jakub Krehel, MIT licence, Copyright (c) 2026 Jakub Krehel, read at commit
`6d9f2f1df10e8ce2ae1708598a73b0506fb98794`.

## Where the site stands (read-only check, 25 Nov 2026)

Findings only, nothing was changed. Read `css/site.css`, `css/data-page.css`,
`js/generator.css` and the inline styles of `index.html`, `play/index.html`
and `never-have-i-ever-questions/index.html` at the `origin/main` of that day
(`50bf316`). Line numbers are from that commit.

Already met

- 1, 5: colour or brightness hovers throughout (`css/site.css:564`, `:573`,
  `:1691`); disabled steppers and buttons dim (`css/site.css:1693`, `:1796`).
- 3 (mostly): buttons press to `scale(0.98)` (`css/site.css:565`,
  `index.html:219`); game tiles press to `0.985` (`css/site.css:2110`), a
  touch gentler than the range, which is harmless.
- 4: one ring everywhere (`css/site.css:201`, `index.html:202`,
  `play/index.html:157`); the TOC row is padded for it (`css/site.css:588`).
- 6, 7: `--tap-min: 44px` (`css/site.css:138`) on crumbs, chips, TOC, skip
  link and language links; footer links padded out to 44px
  (`css/site.css:1158`); the 30px arrow circles sit inside 52px links
  (`css/site.css:1031`).
- 10: deck-edge shadows for depth (`css/site.css:135`, `:956`), a soft shadow
  on the install bar (`css/site.css:1185`).
- 12: arrows are text glyphs coloured by CSS (`css/site.css:1031`).
- 14: `p, li` pretty (`css/site.css:235`), headings balance
  (`css/site.css:369`, `index.html:215`, `play/index.html:166`).
- 15: tabular numbers on the step list, generator count, dealer stepper and
  data tables (`css/site.css:791`, `:1418`, `:1701`, `css/data-page.css:132`).
- 16: once on the body (`css/site.css:190`).
- 17, 24: no `transition: all` and no `will-change` in any file read.
- 19: state changes are transitions (`css/site.css:562`, `:1233`); keyframes
  only for deals.
- 22: `js/deal.js:6` never deals a box already on screen at load.
- 23: a global reduced-motion block (`css/site.css:1617`), plus
  `index.html:418`; `play/index.html:308` plays its motion only under
  `no-preference`, which has the same effect; smooth scroll only with
  `no-preference` (`css/site.css:177`).

Visibly not met

- 2: no `(hover: hover)` guard in any file read. Hovers that move or recolour
  stick after a tap on touch screens: `.btn` brightness (`css/site.css:564`),
  game tiles (`css/site.css:2109`), home tiles lift 6px (`index.html:320`,
  reset only below 768px at `index.html:345`, so an iPad still gets it).
- 3: the Imposter dealer stepper presses to `scale(0.94)`
  (`css/site.css:1692`), under the 0.95 floor.
- 8: one-off radii beside the tokens: `9px` crumb icon (`css/site.css:330`,
  `play/index.html:162`), `14px` (`css/site.css:977`), `20px`
  (`css/site.css:1184`, `:2104`), `28px` (`css/site.css:1305`), `26px` and
  `20px` home tiles (`index.html:319`, `:322`).
- 9: the generator panel is `28px` with `16px` padding round a `24px` card
  (`css/site.css:1305`, `:1302`, `:1347`): concentric would be 40px outside or
  12px inside. Home tile `26px` with `8px` padding round a `20px` face
  (`index.html:319`, `:322`) is close (28px would match).
- 11: the app icon has no outline in the crumb (`css/site.css:330`), install
  bar (`css/site.css:1194`) or home brand mark (`index.html:228`).
- 18: the closing box rises over 0.52s (`css/site.css:1602`), just past half a
  second; the install bar tucks and returns on the same 0.28s
  (`css/site.css:1233`), so its exit is not shorter; the home tiles change
  background over 0.18s (`index.html:319`), just over the 150ms for hovers.
- 20: every "Next card" replays a 0.26s tilt-and-rise (`css/site.css:1486`,
  restarted by `js/generator.js:267`) and every dealer reveal a 0.3s flip
  (`css/site.css:1844`). Both are the ruled "The Deal" design of 7 Nov 2026,
  so they stay unless Guy rules otherwise; noted here only so nobody adds more
  of the same.

Not checked by reading code

- 13 (optical alignment) and 25 (the walk-through) need the pages open in a
  browser; 21 looked fine in code (each deal also changes the card's words).
- `js/generator.css` is the generators' self-contained base sheet (loaded
  before `css/site.css`, for example `never-have-i-ever-questions/index.html:96`),
  with its own palette and hard radii (`js/generator.css:17`, `:32`, `:38`);
  `css/site.css` overrides them on the site, so rule 8 is judged there.
