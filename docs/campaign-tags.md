# Campaign tags (`?c=`) for /get

`/get/` reads `?c=<tag>`, logs it on the `get_visit` event, and passes it to
Apple as `ct=` and to Play as the `utm_campaign` referrer. A visit with no tag
is an install we cannot attribute to anything.

Rules for a tag:

- lowercase `a-z`, digits and hyphens only, 32 characters maximum
  (`/get/index.html` sanitises with `/[?&]c=([a-z0-9-]{1,32})(&|$)/`)
- `c=` must be the last parameter or be followed by `&`
- tags are permanent once published: a printed QR or a posted link carries the
  spelling forever, so rename nothing, retire instead
- `?o=` (promoter offer codes) is separate and never edited to add a tag

## Prefixes

| Prefix | Meaning |
| --- | --- |
| `site-` | a link on anticsapp.com itself |
| `embed-` | the generator widget running on somebody else's site |
| `st-` | street team promoter page (`/leeds`, `/pippa`, ...) |
| `out-` | outreach and press placements (`/unifresher`, `/pocketgamer`) |
| `ig-`, `tt-` | social bio links |
| `web-`, `app-` | the browser demo (`/play`) and the in-app wall (`/room`) |
| `pitch-` | emailed pitches to independent "best apps" pages (`ops/ai-search-pitches-2026-10-05.md` in the app repo): `pitch-feelgood`, `pitch-igeeks`, `pitch-techlog`; and the nine data pitches `pitch-data-sts`, `pitch-data-tab`, `pitch-data-unifresher`, `pitch-data-varsity`, `pitch-data-cherwell`, `pitch-data-boar`, `pitch-data-metro`, `pitch-data-timeout`, `pitch-data-olive` (`/party-data/?c=...`, carried onto every `/get/` link by `/party-data/tag.js`; `ops/data-page-pitches-2026-10-05.md`) |

## Site tags

Set 19 September 2026. Every `site-` link points at `/get/`, which routes the
phone to the right store; there are no direct App Store or Google Play links
left on a content page.

| Tag | Page | Which link |
| --- | --- | --- |
| `site-home-hero` | `/` | the two hero store buttons |
| `site-about` | `/about/` | the two store buttons |
| `site-party-games` | `/party-games/` | the two store buttons |
| `site-party-games-footer` | `/party-games/` | footer "Get the app" |
| `site-friends-games` | `/games-to-play-with-friends/` | the two store buttons |
| `site-friends-games-footer` | `/games-to-play-with-friends/` | footer "Get the app" |
| `site-nondrink` | `/party-games-without-drinking/` | the two store buttons |
| `site-nondrink-footer` | `/party-games-without-drinking/` | footer "Get the app" |
| `site-nondrink-bar` | `/party-games-without-drinking/` | the phone install bar |
| `site-nondrink-qr` | `/party-games-without-drinking/` | the closing box's QR, laptops and tablets only (`/party-games-without-drinking/qr.png`) |
| `site-uni` | `/party-games-for-uni/` | the two store buttons |
| `site-uni-footer` | `/party-games-for-uni/` | footer "Get the app" |
| `site-uni-bar` | `/party-games-for-uni/` | the phone install bar |
| `site-uni-qr` | `/party-games-for-uni/` | the closing box's QR, laptops and tablets only (`/party-games-for-uni/qr.png`) |
| `site-data` | `/party-data/` | the two store buttons in the closing box |
| `site-data-qr` | `/party-data/` | the closing box QR, laptops and tablets only (`/party-data/qr.png`) |
| `site-data-footer` | `/party-data/` | footer "Get the app" |
| `site-data-bar` | `/party-data/` | the phone install bar |
| `site-drinking-games` | `/drinking-games/` | the two store buttons |
| `site-kings-cup` | `/kings-cup-rules/` | the two store buttons |
| `site-ring-of-fire` | `/ring-of-fire-rules/` | the two store buttons |
| `site-picolo` | `/picolo-alternative/` | the two store buttons |
| `site-imposter` | `/how-to-play-imposter/` | the two store buttons |
| `site-imposter-inline` | `/how-to-play-imposter/` | "Open Imposter in Antics" in the steps |
| `site-imposter-laptop` | `/how-to-play-imposter/` | the "On a laptop?" line |
| `site-imposter-play` | `/imposter-game/` | the wall's "Get Antics free" button (after every third round); a `?c=` on the page URL replaces it, as on `/play/` |
| `site-imposter-play-qr` | `/imposter-game/` | the wall's QR, shown on wide screens only (`/qr-imposter-play.png`) |
| `site-imposter-play-bar` | `/imposter-game/` | the phone install bar |
| `site-imposter-es` | `/es/juego-del-impostor/` | the wall's "Descarga Antics gratis" button (after every third round); a `?c=` on the page URL replaces it, as on `/play/` |
| `site-imposter-es-qr` | `/es/juego-del-impostor/` | the wall's QR, wide screens only (`/qr-imposter-es.png`) |
| `site-imposter-es-bar` | `/es/juego-del-impostor/` | the phone install bar |
| `site-imposter-pt` | `/pt/jogo-do-impostor/` | the wall's "Baixe o Antics grátis" button (after every third round); a `?c=` on the page URL replaces it |
| `site-imposter-pt-qr` | `/pt/jogo-do-impostor/` | the wall's QR, wide screens only (`/qr-imposter-pt.png`) |
| `site-imposter-pt-bar` | `/pt/jogo-do-impostor/` | the phone install bar |
| `site-odds` | `/what-are-the-odds/` | the two store buttons |
| `site-odds-laptop` | `/what-are-the-odds/` | the "On a laptop?" line |
| `site-hen` | `/hen-do-games/` | end CTA |
| `site-stag` | `/stag-do-games/` | end CTA |
| `site-forfeits` | `/forfeit-ideas/` | end CTA |
| `site-nhie-questions` | `/never-have-i-ever-questions/` | end CTA |
| `site-mlt-questions` | `/most-likely-to-questions/` | end CTA |
| `site-tod-questions` | `/truth-or-dare-questions/` | end CTA |
| `site-wyr-questions` | `/would-you-rather-questions/` | end CTA |
| `site-blog` | `/blog/` | footer "Get the app" |
| `site-blog-freshers` | `/blog/freshers-icebreakers/` | end CTA |
| `site-blog-how-we-write` | `/blog/how-we-write-party-game-questions/` | end CTA |
| `site-blog-running-order` | `/blog/party-games-night-running-order/` | end CTA |
| `site-blog-halloween` | `/blog/halloween-party-games-for-adults/` | end CTA |
| `site-blog-halloween-bar` | `/blog/halloween-party-games-for-adults/` | the phone install bar |
| `site-llms` | `llms.txt` | the "Get Antics free" line |
| `site-referral-fallback` | `/r/` | the no-JS button, used only when a share token does not resolve |

## Generator tags

Each generator page carries the tag three times: the widget's own CTA button,
the inline link in the "How to play" copy, and the footer line. The widget
rewrites its own button from `js/generator.js`, so the base tag lives there and
the static markup matches it.

| Game | Widget CTA | In-copy link | Footer link | Embedded on another site |
| --- | --- | --- | --- | --- |
| Never Have I Ever | `site-generator-nhie` | `site-generator-nhie-copy` | `site-generator-nhie-foot` | `embed-generator-nhie` |
| Most Likely To | `site-generator-mlt` | `site-generator-mlt-copy` | `site-generator-mlt-foot` | `embed-generator-mlt` |
| Truth or Dare | `site-generator-tod` | `site-generator-tod-copy` | `site-generator-tod-foot` | `embed-generator-tod` |
| Would You Rather | `site-generator-wyr` | `site-generator-wyr-copy` | `site-generator-wyr-foot` | `embed-generator-wyr` |
| What Are The Odds | `site-generator-odds` | `site-generator-odds-copy` | `site-generator-odds-foot` | `embed-generator-odds` |

## Spanish and Portuguese pages

Set 5 October 2026. Each question page carries five tags; each language home three.
`<g>` is `nhie`, `tod`, `wyr` or `mlt`.

| Tag | Page | Which link |
| --- | --- | --- |
| `site-es-<g>` | `/es/preguntas-.../` | the download box's "Descarga Antics gratis" button |
| `site-es-<g>-qr` | same | the download box's QR, laptops and tablets only (`qr.png` in the page's folder) |
| `site-es-<g>-bar` | same | the phone install bar |
| `site-es-<g>-gen` | same | the generator's "Descarga Antics gratis" button (from `js/generator.js`, via `data-cta`) |
| `site-es-<g>-gen-imp` | same | the generator's "Juega al impostor gratis" button: it opens `/es/juego-del-impostor/?c=site-es-<g>-gen-imp`, whose wall then carries this tag (as `-play` does for `/play/`) |
| `site-es-hub` / `-hub-qr` / `-hub-bar` | `/es/` | button, QR, install bar |
| `site-pt-<g>` ... `site-pt-<g>-gen-imp` | `/pt/perguntas-.../` | the same five, Portuguese ("Baixe o Antics grátis", "Jogue o impostor grátis") |
| `site-pt-hub` / `-hub-qr` / `-hub-bar` | `/pt/` | button, QR, install bar |

## Deliberately left alone

- Every link that already carried a tag: the 19 promoter and bio redirect
  pages (`st-*`, `ig-bio`, `tt-bio`, `out-*`, `app-wall`), and `/play`'s own
  install buttons (`web-play`).
- `/play/` links from other pages stay untagged. `/play` passes any `?c=` and
  `?o=` it is given straight through to `/get`, and it overwrites the visitor's
  stored promoter offer when it sees a code, so tagging those links could wipe
  a street-team free week. A visitor who goes through `/play` already reaches
  `/get` tagged `web-play`.
- Store URLs inside JSON-LD (`index.html`, `about/index.html`) and in
  `llms.txt`: structured data and machine references should name the real store
  listing, not a redirect.
- `/get/`'s and `/r/`'s own redirect logic.
- `/support/` has no install link at all, so there was nothing to tag. Worth
  adding one later if support traffic is worth measuring.
- `challenge.html` is in `.gitignore` (an unpublished draft kept local only),
  so its direct App Store link was left as it is. If it is ever published,
  route it through `/get/?c=site-challenge`.
