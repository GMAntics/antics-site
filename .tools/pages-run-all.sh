#!/bin/bash
# PAGES builder (7 Nov 2026): re-run every scripted page edit, in order, then the gates. Safe to run any number of times
# (each script is idempotent: a second run prints "0 changed"). Run from anywhere; it works on the worktree it lives in.
# After a rebase onto pages other work added: run this, then `python3 .tools/gates.py --base origin/main`.
set -e
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin:$PATH"
source ~/.nvm/nvm.sh >/dev/null 2>&1 || true
cd "$(dirname "$0")/.."
node .tools/head-font.mjs        # A11 head: Google font links -> preload, color-scheme meta
node .tools/main-skip.mjs        # A25: <main id="main">, skip link
node .tools/landmarks.mjs        # review A11Y-4, P-7: breadcrumb before <main>, site footer after it (after main-skip)
node .tools/h1-nbsp.mjs          # A24, revised for review P-5 and IT-10: nowrap span, H1 text bytes unchanged
node .tools/crumb-glue.mjs       # review IT-14: each separator glued to the crumb after it
node .tools/wl-draw-scroll.mjs   # A23
node .tools/drinking-table.mjs   # A10 (markup half)
node .tools/inline-sync.mjs      # integrator: index.html and play/ font, tokens re-synced from css/site.css, comments out
node .tools/deal-js-tag.mjs      # integrator: <script src="/js/deal.js" defer> on tier-card / cta-block / installbar pages
node .tools/suffix-nowrap.mjs    # 8 Nov 2026: Polish word(-am) and Spanish word/a forms in <span class="nw">, text bytes unchanged
echo "--- gates"
python3 .tools/gates.py "$@"
