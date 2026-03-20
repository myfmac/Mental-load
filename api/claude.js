export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'x-api-key': apiKey },
      body: JSON.stringify(req.body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    if (error.name === 'AbortError') return res.status(504).json({ error: 'Request timed out — try a shorter list' });
    return res.status(500).json({ error: error.message });
  }
}
