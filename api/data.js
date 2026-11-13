// Backend (Vercel serverless function): GET /api/data
// Fetches hourly PM2.5 and wind from Open-Meteo, computes the summary statistics,
// and returns JSON. Responses are cached at Vercel's edge for one hour.

const CITIES = [
  { name: 'Solapur',   lat: 17.6599, lon: 75.9064 },
  { name: 'Pune',      lat: 18.5204, lon: 73.8567 },
  { name: 'Mumbai',    lat: 19.0760, lon: 72.8777 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Delhi',     lat: 28.6139, lon: 77.2090 },
];
const CFG = {
  start: '2026-10-25', end: '2026-11-13',
  baseline: ['2026-10-25', '2026-11-01'],   // quiet days before the festival
  window: ['2026-11-07', '2026-11-09'],     // Choti Diwali to the day after Lakshmi Puja
  nights: ['2026-11-08', '2026-11-09'],
  limit: 60,                                // India 24-hour PM2.5 standard, ug/m3 (reference only)
};

const inR = (t, r) => { const d = t.slice(0, 10); return d >= r[0] && d <= r[1]; };
const pick = (c, key, r) =>
  c.time.map((t, i) => (inR(t, r) && c[key] && c[key][i] != null ? c[key][i] : null)).filter(v => v !== null);
const mean = a => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
const num = v => (Number.isFinite(v) ? v : null);   // NaN is not valid JSON

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Open-Meteo responded ${r.status}`);
  return r.json();
}

function stats(c) {
  const bm = mean(pick(c, 'pm', CFG.baseline)), w = pick(c, 'pm', CFG.window);
  const wm = mean(w);
  let peak = null, pt = '';
  c.time.forEach((t, i) => {
    if (inR(t, CFG.window) && c.pm[i] != null && (peak === null || c.pm[i] > peak)) { peak = c.pm[i]; pt = t; }
  });
  return {
    bm: num(bm), wm: num(wm), pct: num(((wm - bm) / bm) * 100), peak, pt,
    hrs: w.filter(v => v > CFG.limit).length,
    wb: num(mean(pick(c, 'wind', CFG.baseline))), ww: num(mean(pick(c, 'wind', CFG.window))),
  };
}

async function loadCity(c) {
  const ll = `latitude=${c.lat}&longitude=${c.lon}`;
  const range = `&timezone=Asia%2FKolkata&start_date=${CFG.start}&end_date=${CFG.end}`;
  const aq = await getJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?${ll}&hourly=pm2_5${range}`);
  const out = { name: c.name, lat: c.lat, lon: c.lon, time: aq.hourly.time, pm: aq.hourly.pm2_5, wind: null };
  try {   // wind is a bonus: if it fails, the rest still works
    const w = await getJSON(`https://api.open-meteo.com/v1/forecast?${ll}&hourly=wind_speed_10m${range}`);
    const m = {};
    w.hourly.time.forEach((t, i) => { m[t] = w.hourly.wind_speed_10m[i]; });
    out.wind = out.time.map(t => (m[t] != null ? m[t] : null));
  } catch (e) { /* leave wind as null */ }
  out.stats = stats(out);
  return out;
}

module.exports = async (req, res) => {
  try {
    const cities = await Promise.all(CITIES.map(loadCity));
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({
      meta: { ...CFG, retrievedAt: new Date().toISOString(), source: 'Open-Meteo (CAMS model output), CC BY 4.0' },
      cities,
    });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
};
