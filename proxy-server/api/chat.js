/**
 * Vercel Serverless Function — Orion Assistant API Proxy
 * ─────────────────────────────────────────────
 * Deploy to Vercel for free. Set ANTHROPIC_API_KEY in Vercel env vars.
 *
 * File location: /api/chat.js
 * Endpoint URL:  https://your-project.vercel.app/api/chat
 */

const https = require("https");

function anthropicRequest(body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: { message: "ANTHROPIC_API_KEY not configured." } });
    return;
  }

  try {
    const result = await anthropicRequest(req.body);
    res.status(result.status).json(JSON.parse(result.body));
  } catch (err) {
    res.status(502).json({ error: { message: err.message } });
  }
};
