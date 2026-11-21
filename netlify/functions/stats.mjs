// Returns the stats summary for the private /stats.html page. Needs the STATS_KEY password.
// Finished days are summarised once and kept; today is worked out live.
import { getStore } from "@netlify/blobs";
import { aggregateDay, combine } from "../lib/agg.mjs";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

async function readEvents(store, day) {
  const { blobs } = await store.list({ prefix: `e/${day}/` });
  const out = [];
  for (let i = 0; i < blobs.length; i += 50) {
    const batch = await Promise.all(blobs.slice(i, i + 50).map((b) => store.get(b.key, { type: "json" }).catch(() => null)));
    out.push(...batch);
  }
  return out;
}

export default async (req) => {
  const key = (process.env.STATS_KEY || "").trim();
  if (!key) return json({ error: "Set STATS_KEY in Netlify first." }, 500);
  const given = decodeURIComponent(req.headers.get("x-stats-key") || "").trim();
  if (given !== key) return json({ error: "Wrong key. It's case-sensitive and must match STATS_KEY in Netlify exactly." }, 401);

  const n = Math.min(Math.max(parseInt(new URL(req.url).searchParams.get("days"), 10) || 7, 1), 90);
  const store = getStore("stats");
  const today = new Date().toISOString().slice(0, 10);

  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    let a = day < today ? await store.get(`agg/${day}`, { type: "json" }) : null;
    if (!a) {
      a = aggregateDay(await readEvents(store, day));
      if (day < today) await store.setJSON(`agg/${day}`, a);
    }
    days.push({ day, ...a });
  }

  return json({
    from: days[0].day,
    to: today,
    daily: days.map((d) => ({ day: d.day, views: d.views, visitors: d.visitors })),
    total: combine(days),
  });
};
