#!/bin/bash
# Local Lighthouse run (speed.md section A, command 2). Usage: .tools/lighthouse.sh <outdir> [base-url]
# Runs 4 pages x mobile/desktop, saves full JSON to <outdir>/raw and a summary to <outdir>/summary.json
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin:$PATH"
OUT="${1:?outdir}"; BASE="${2:-https://anticsapp.com}"
source ~/.nvm/nvm.sh >/dev/null 2>&1
export NODE_EXTRA_CA_CERTS=$HOME/.netskope-ca.pem
export CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$OUT/raw"
for pg in "/" "/never-have-i-ever-questions/" "/imposter-game/" "/play/"; do
  slug=$(echo "$pg" | sed 's#/#_#g; s#^_##; s#_$##'); [ -z "$slug" ] && slug=home
  for mode in mobile desktop; do
    f="$OUT/raw/$slug-$mode.json"
    if [ "$mode" = desktop ]; then extra="--preset=desktop"; else extra="--form-factor=mobile"; fi
    npx --yes lighthouse@12 "$BASE$pg" $extra --only-categories=performance,accessibility,best-practices,seo \
      --output=json --output-path="$f" --quiet \
      --chrome-flags="--headless=new --no-sandbox" >/dev/null 2>"$OUT/raw/$slug-$mode.err" && echo "ok $slug $mode" || echo "FAIL $slug $mode"
  done
done
