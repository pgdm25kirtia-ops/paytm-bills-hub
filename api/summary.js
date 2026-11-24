// Vercel serverless function: turns bill facts into a short AI summary with Gemini.
// The key is read from the GEMINI_API_KEY environment variable and never reaches the browser.
// Only amounts, dates and bill categories are sent: no names, numbers or IDs.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }
  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(503).json({ error: 'GEMINI_API_KEY is not set' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const facts = Array.isArray(body && body.facts) ? body.facts.filter(f => typeof f === 'string').slice(0, 6).map(f => f.slice(0, 300)) : [];
  if (!facts.length) { res.status(400).json({ error: 'No facts' }); return; }

  const prompt =
    'You write the AI summary card in a bill-payments app for an Indian student who pays her family’s bills.\n' +
    'Rewrite the facts below. Rules: use only these facts; keep every amount, percentage and day count exactly as given; ' +
    'plain, friendly English; no advice beyond the facts; Indian rupee symbol ₹.\n' +
    'Return JSON: {"short": one or two sentences, max 35 words, "points": 3 to 4 bullet strings, each max 25 words}.\n\nFacts:\n- ' +
    facts.join('\n- ');

  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
      })
    });
    if (!r.ok) { res.status(502).json({ error: 'Gemini error ' + r.status }); return; }
    const data = await r.json();
    const text = (((data.candidates || [])[0] || {}).content || {}).parts?.map(p => p.text || '').join('') || '';
    const out = JSON.parse(text);
    const points = Array.isArray(out.points) ? out.points.filter(p => typeof p === 'string').slice(0, 4) : [];
    if (!out.short || !points.length) { res.status(502).json({ error: 'Empty summary' }); return; }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ short: String(out.short), points });
  } catch (e) {
    res.status(502).json({ error: 'Summary failed' });
  }
};
