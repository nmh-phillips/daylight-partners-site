# Daylight Partners website

Live at https://daylightpartners.co.uk. Netlify deploys every push to `main` (publish directory `site`, no build command). Other branches get a deploy preview.

- `site/` – what Netlify publishes: pages, images, `_redirects`, the contact form thank-you page and the CFO Dashboard demo (`site/demo`).
- `source/pages/` – page designs (`*.dc.html`). Edit these, then regenerate the HTML:
  `python3 source/export.py source/pages site`
- `source/demo-build/` – rebuilds `site/demo` from the cfo-dashboard repo: `source/demo-build/build.sh ../cfo-dashboard`

## Website stats

Private page at `/stats.html` (password = the `STATS_KEY` environment variable in Netlify). Every page loads `site/t.js`, which sends anonymous page views, time on page, scroll depth and key clicks to `netlify/functions/track.mjs`; events are kept in Netlify Blobs (store `stats`). `netlify/functions/stats.mjs` summarises them (logic in `netlify/lib/agg.mjs`). No cookies; the visitor ID is a daily-rotating hash of IP + browser, so nothing personal is stored. Optional `STATS_SALT` env var adds a secret to that hash.

Daylight Partners is a trading name of NMH Phillips Consulting Ltd (company no. 15011269).
