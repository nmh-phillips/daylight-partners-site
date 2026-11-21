# Daylight Partners website

Live at https://daylightpartners.co.uk. Netlify deploys every push to `main` (publish directory `site`, no build command). Other branches get a deploy preview.

- `site/` – what Netlify publishes: pages, images, `_redirects`, the contact form thank-you page and the CFO Dashboard demo (`site/demo`).
- `source/pages/` – page designs (`*.dc.html`). Edit these, then regenerate the HTML:
  `python3 source/export.py source/pages site`
- `source/demo-build/` – rebuilds `site/demo` from the cfo-dashboard repo: `source/demo-build/build.sh ../cfo-dashboard`

Daylight Partners is a trading name of NMH Phillips Consulting Ltd (company no. 15011269).
