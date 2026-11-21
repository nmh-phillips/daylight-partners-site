import re, sys, pathlib, html

src = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
BASE = "https://daylightpartners.co.uk"

names = {
    "Main.dc.html": "index.html",
    "FractionalCFO.dc.html": "fractional-cfo.html",
    "RaiseReady.dc.html": "raise-ready.html",
    "AIFinance.dc.html": "automated-solutions.html",
    "Operations.dc.html": "operations.html",
    "About.dc.html": "team.html",
    "Contact.dc.html": "contact.html",
    "Privacy.dc.html": "privacy.html",
}
desc = {
    "index.html": "Fractional CFO and fundraising support for UK SMEs and startups, from an ICAEW Chartered Accountant who has raised from £325k to a £30M Series B.",
    "fractional-cfo.html": "Fractional and interim CFO services: finance function builds, KPIs, board reporting, cash management and fundraising. Retainers from £3,500 a month.",
    "raise-ready.html": "Investor-ready financial model, deck numbers and data room checklist in 5–15 days, reviewed by a CFO who has helped raise £32M+. Fixed fees from £2,000.",
    "automated-solutions.html": "Finance automation and a live CFO dashboard for UK SMEs and scale-ups: faster month-end, automated board reporting and 13-week cash forecasting, signed off by a chartered CFO.",
    "operations.html": "Operations and systems support for growing businesses: revenue operations, CRM, billing and collections, back-office systems and compliance.",
    "team.html": "Meet the Daylight Partners team: senior finance and operations leaders with Big Four, AIG, Liberty Mutual and BNY Mellon backgrounds.",
    "contact.html": "Arrange a 20-minute call with Neil Phillips, fractional CFO, about finance leadership or fundraising.",
    "privacy.html": "How Daylight Partners handles personal data submitted through this website.",
}
ACCENT = "#E2B04A"

for s, d in names.items():
    t = (src / s).read_text(encoding="utf-8")
    title = re.search(r"<title>(.*?)</title>", t).group(1)
    url = BASE + ("/" if d == "index.html" else "/" + d)
    helmet = re.search(r"<helmet>(.*?)</helmet>", t, re.S).group(1)
    t = re.sub(r"<helmet>.*?</helmet>\n?", "", t, flags=re.S)
    meta = (
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f'<meta name="description" content="{html.escape(desc[d])}">\n'
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'
        f'<link rel="canonical" href="{url}">\n'
        '<meta property="og:type" content="website">\n'
        f'<meta property="og:title" content="{html.escape(title)}">\n'
        f'<meta property="og:description" content="{html.escape(desc[d])}">\n'
        f'<meta property="og:url" content="{url}">\n'
        f'<meta property="og:image" content="{BASE}/og-image.png">\n'
        '<meta name="twitter:card" content="summary_large_image">'
    )
    t = t.replace('<script src="./support.js"></script>', meta + helmet.rstrip())
    t = t.replace("<x-dc>\n", "").replace("</x-dc>\n", "")
    t = re.sub(r'<script type="text/x-dc".*?</script>\n', "", t, flags=re.S)
    t = t.replace("{{accent}}", ACCENT)
    for a, b in names.items():
        t = t.replace(f'href="{a}', 'href="/' if b == "index.html" else f'href="/{b}')
    if s == "Contact.dc.html":
        t = t.replace('<form id="contact-form" style=',
                      '<form id="contact-form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" action="/thanks.html" style=', 1)
        t = t.replace('<div style="display: flex; flex-direction: column; gap: 6px"><label for="c-name"',
                      '<input type="hidden" name="form-name" value="contact"><p hidden><label>Leave blank <input name="bot-field"></label></p>\n<div style="display: flex; flex-direction: column; gap: 6px"><label for="c-name"', 1)
        assert 'data-netlify="true"' in t
    for bid, fn in {"6ad17c91ef71be2f4e50fa42764becc3":"dash-overview.jpg","7275afc7c65aa5a5cc999fbf24f8031c":"dash-board-report.jpg","b67b8ebdafdbacca09e5c370c1915546":"dash-close.jpg","6c4825e09504b090b804fffd1b73f25d":"dash-receivables.jpg","16344e1ac09a2ddaf68d22abffded299":"dash-pipeline.jpg"}.items():
        t = t.replace("/_blob/" + bid, "/img/" + fn)
    t = t.replace("https://claude.ai/artifact/4gmLzVyT45wxxr2EtQjNyQ", "/demo/")
    t = t.replace("/_blob/6a74b75bd3eb27f060dfd9c7e3d0c920", "/neil-phillips.jpg").replace("/_blob/b9ca1c2c973032db66e59e75717734c8", "/john-monahan.jpg")
    assert "{{" not in t and "dc.html" not in t and "x-dc" not in t and "_blob" not in t, d
    (out / d).write_text(t, encoding="utf-8")
    print("wrote", d)
