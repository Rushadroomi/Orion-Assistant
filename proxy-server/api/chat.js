/**
 * Orion Assistant — Vercel Proxy (OpenRouter) with Rate Limiting
 * Keeps your OpenRouter API key server-side.
 * Set OPENROUTER_API_KEY = your OpenRouter key in Vercel env vars.
 *
 * Rate limit: 10 messages per IP per day (resets at midnight UTC)
 *
 * Endpoint: POST /api/chat
 * Body: { model, messages, max_tokens }
 */

const https = require("https");

// ── In-memory rate limit store ────────────────────────────────────────
// Note: resets on each Vercel cold start, but good enough for demo protection
const rateLimitStore = {};
const MAX_REQUESTS   = 10;   // max messages per IP per day
const WINDOW_MS      = 24 * 60 * 60 * 1000; // 24 hours

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function checkRateLimit(ip) {
  const now  = Date.now();
  const entry = rateLimitStore[ip];

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    rateLimitStore[ip] = { count: 1, windowStart: now };
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (entry.count >= MAX_REQUESTS) {
    const resetIn = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000 / 60);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}

// ── OpenRouter request ────────────────────────────────────────────────
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

// ── Handler ───────────────────────────────────────────────────────────
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

  // ── Rate limit check ───────────────────────────────────────────────
  const ip    = getClientIP(req);
  const limit = checkRateLimit(ip);

  res.setHeader("X-RateLimit-Limit",     MAX_REQUESTS);
  res.setHeader("X-RateLimit-Remaining", limit.remaining);

  if (!limit.allowed) {
    res.status(429).json({
      error: {
        message: `Demo limit reached. You've used ${MAX_REQUESTS} free messages today. Come back tomorrow or add your own API key from openrouter.ai/keys to get unlimited access.`
      }
    });
    return;
  }

  // ── Proxy to OpenRouter ────────────────────────────────────────────
  try {
    const origin = req.headers["origin"] || req.headers["referer"] || "";
    const result = await openRouterRequest(req.body, origin);
    res.status(result.status).json(JSON.parse(result.body));
  } catch (err) {
    res.status(502).json({ error: { message: err.message } });
  }
};
