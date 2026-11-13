# 1.1.6 launch pages: Blag and Name 3 in eight languages

Branch `feat/116-launch-pages`, cut 13 Nov 2026 from `origin/feat/116-new-games`
at 302ffe3 (which already holds the English `/blag-game/` and `/name-3-game/`).
This README lives in `.tools/` on purpose: GitHub Pages' Jekyll pass would
publish a Markdown file anywhere else, and it never serves dot folders.

## PUBLISHES WITH THE RELEASE, NOT BEFORE

Every page here says Blag and Name 3 are in the Antics app, which is true only
once 1.1.6 is live in the App Store (submit planned 30 Nov 2026; approval
publishes automatically). Publish this branch together with, or after,
`feat/116-new-games`, and only after the `feat/blag-join` /j/ page is live,
because every Blag page promises a browser join. Nothing here names a date or
says "new" in a way that goes stale, except the hub blocks' "New in the app"
heading, which can stay for a few weeks.

Hosting a Blag room is described as iPhone only, matching the English page's
publish-gate comment (no Android Blag hosting until the Play rating's "users
interact" answer, D8). If Guy switches Android hosting on for 1.1.6, change
`blag.cta.p` in each `i18n-<lang>.mjs` and re-run the builder.

## How it is built

`node .tools/launch-116/build.mjs` from the worktree root. It is re-runnable:

- writes the 16 translated pages from `i18n-<lang>.mjs` (one per language),
- adds the hreflang set (en, es, pt, de, fr, it, nl, pl, cs, x-default = the
  English page) and a language row to the two English pages, once (marker
  comment `launch-116 hreflang`),
- adds a "new in the app" pair of tiles (Blag and Name 3) to each language hub,
  once (marker `launch-116 hub tiles`),
- adds the 16 URLs to `sitemap.xml` after `/blag-game/` and sets lastmod
  2026-11-13 on them, the two English pages and the eight hubs,
- runs `node --check` on every inline script of every page it wrote or
  patched, and `JSON.parse` on every JSON-LD block; it throws on an em dash in
  any copy.

The site's languages follow its existing pattern: es is es-419 and pt is
pt-BR, as on every other translated page; there are no es-ES or pt-PT folders
on the site, so the app's eleven languages map to the site's nine.

Game names come from the app's own dictionaries on `feat/116-blag`
(`games.blag.name`, `games.nameThree.name`, the Blag mode names and the "Lie
for me" button). The Name 3 taster on each page uses the same ten FREE
categories as the English page (indexes 0, 1, 3, 9, 10, 21, 22, 24, 30, 36),
copied from the app's ruled mirror `src/data/<lang>/nameThree.ts`. No Blag
card text appears anywhere.

The copy is an agent draft of 13 Nov 2026, translated from the English pages.
AI language QA has NOT run on it yet. Words chosen to match the app: the
forfeit is reto (es), prenda (pt), Strafe (de), gage (fr), penitenza (it),
opdracht (nl), fant (pl, cs).

## Every file

New pages (16):

| Language | Blag | Name 3 |
| --- | --- | --- |
| es | `es/juego-blag/index.html` | `es/juego-nombra-3/index.html` |
| pt | `pt/jogo-blag/index.html` | `pt/jogo-diga-3/index.html` |
| de | `de/blag-spiel/index.html` | `de/nenne-3-spiel/index.html` |
| fr | `fr/jeu-blag/index.html` | `fr/jeu-cite-3/index.html` |
| it | `it/gioco-blag/index.html` | `it/gioco-nomina-3/index.html` |
| nl | `nl/blag-spel/index.html` | `nl/noem-3-spel/index.html` |
| pl | `pl/gra-blag/index.html` | `pl/gra-wymien-3/index.html` |
| cs | `cs/blag-hra/index.html` | `cs/hra-vyjmenuj-3/index.html` |

Patched (11): `blag-game/index.html`, `name-3-game/index.html` (hreflang and
language row), `es/ pt/ de/ fr/ it/ nl/ pl/ cs/index.html` (hub tiles),
`sitemap.xml`. Also `docs/campaign-tags.md` (the `site-blag-*` and
`site-name3-*` tags, English ones included, which were unregistered).

Builder and copy (not served): `.tools/launch-116/build.mjs`,
`.tools/launch-116/i18n-{es,pt,de,fr,it,nl,pl,cs}.mjs`, this README.

## Checks run

- the builder's own `node --check` on all 9 inline scripts of touched pages
  (8 Name 3 tasters plus the English taster) and JSON-LD parse: pass
- `node .tools/lastmod-check.mjs`: 4 warnings, all on pages this branch did not
  touch (they predate it)
- no em dash, no "family", "kids" or "one phone" in any new page

## Not checked

- no browser render of the new pages (layout of the language row and the hub
  tiles at phone width is unverified)
- `.tools/gates.py` was not run: it is the 7 Nov layout-builder gate and fails
  any content change by design
- AI language QA of the eight translations
