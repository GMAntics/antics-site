# anticsapp.com

This repository is the source of [anticsapp.com](https://anticsapp.com/), the
website for Antics, a pass-the-phone party game app for iPhone and Android.
Antics puts nine party games and thousands of cards on one phone, with no ads
and no accounts. Where a game needs a consequence it is a forfeit, so nothing
depends on drinking. It is made for adult groups (rated 18+ on the App Store)
by Guy Matthews, a solo founder in London, and published by Antics App Ltd.
The site carries free rules guides, question lists, browser games, Imposter
word lists, a blog and original party data.

## How the site is built

- Plain static HTML and CSS, with a little vanilla JavaScript. No framework,
  no package manager and no build step.
- Hosted on GitHub Pages from this repository. The `CNAME` file sets the
  custom domain, anticsapp.com.
- GitHub Pages runs its default Jekyll pass, which publishes the files as they
  are but turns Markdown files into public pages. That is why this README
  lives in `.github/`: Jekyll never serves dot folders.
- Shared styles are in `css/`, images in `img/`.
- The free in-browser games:
  - [/play/](https://anticsapp.com/play/) lets you pick a game and deals a
    free round on one phone passed round the room.
  - [/imposter-game/](https://anticsapp.com/imposter-game/) is the Imposter
    dealer: pick a category, pass the phone, and everyone sees the secret word
    except the imposter. `dealer.js` fetches its words from `words.json`.
  - The five question generators share `js/generator.js` and its question
    pools. Each has a Party deck and a Clean deck (`?mode=clean`), and can be
    embedded in an iframe with `?embed=1`.

## Map of the site

| Section | Live pages |
| --- | --- |
| Game guides and question lists | Start at the hub, [/party-games/](https://anticsapp.com/party-games/). Then [Never Have I Ever](https://anticsapp.com/never-have-i-ever-questions/), [Truth or Dare](https://anticsapp.com/truth-or-dare-questions/), [Would You Rather](https://anticsapp.com/would-you-rather-questions/), [Most Likely To](https://anticsapp.com/most-likely-to-questions/), [What Are The Odds](https://anticsapp.com/what-are-the-odds/), [How to play Imposter](https://anticsapp.com/how-to-play-imposter/), [Antics mode](https://anticsapp.com/antics-mode/), [The Four Kings](https://anticsapp.com/the-four-kings/) and [Forfeit ideas](https://anticsapp.com/forfeit-ideas/) |
| Guides for occasions | [Party games for uni](https://anticsapp.com/party-games-for-uni/), [Hen do games](https://anticsapp.com/hen-do-games/), [Stag do games](https://anticsapp.com/stag-do-games/), [Party games for small groups](https://anticsapp.com/party-games-for-small-groups/) and more, every one listed in [sitemap.xml](https://anticsapp.com/sitemap.xml) |
| Generators | [Never Have I Ever](https://anticsapp.com/never-have-i-ever-generator/), [Truth or Dare](https://anticsapp.com/truth-or-dare-generator/), [Would You Rather](https://anticsapp.com/would-you-rather-generator/), [Most Likely To](https://anticsapp.com/most-likely-to-generator/), [What Are The Odds](https://anticsapp.com/what-are-the-odds-generator/) |
| Free browser games | [/play/](https://anticsapp.com/play/) and the [Imposter dealer](https://anticsapp.com/imposter-game/) |
| Imposter word lists | [/imposter-game-words/](https://anticsapp.com/imposter-game-words/), one page per category (food, celebrities, places, everyday objects, brands, sports, Halloween), and [Imposter variations](https://anticsapp.com/imposter-game-variations/) |
| Blog | [/blog/](https://anticsapp.com/blog/) |
| Party data | [/party-data/](https://anticsapp.com/party-data/), see below |
| Spanish (Latin America) | [/es/](https://anticsapp.com/es/): question pages, an Imposter dealer at [/es/juego-del-impostor/](https://anticsapp.com/es/juego-del-impostor/) and a printable word list |
| Portuguese (Brazil) | [/pt/](https://anticsapp.com/pt/): question pages, an Imposter dealer at [/pt/jogo-do-impostor/](https://anticsapp.com/pt/jogo-do-impostor/) and a printable word list |
| Press and about | [/press/](https://anticsapp.com/press/) (fast facts, logo files and the party data charts) and [/about/](https://anticsapp.com/about/) |
| Help and privacy | [/support/](https://anticsapp.com/support/), [privacy policy](https://anticsapp.com/privacy.html), [delete your data](https://anticsapp.com/delete-data.html) |

Also at the root: `sitemap.xml`, `robots.txt`, `404.html` (GitHub Pages serves
it for any missing path) and `llms.txt`, a plain-text summary of the site for
AI assistants at https://anticsapp.com/llms.txt.

`get/` is the download page. The small top-level folders that hold only a
one-line redirect page are campaign links: each forwards to `/play/` or
`/get/` with a tag, and the pages under `qr/` show their QR codes. `docs/`
holds notes for the site's maintainers, and `robots.txt` asks crawlers to
skip it.

## Open data

[/party-data/](https://anticsapp.com/party-data/) publishes anonymous
aggregates from parties played on Antics between 26 August and 4 October
2026: when parties start, the busiest night, how many games a party plays,
truth versus dare and how often each game's cards get skipped. Every figure is a share, a
ratio, an index or a median time, never a count. The page explains how it
was counted.

- The CSV: [party-data/antics-party-data-2026-10.csv](https://anticsapp.com/party-data/antics-party-data-2026-10.csv)
- Ready-made charts, landscape and portrait, with the source set into each
  image: `party-data/charts/`, listed at https://anticsapp.com/party-data/#charts
- Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Please
  credit Antics and link to https://anticsapp.com/party-data/.
- The same data also lives in its own repository,
  https://github.com/GMAntics/party-data.

## Files generated from the app

`play/cards.js`, `es/cards.js`, `pt/cards.js` and each Imposter dealer's
`words.json` are exported from the app's private decks, free cards only: do
not edit them by hand. Never move or rename `room/config.json` (the app reads
it), `CNAME` or the IndexNow key file at the root.

## Maintenance tools and git hooks

All of these need Node. Both tools run only on the maintainer's machine: the
word-page tool reads the app's private decks, and the chart tool borrows an
image library from the app checkout. Turn the hooks on once per clone with
`git config core.hooksPath .githooks`.

- `.tools/gen-es-pt-word-pages.mjs`: rebuilds the Spanish and Portuguese
  printable Imposter word lists from the app's decks and checks them against
  each dealer's `words.json` (`--check` compares without writing).
- `.tools/render-party-charts.mjs`: draws the `/party-data/` chart images from
  the published CSV, and the press kit wordmarks, then rewrites the chart
  download lists on `/party-data/` and `/press/` so the file sizes match.
- `.githooks/pre-commit`: runs `.githooks/check-word-pages.mjs`, which refuses
  a commit that leaves either printable word list different from its dealer's
  `words.json`.
- `.githooks/pre-push`: refuses a push if the script on any one-line redirect
  page fails `node --check`.

## Preview locally

Run a simple static server from the repository root, then open
http://localhost:8000/:

```sh
python3 -m http.server 8000
```

It must run from the root, because pages link their CSS, scripts and images
with root-absolute paths (`/css/site.css`, `/js/generator.js`). Opening a file
straight from disk will not work either, as the Imposter dealer fetches its
`words.json`. A missing path shows the server's own error, not `404.html`.

## Licence and contact

The site code in this repository is not openly licensed. The one exception is
the data under `/party-data/` (the CSV and the charts), which is CC BY 4.0.

Questions, corrections and press: support@anticsapp.com.
