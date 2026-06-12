/**
 * Orion Assistant — Vercel Proxy
 * All settings are in config.js — edit that file, not this one.
 *
 * Set OPENROUTER_API_KEY in Vercel environment variables.
 * Endpoint: POST /api/chat
 */

const https  = require("https");
const config = require("./config");

// ── Rate limit store (in-memory) ──────────────────────────────────────
const rateLimitStore = {};

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function checkRateLimit(ip) {
  const now   = Date.now();
  const entry = rateLimitStore[ip];
  const { maxRequests, windowMs } = config.rateLimit;

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore[ip] = { count: 1, windowStart: now };
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (entry.count >= maxRequests) {
    const resetIn = Math.ceil((windowMs - (now - entry.windowStart)) / 60000);
    return { allowed: false, remaining: 0, resetIn };
  }
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// ── OpenRouter request ────────────────────────────────────────────────
function openRouterRequest(body, origin) {
  return new Promise((resolve, reject) => {

    // Trim history to max length
    const messages = body.messages || [];
    const trimmed  = messages.length > config.maxHistoryLength
      ? messages.slice(messages.length - config.maxHistoryLength)
      : messages;

    const postData = JSON.stringify({
      model:      body.model || config.defaultModel,
      max_tokens: config.maxTokens,
      messages:   trimmed
    });

    const options = {
      hostname: "openrouter.ai",
      path:     "/api/v1/chat/completions",
      method:   "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "Authorization":  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":   origin || config.referer,
        "X-Title":        config.appTitle
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

// ── Main handler ──────────────────────────────────────────────────────
module.exports = async function handler(req, res) {

  // CORS
  const origin = req.headers["origin"] || req.headers["referer"] || "";
  res.setHeader("Access-Control-Allow-Origin",  config.allowedOrigins);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "POST")    { res.status(405).json({ error: "Method not allowed" }); return; }

  // API key check
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({ error: { message: "API key not configured on server." } });
    return;
  }

  // Input length check
  const messages = req.body?.messages || [];
  const lastMsg  = messages[messages.length - 1]?.content || "";
  if (lastMsg.length > config.maxMessageLength) {
    res.status(400).json({ error: { message: `Message too long. Max ${config.maxMessageLength} characters.` } });
    return;
  }

  // Rate limit
  const ip    = getClientIP(req);
  const limit = checkRateLimit(ip);
  res.setHeader("X-RateLimit-Limit",     config.rateLimit.maxRequests);
  res.setHeader("X-RateLimit-Remaining", limit.remaining);

  if (!limit.allowed) {
    res.status(429).json({ error: { message: config.rateLimit.errorMessage } });
    return;
  }

  // Proxy to OpenRouter
  try {
    const result = await openRouterRequest(req.body, origin);
    res.status(result.status).json(JSON.parse(result.body));
  } catch (err) {
    res.status(502).json({ error: { message: err.message } });
  }
};
