/**
 * Orion Assistant — Vercel Proxy (OpenRouter)
 * Keeps your OpenRouter API key server-side.
 * Set OPENROUTER_API_KEY = your OpenRouter key in Vercel env vars.
 *
 * Endpoint: POST /api/chat
 * Body: { model, messages, max_tokens }
 */

const https = require("https");

function openRouterRequest(body, origin) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model:      body.model || "openrouter/free",
      max_tokens: body.max_tokens || 1000,
      messages:   body.messages
    });

    const options = {
      hostname: "openrouter.ai",
      path:     "/api/v1/chat/completions",
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "Authorization":  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":   origin || "https://orion-assistant.vercel.app",
        "X-Title":        "Orion Assistant"
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", c => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

module.exports = async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST")    { res.status(405).json({ error: "Method not allowed" }); return; }

  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: { message: "API key not configured on server." } });
    return;
  }

  try {
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    const result = await openRouterRequest(req.body, origin);
    res.status(result.status).json(JSON.parse(result.body));
  } catch (err) {
    res.status(502).json({ error: { message: err.message } });
  }
};
