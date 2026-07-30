# DeepL API — card translations (future consideration)

_Internal planning note, not site content. Parked 2026-07-30._

## What's new (January 2026 DeepL API release)

- **81 new languages** added to the translation API (previously ~30).
- **Style rules + custom instructions**: reusable rules applied to every call —
  e.g. "informal tone", "keep it cheeky", "never translate game names like
  Ring of Fire / Waterfall / Thumb Master". This is the feature that matters
  most for card copy, which is slangy and tone-sensitive.
- **Translation memory**: consistent output for phrases repeated across cards.
- **Voice API** (Feb 2026, real-time speech) — not relevant to cards.

Docs: https://developers.deepl.com/docs/resources/roadmap-and-release-notes

## Two distinct possible projects

1. **App card decks** (lives in the app repo, not this one):
   batch script runs DeepL over the deck JSON/strings → outputs localized
   decks for human review. Needs the app repo attached to a session.
2. **Localized site guides** (this repo): build-time script translates the
   guide pages and generates static localized pages, e.g.
   `/es/ring-of-fire-rules/`, with proper `hreflang` tags for SEO.

## Constraints / caveats

- Must run **build-time / offline** — a static site cannot call DeepL from the
  browser without exposing the API key.
- UK slang + culturally specific card names will trip up raw MT. Use a
  glossary for game terms + style rules, and budget a **native-speaker pass**
  before shipping anything.
- DeepL free tier: 500k characters/month — likely enough for a first pass over
  the site guides; paid tier if we do full decks in many languages.

## Next step when picked up

Decide which project (or both), pick target languages by market priority
(likely ES / DE / FR / NL first for the party-game market), then scope the
script.
