/**
 * Orion Assistant Proxy Server
 * ─────────────────────────────────────────────
 * Use this when you want to keep the OpenRouter API key server-side
 * (recommended for public-facing production websites).
 *
 * The developer sets their API key as an environment variable.
 * The widget calls /api/chat instead of the Anthropic API directly.
 *
 * Deploy free on:  Railway · Render · Fly.io · Vercel (see vercel.json)
 *
 * Local run:
 *   npm install
 *   OPENROUTER_API_KEY=sk-or-v1-... node server.js
 */

const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENROUTER_API_KEY || "";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*"; // e.g. "https://mywebsite.com"

// ── CORS helper ───────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Proxy to Anthropic ────────────────────────────────────────────────────────
function proxyToAnthropic(body, res) {
  if (!API_KEY) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "OPENROUTER_API_KEY not set on server." } }));
    return;
  }

  const postData = JSON.stringify(body);
  const options = {
    hostname: "openrouter.ai",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = "";
    apiRes.on("data", (chunk) => (data += chunk));
    apiRes.on("end", () => {
      res.writeHead(apiRes.statusCode, { "Content-Type": "application/json" });
      res.end(data);
    });
  });

  apiReq.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Upstream error: " + err.message } }));
  });

  apiReq.write(postData);
  apiReq.end();
}

// ── Static file server (serves orion.js + demo/) ───────────────────────────
function serveStatic(reqPath, res) {
  const safePath = path.join(__dirname, reqPath === "/" ? "/demo/index.html" : reqPath);
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.readFile(safePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(safePath);
    const mime = { ".html":"text/html", ".js":"application/javascript", ".css":"text/css" };
    res.writeHead(200, { "Content-Type": mime[ext] || "text/plain" });
    res.end(data);
  });
}

// ── Main server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const { pathname } = url.parse(req.url);

  // API proxy endpoint
  if (pathname === "/api/chat" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        proxyToAnthropic(parsed, res);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { message: "Invalid JSON body." } }));
      }
    });
    return;
  }

  // Serve static files
  serveStatic(pathname, res);
});

server.listen(PORT, () => {
  console.log(`\n Orion Assistant Proxy Server running on http://localhost:${PORT}`);
  console.log(` API key: ${API_KEY ? "✓ set" : "✗ MISSING — set OPENROUTER_API_KEY"}`);
  console.log(` Allowed origin: ${ALLOWED_ORIGIN}\n`);
});
