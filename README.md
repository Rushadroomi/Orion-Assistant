# Orion Assistant — Embeddable AI Chat Widget

> Add a fully working AI assistant to **any website** in 2 minutes.  
> Developers bring their own free API key. No backend required.

## 🚀 Live Demo
👉 [Try Orion Assistant](https://orion-assistant-khaki.vercel.app)

---

## ⚡ Quickstart — 2 steps

### Step 1 — Get a free API key
Go to **[openrouter.ai/keys](https://openrouter.ai/keys)** → sign up free → copy your key.  
No credit card needed. Free models available instantly.

### Step 2 — Paste this into your HTML before `</body>`

```html
<script>
  window.OrionConfig = {
    apiKey:       "sk-or-v1-YOUR-KEY-HERE",
    botName:      "MyBot",
    primaryColor: "#534AB7",
    systemPrompt: "You are a helpful assistant for MyWebsite. Answer questions clearly.",
    pages: [
      { title: "Home",     url: "/",        keywords: ["home"] },
      { title: "About",    url: "/about",   keywords: ["about", "who are you"] },
      { title: "Pricing",  url: "/pricing", keywords: ["price", "cost", "fee", "how much"] },
      { title: "Contact",  url: "/contact", keywords: ["contact", "support", "help"] }
    ],
    knowledgeBase: [
      { q: "What do you offer?",      a: "We offer amazing products and services." },
      { q: "How can I contact you?",  a: "Email us at hello@mywebsite.com" }
    ]
  }
</script>
<script src="https://cdn.jsdelivr.net/gh/Rushadroomi/Orion-Assistant@main/orion.js"></script>
```

**That's it. ✅** A chat bubble appears in the bottom-right corner of your website.

---

## 🧭 Smart Page Routing

When a user asks something relevant, Orion automatically shows a button that takes them to the right page — no extra code needed.

```
User:  "How much does it cost?"
Orion: "Our plans start at $49/month..."
       [ Pricing ↗ ]   ← button appears automatically
```

Just add your pages to the `pages` array and Orion handles the rest.

---

## ⚙️ All Config Options

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | string | — | Your OpenRouter key (client-side mode) |
| `apiEndpoint` | string | — | Your proxy URL (secure mode — see below) |
| `model` | string | `"openrouter/free"` | Any model from openrouter.ai/models |
| `botName` | string | `"Orion"` | Bot name shown in header |
| `subtitle` | string | `"Orion Assistant"` | Tagline under bot name |
| `primaryColor` | hex | `"#534AB7"` | Accent color for the widget |
| `position` | `"right"/"left"` | `"right"` | Corner where the bubble appears |
| `systemPrompt` | string | Generic prompt | Bot personality and rules |
| `pages` | `{title, url, keywords[]}[]` | `[]` | Smart page routing entries |
| `knowledgeBase` | `{q, a}[]` | `[]` | FAQ pairs injected as context |
| `welcomeMessage` | string | `"Hi! I'm Orion 👋"` | First message on open |
| `placeholder` | string | `"Type a message..."` | Input placeholder |

---

## 🎨 Customization Examples

### Change color and position
```js
primaryColor: "#e63946",  // any hex color
position:     "left",     // bottom-left corner
```

### E-commerce store
```js
window.OrionConfig = {
  apiKey:       "sk-or-v1-YOUR-KEY",
  botName:      "ShopBot",
  primaryColor: "#e63946",
  systemPrompt: "You are ShopBot. Help customers find products and understand our return policy.",
  pages: [
    { title: "Shop Now",    url: "/shop",    keywords: ["buy", "shop", "browse"] },
    { title: "Track Order", url: "/orders",  keywords: ["order", "track", "shipping"] },
    { title: "Returns",     url: "/returns", keywords: ["return", "refund", "exchange"] }
  ]
}
```

### School or university
```js
window.OrionConfig = {
  apiKey:       "sk-or-v1-YOUR-KEY",
  botName:      "CampusBot",
  primaryColor: "#1a3a5c",
  systemPrompt: "You are CampusBot. Help students with admissions, courses, and campus info.",
  pages: [
    { title: "Apply Now",   url: "/apply",   keywords: ["apply", "admission", "enroll"] },
    { title: "Courses",     url: "/courses", keywords: ["courses", "programs", "study"] },
    { title: "Contact",     url: "/contact", keywords: ["contact", "help", "support"] }
  ]
}
```

---

## 🔒 Secure Mode (Production)

By default the API key is visible in browser source. Fine for prototypes and internal tools.

For public websites, deploy the included proxy server — your key stays server-side.

### Deploy proxy to Vercel (free)

```bash
# 1. Fork this repo on GitHub
# 2. Go to vercel.com → New Project → Import your fork
# 3. Deploy
# 4. Go to Settings → Environment Variables → add:
#    OPENROUTER_API_KEY = sk-or-v1-your-key   (mark as Sensitive)
# 5. Redeploy
```

### Use your proxy in the widget

```html
<script>
  window.OrionConfig = {
    apiEndpoint:  "https://YOUR-PROJECT.vercel.app/api/chat",  // no apiKey needed
    botName:      "MyBot",
    systemPrompt: "You are a helpful assistant.",
    pages: [...]
  }
</script>
<script src="https://cdn.jsdelivr.net/gh/Rushadroomi/Orion-Assistant@main/orion.js"></script>
```

Your API key is now 100% hidden. ✅

---

## 📁 Project Structure

```
orion-assistant/
├── orion.js              ← The widget (developers load this via CDN)
├── demo/
│   └── index.html        ← Live docs + demo page
├── proxy-server/
│   ├── server.js         ← Node.js proxy (Railway / Render)
│   ├── package.json
│   └── api/
│       └── chat.js       ← Vercel serverless function (with rate limiting)
├── vercel.json
└── README.md
```

---

## 📄 License

MIT — free for personal and commercial use.

---

Built with ❤️ using [OpenRouter](https://openrouter.ai) — access 100+ AI models with one free API key.
