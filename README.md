# Orion Assistant — Embeddable AI Chat Widget

> Add a fully configured AI assistant to **any website** with one script tag.

📖 **[Full Integration Guide →](INTEGRATION.md)**  
> Developers bring their own OpenRouter API key. Zero backend required for basic usage.

---

## ✨ Features

- 🔌 **One-line embed** — one script tag, done
- 🎨 **Fully brandable** — name, color, persona, position
- 🧭 **Smart page routing** — bot detects intent and sends a redirect button to the right page
- 🧠 **Knowledge base** — teach the bot your FAQ without fine-tuning
- 💬 **Multi-turn memory** — remembers context within a conversation
- 📱 **Responsive** — works on desktop and mobile
- 🔒 **Developer's own API key** — you control your costs
- 🆓 **100% free** — open source MIT

---

## 🚀 Quickstart

```html
<script>
  window.OrionConfig = {
    apiKey:       "sk-or-v1-YOUR-KEY-HERE",
    botName:      "Orion",
    primaryColor: "#534AB7",
    systemPrompt: "You are a helpful assistant for MyWebsite.",
    pages: [
      { title: "Enroll Now",  url: "/enroll",  keywords: ["enroll", "register", "sign up"] },
      { title: "Pricing",     url: "/pricing", keywords: ["price", "cost", "fee"] },
      { title: "Contact Us",  url: "/contact", keywords: ["contact", "support"] }
    ],
    knowledgeBase: [
      { q: "What are your hours?", a: "Mon–Sat, 9am–6pm." }
    ]
  }
</script>
<script src="https://cdn.jsdelivr.net/gh/Rushadroomi/Orion-Assistant@main/orion.js"></script>
```

---

## 🧭 Smart Page Routing (v1.1)

When a user's question matches a page, Orion appends a clickable button to its reply:

```
User:  "How do I enroll?"
Orion: "You can sign up for the next batch starting June 9th!"
       [ Enroll Now ↗ ]        ← button auto-appended, links to /enroll
```

### How routing works — two layers

**Layer 1 — Claude decides:** The AI reads your `pages` list and decides when a redirect is genuinely helpful. It picks the right page automatically.

**Layer 2 — Keyword fallback:** If Claude doesn't route but the user's message contains a keyword match, the widget adds the button client-side. No extra API calls.

### Page entry format

```js
{
  title:    "Enroll Now",                           // Button label
  url:      "/enroll",                              // Absolute or relative URL
  keywords: ["enroll", "register", "sign up", "join"]  // Trigger words
}
```

---

## ⚙️ Full Config Reference

| Option           | Type              | Default              | Description                                          |
|------------------|-------------------|----------------------|------------------------------------------------------|
| `apiKey`         | string            | —                    | Your OpenRouter key `sk-or-v1-...` — use this OR `apiEndpoint` |
| `apiEndpoint`    | string            | —                    | Your Vercel proxy URL (secure/production mode)        |
| `model`          | string            | `"openrouter/free"`  | Any model slug from openrouter.ai/models              |
| `botName`        | string            | `"Orion"`            | Bot name shown in header and avatar                  |
| `subtitle`       | string            | `"Orion Assistant"`  | Tagline under bot name                               |
| `primaryColor`   | hex string        | `"#534AB7"`          | Accent color for header, bubbles, buttons            |
| `position`       | `"right"/"left"`  | `"right"`            | Corner where launcher appears                        |
| `systemPrompt`   | string            | Generic prompt       | Defines bot role, tone, and rules                    |
| `pages`          | `{title,url,keywords[]}[]` | `[]`    | Smart page routing entries                           |
| `knowledgeBase`  | `{q,a}[]`         | `[]`                 | FAQ pairs injected as context                        |
| `welcomeMessage` | string            | `"Hi! I'm Orion 👋"` | First message shown on open                          |
| `placeholder`    | string            | `"Type a message..."` | Input placeholder                                   |

---

## 🎨 Examples

### Bootcamp / EdTech

```js
window.OrionConfig = {
  apiKey: "sk-or-v1-YOUR-OPENROUTER-KEY",
  botName:      "LearnBot",
  primaryColor: "#6C63FF",
  systemPrompt: "You are LearnBot for AcademyX. Help visitors learn about courses, pricing, and enrollment. Be encouraging.",
  pages: [
    { title: "Browse Courses", url: "/courses", keywords: ["courses", "programs", "what do you offer"] },
    { title: "Enroll Now",     url: "/enroll",  keywords: ["enroll", "register", "join", "start"] },
    { title: "Pricing",        url: "/pricing", keywords: ["price", "cost", "fee", "how much"] },
    { title: "Schedule",       url: "/schedule",keywords: ["schedule", "dates", "when", "batch"] }
  ]
}
```

### E-commerce

```js
window.OrionConfig = {
  apiKey: "sk-or-v1-YOUR-OPENROUTER-KEY",
  botName:      "ShopBot",
  primaryColor: "#e63946",
  systemPrompt: "You are ShopBot for TrendStore. Help customers find products and understand our policies.",
  pages: [
    { title: "Shop Now",       url: "/shop",    keywords: ["buy", "shop", "products", "browse"] },
    { title: "Track Order",    url: "/orders",  keywords: ["order", "track", "shipping", "delivery"] },
    { title: "Returns",        url: "/returns", keywords: ["return", "refund", "exchange"] }
  ]
}
```

---

## 🔒 Security

**Client-side (simple):** Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys). API key visible in browser source — fine for prototypes and internal tools.

**Server-side proxy (recommended for production):**
```bash
cd proxy-server
OPENROUTER_API_KEY=sk-or-v1-... node server.js
# Or deploy to Vercel free: vercel deploy
# Set OPENROUTER_API_KEY = your OpenRouter key in Vercel env vars
```

---

## 📁 Project Structure

```
orion-assistant/
├── orion.js              ← The embeddable widget (ship this)
├── demo/
│   └── index.html        ← Developer docs + live demo
├── proxy-server/
│   ├── server.js         ← Node.js proxy (Railway / Render)
│   ├── package.json
│   └── api/
│       └── chat.js       ← Vercel serverless function
├── vercel.json
└── README.md
```

---

## 🌐 Hosting orion.js (free CDN via jsDelivr)

```bash
# Push to GitHub, then use:
https://cdn.jsdelivr.net/gh/Rushadroomi/Orion-Assistant@main/orion.js
```

---

## 📄 License

MIT — free for personal and commercial use.

---

Built with ❤️ using [OpenRouter](https://openrouter.ai) — access 100+ AI models with one API key.
