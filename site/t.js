// Daylight Partners: anonymous usage stats. No cookies, nothing stored about visitors.
(function () {
  try {
    try { if (localStorage.getItem("dp_ignore") === "1") return; } catch (e) {}
    if (navigator.webdriver) return;
    var URL_ = "/.netlify/functions/track";
    var send = function (d) {
      var b = JSON.stringify(d);
      if (navigator.sendBeacon && navigator.sendBeacon(URL_, new Blob([b], { type: "application/json" }))) return;
      try { fetch(URL_, { method: "POST", body: b, keepalive: true, headers: { "content-type": "application/json" } }); } catch (e) {}
    };
    var path = location.pathname.replace(/\/index\.html$/, "/") || "/";
    var ref = "";
    try {
      if (document.referrer) {
        var r = new URL(document.referrer);
        if (r.hostname !== location.hostname) ref = r.hostname.replace(/^www\./, "");
      }
    } catch (e) {}
    var q = new URLSearchParams(location.search);
    var w = window.innerWidth;
    send({ t: "view", p: path, r: ref, s: q.get("utm_source") || q.get("ref") || "", d: w < 700 ? "mobile" : w < 1100 ? "tablet" : "desktop" });

    // Key actions
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a, button") : null;
      if (!a) return;
      var h = a.getAttribute("href") || "", k = "";
      if (h.indexOf("calendar.app.google") > -1) k = "Book a call";
      else if (h.indexOf("mailto:") === 0) k = "Email link";
      else if (h.indexOf("/demo") === 0) k = "Opened the demo";
      else if (h.indexOf("linkedin.com") > -1) k = "LinkedIn";
      else if (a.tagName === "BUTTON" && a.form && a.form.id === "contact-form") k = "Contact form sent";
      if (k) send({ t: "click", p: path, k: k });
    }, true);

    // Time on page and how far down people scroll
    var doc = document.documentElement, maxS = 0;
    var measure = function () { var s = (doc.scrollTop + window.innerHeight) / Math.max(doc.scrollHeight, 1); if (s > maxS) maxS = s; };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    var t0 = Date.now(), done = false;
    var leave = function () {
      if (done) return;
      done = true;
      send({ t: "leave", p: path, ms: Math.min(Date.now() - t0, 1800000), sc: Math.round(Math.min(maxS, 1) * 100) });
    };
    window.addEventListener("pagehide", leave);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") leave(); });
  } catch (e) {}
})();
