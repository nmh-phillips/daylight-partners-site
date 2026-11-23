#!/usr/bin/env bash
# Rebuilds site/demo from the cfo-dashboard repo as a single static page with hash navigation.
# Usage: source/demo-build/build.sh /path/to/cfo-dashboard
set -euo pipefail
DASH="$1"; HERE="$(cd "$(dirname "$0")" && pwd)"; SITE="$HERE/../../site"; B="$(mktemp -d)"
cp -r "$DASH"/{app,client,components,lib,package.json,package-lock.json,tsconfig.json} "$B"/
(cd "$B" && rm -rf app/api app/auth app/login && find app -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} + )
cp "$HERE/page.tsx" "$B/app/page.tsx"; cp "$HERE/next.config.ts" "$B/next.config.ts"
# Public demo footer uses the trading name.
grep -rl "Prepared by NMH Phillips Consulting Ltd" "$B/components" | xargs -r sed -i 's/Prepared by NMH Phillips Consulting Ltd/Prepared by Daylight Partners/'
(cd "$B" && npm ci --silent && npx next build)
rm -rf "$SITE/demo"; mkdir -p "$SITE/demo"
cp "$B/out/index.html" "$SITE/demo/"; cp -r "$B/out/_next" "$SITE/demo/nx"
sed -i 's#\./_next/#./nx/#g; s#"/_next/#"./nx/#g' "$SITE/demo/index.html"
grep -rl '_next/' "$SITE/demo/nx" | xargs -r sed -i 's#"\./_next/"#"./nx/"#g; s#/_next/#/nx/#g'
sed -i 's#</head>#<script defer src="/t.js"></script></head>#' "$SITE/demo/index.html"
echo "Demo rebuilt in site/demo"
