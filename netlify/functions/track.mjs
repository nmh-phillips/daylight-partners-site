// Records one anonymous event (page view, time on page, or a key click).
// No cookies and nothing stored on the visitor's device. The visitor ID is a one-way hash
// of IP address + browser + the date, so it changes every day and can't be traced back.
import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|headless|lighthouse|pingdom|monitor|curl|wget|python-requests/i;
const DEVICES = ["mobile", "tablet", "desktop"];
const clean = (s, n) => String(s ?? "").slice(0, n).replace(/[^\w\-./: @+]/g, "");

export default async (req, context) => {
  if (req.method !== "POST") return new Response(null, { status: 405 });
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

  let d;
  try {
    d = JSON.parse(await req.text());
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!["view", "leave", "click"].includes(d?.t)) return new Response(null, { status: 204 });

  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  const salt = (process.env.STATS_SALT || "daylight") + day;
  const v = createHash("sha256").update(`${salt}|${context.ip || ""}|${ua}`).digest("hex").slice(0, 16);

  const ev = { t: d.t, v, p: clean(d.p, 80) || "/", ts: now };
  if (d.t === "view") {
    ev.r = clean(d.r, 60);
    ev.s = clean(d.s, 40);
    ev.d = DEVICES.includes(d.d) ? d.d : "";
    ev.c = clean(context.geo?.country?.code, 2);
  } else if (d.t === "leave") {
    ev.ms = Math.max(0, Math.min(Number(d.ms) || 0, 30 * 60 * 1000));
    ev.sc = Math.max(0, Math.min(Number(d.sc) || 0, 100));
  } else {
    ev.k = clean(d.k, 30);
  }

  await getStore("stats").setJSON(`e/${day}/${now}-${Math.random().toString(36).slice(2, 8)}`, ev);
  return new Response(null, { status: 204 });
};
