module.exports = async (req, res) => {
  try {
    const { ns, key } = req.query || {};
    if (!ns || !key) {
      res.status(400).json({ error: 'missing ns or key' });
      return;
    }
    const r = await fetch(`https://api.countapi.xyz/get/${encodeURIComponent(ns)}/${encodeURIComponent(key)}`);
    if (!r.ok) {
      res.status(r.status).json({ error: 'upstream_error' });
      return;
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'bad_gateway' });
  }
};
