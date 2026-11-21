// Turns one day's raw events into a summary. Pure functions, so they can be tested without Netlify.

const inc = (o, k, n = 1) => {
  if (!k) return;
  o[k] = (o[k] || 0) + n;
};

/** Summarise one day's events. */
export function aggregateDay(events) {
  const a = {
    views: 0,
    visitors: 0,
    pages: {}, // path -> { views, ms, leaves, sc }
    refs: {}, // referring site -> views
    sources: {}, // utm_source / ref -> views
    countries: {},
    devices: {},
    clicks: {}, // action -> count
    entries: {}, // first page seen by each visitor -> count
  };
  const seen = new Set();
  const firstView = new Map(); // visitor -> earliest view event
  for (const e of events) {
    if (!e || !e.t) continue;
    if (e.t === "view") {
      a.views++;
      seen.add(e.v);
      const p = (a.pages[e.p] ||= { views: 0, ms: 0, leaves: 0, sc: 0 });
      p.views++;
      inc(a.refs, e.r || "Direct / unknown");
      inc(a.sources, e.s);
      inc(a.countries, e.c);
      inc(a.devices, e.d);
      const f = firstView.get(e.v);
      if (!f || e.ts < f.ts) firstView.set(e.v, e);
    } else if (e.t === "leave") {
      const p = (a.pages[e.p] ||= { views: 0, ms: 0, leaves: 0, sc: 0 });
      p.ms += e.ms || 0;
      p.sc += e.sc || 0;
      p.leaves++;
    } else if (e.t === "click") {
      inc(a.clicks, e.k);
    }
  }
  a.visitors = seen.size;
  for (const e of firstView.values()) inc(a.entries, e.p);
  return a;
}

/** Add several day summaries together. Visitors are counted per day (the visitor ID changes daily). */
export function combine(days) {
  const t = { views: 0, visitors: 0, pages: {}, refs: {}, sources: {}, countries: {}, devices: {}, clicks: {}, entries: {} };
  for (const d of days) {
    t.views += d.views;
    t.visitors += d.visitors;
    for (const k of ["refs", "sources", "countries", "devices", "clicks", "entries"]) {
      for (const [x, n] of Object.entries(d[k] || {})) inc(t[k], x, n);
    }
    for (const [p, s] of Object.entries(d.pages || {})) {
      const q = (t.pages[p] ||= { views: 0, ms: 0, leaves: 0, sc: 0 });
      q.views += s.views;
      q.ms += s.ms;
      q.leaves += s.leaves;
      q.sc += s.sc;
    }
  }
  return t;
}
