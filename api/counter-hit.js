export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const ns = url.searchParams.get('ns') || (req.query && req.query.ns);
    const key = url.searchParams.get('key') || (req.query && req.query.key);
    if (!ns || !key) {
      res.status(400).json({ error: 'missing ns or key' });
      return;
    }
    const upstream = `https://api.countapi.xyz/hit/${encodeURIComponent(ns)}/${encodeURIComponent(key)}`;
    const r = await fetch(upstream);
    if (!r.ok) {
      res.status(r.status).json({ error: 'upstream_error' });
      return;
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: 'FUNCTION_INVOCATION_FAILED' });
  }
}
