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
| `site-drinking-games` | `/drinking-games/` | the two store buttons |
| `site-kings-cup` | `/kings-cup-rules/` | the two store buttons |
| `site-ring-of-fire` | `/ring-of-fire-rules/` | the two store buttons |
| `site-picolo` | `/picolo-alternative/` | the two store buttons |
| `site-imposter` | `/how-to-play-imposter/` | the two store buttons |
| `site-imposter-inline` | `/how-to-play-imposter/` | "Open Imposter in Antics" in the steps |
| `site-imposter-laptop` | `/how-to-play-imposter/` | the "On a laptop?" line |
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
