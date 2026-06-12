/**
 * proxy-server/api/config.js — Orion Assistant Server-Side Configuration
 * ─────────────────────────────────────────────────────────────────────────
 * Edit this file to change proxy/security behavior.
 * Never need to touch chat.js directly.
 */

module.exports = {

  // ── Rate limiting ──────────────────────────────────────────────────
  rateLimit: {
    maxRequests: 10,              // max messages per IP per time window
    windowMs:    24 * 60 * 60 * 1000,  // time window — 24 hours
    errorMessage: "Demo limit reached. You've used all your free messages for today. Come back tomorrow or add your own API key from openrouter.ai/keys for unlimited access."
  },

  // ── AI model ───────────────────────────────────────────────────────
  defaultModel:  "openrouter/free",  // fallback if client doesn't specify
  maxTokens:     1000,               // max tokens per response

  // ── CORS — allowed origins ─────────────────────────────────────────
  // "*" = allow all (fine for public widget)
  // ["https://mywebsite.com"] = restrict to specific domains
  allowedOrigins: "*",

  // ── Input validation ───────────────────────────────────────────────
  maxMessageLength: 500,      // reject messages longer than this
  maxHistoryLength: 10,       // only keep last N messages to save tokens

  // ── Security headers ───────────────────────────────────────────────
  referer: "https://orion-assistant.vercel.app",
  appTitle: "Orion Assistant"

};
