# Orion Assistant — Embeddable AI Chat Widget

> Add a fully configured AI assistant to **any website** with one script tag.  
> Developers bring their own Anthropic API key. Zero backend required for basic usage.

![Orion Assistant Demo](demo/preview.png)

---

## ✨ Features

- 🔌 **One-line embed** — paste a script tag, done
- 🎨 **Fully brandable** — name, color, persona, position
- 🧠 **Knowledge base** — teach the bot your FAQ without fine-tuning
- 💬 **Multi-turn memory** — remembers context within the conversation
- 📱 **Responsive** — works on desktop and mobile
- 🔒 **Developer's own API key** — you control your costs and usage
- 🆓 **100% free to use** — open source MIT license

---

## 🚀 Quickstart (2 minutes)

### 1. Get your Anthropic API key

Sign up at [console.anthropic.com](https://console.anthropic.com) — new accounts get free credits.

### 2. Add to your website

Paste this before `</body>` in your HTML:

```html
<script>
  window.OrionConfig = {
    apiKey:        "sk-ant-api03-YOUR-KEY-HERE",
    botName:       "MyBot",
    subtitle:      "Ask me anything",
    primaryColor:  "#534AB7",
    systemPrompt:  "You are a helpful assistant for MyWebsite. Answer questions about our products.",
    welcomeMessage: "Hi! How can I help you today?",
    knowledgeBase: [
      { q: "What are your hours?",    a: "Mon–Sat, 9am–6pm." },
      { q: "Do you offer refunds?",   a: "Yes, within 30 days." },
      { q: "Where are you located?",  a: "123 Main St, Islamabad." }
    ]
  }
</script>
<script src="https://yourdomain.com/orion.js"></script>
```

That's it. ✅

---

## ⚙️ Full Configuration Reference

| Option           | Type            | Default                | Description                                                    |
|------------------|-----------------|------------------------|----------------------------------------------------------------|
| `apiKey`         | string          | **required**           | Your Anthropic API key                                         |
| `botName`        | string          | `"Assistant"`          | Bot name shown in header and avatar                            |
| `subtitle`       | string          | `"AI-powered chat"`    | Small tagline under bot name                                   |
| `primaryColor`   | hex string      | `"#534AB7"`            | Accent color for header, bubbles, send button                  |
| `position`       | `"right"/"left"`| `"right"`              | Corner where launcher appears                                  |
| `systemPrompt`   | string          | Generic helpful prompt | Instructions defining bot role, tone, and constraints          |
| `welcomeMessage` | string          | `"Hi! I'm {name} 👋"`  | First message bot shows when chat opens                        |
| `placeholder`    | string          | `"Type a message..."` | Input field placeholder                                        |
| `knowledgeBase`  | array of `{q,a}`| `[]`                   | Q&A pairs injected as context — no fine-tuning needed          |

---

## 🎨 Customization Examples

### E-commerce store

```js
window.OrionConfig = {
  apiKey:       "sk-ant-...",
  botName:      "ShopBot",
  primaryColor: "#e63946",
  systemPrompt: "You are ShopBot for TrendStore. Help customers find products, check order status, and understand our return policy. Always be friendly and suggest relevant products.",
  knowledgeBase: [
    { q: "Return policy",     a: "Free returns within 30 days. No questions asked." },
    { q: "Shipping time",     a: "Standard 3–5 days. Express 1–2 days." },
    { q: "Payment methods",   a: "Visa, Mastercard, JazzCash, EasyPaisa, bank transfer." }
  ]
}
```

### Law firm

```js
window.OrionConfig = {
  apiKey:       "sk-ant-...",
  botName:      "LexBot",
  primaryColor: "#1a3a5c",
  position:     "left",
  systemPrompt: "You are LexBot, a professional assistant for Khan & Associates Law Firm. You answer general questions about our legal services, schedule consultations, and explain our practice areas. You do NOT give legal advice — always recommend booking a consultation for specific matters.",
  knowledgeBase: [
    { q: "Practice areas",    a: "Corporate law, family law, real estate, intellectual property." },
    { q: "Consultation fee",  a: "First 30-min consultation is free." },
    { q: "Office hours",      a: "Monday–Friday, 9am–5pm. Saturday by appointment." }
  ]
}
```

---

## 🔒 Security: Protecting Your API Key

### Option A — Client-side (simple, fine for low-risk sites)

The config above puts the key in the browser. Anyone can view source and see it.  
**Acceptable for:** internal tools, personal projects, demos, low-traffic sites.

### Option B — Server-side proxy (recommended for production)

Your key stays on your server. The widget calls your proxy, which calls Anthropic.

#### Deploy on Vercel (free)

```bash
cd proxy-server
vercel deploy
# Set env var in Vercel dashboard: ANTHROPIC_API_KEY = sk-ant-...
```

Then update the widget to call your proxy:

```js
window.OrionConfig = {
  apiEndpoint: "https://your-project.vercel.app/api/chat",  // no apiKey needed
  botName: "MyBot",
  // ... rest of config
}
```

#### Run locally / on Railway / Render

```bash
cd proxy-server
npm install
ANTHROPIC_API_KEY=sk-ant-... node server.js
```

---

## 📁 Project Structure

```
orion-widget/
├── orion.js              ← The embeddable widget (ship this)
├── demo/
│   └── index.html          ← Live demo + developer docs page
├── proxy-server/
│   ├── server.js           ← Node.js proxy (Railway / Render)
│   ├── package.json
│   └── api/
│       └── chat.js         ← Vercel serverless function
└── README.md
```

---

## 🌐 Deploying orion.js

To let developers reference your widget via URL, host `orion.js` on:

| Platform       | Free? | How                                              |
|----------------|-------|--------------------------------------------------|
| GitHub Pages   | ✅    | Push to repo, enable Pages → raw file URL        |
| jsDelivr CDN   | ✅    | `https://cdn.jsdelivr.net/gh/user/repo/orion.js` |
| Vercel         | ✅    | Drop in `/public/orion.js`                     |
| Netlify        | ✅    | Drop in `/static/orion.js`                     |
| Cloudflare R2  | ✅    | Upload + enable public access                    |

**Recommended:** GitHub + jsDelivr gives you free CDN, versioning, and zero config.

```html
<script src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/orion-widget@main/orion.js"></script>
```

---

## 🤝 Integration Checklist for Developers

- [ ] Copy the config block from Quickstart
- [ ] Replace `apiKey` with your Anthropic key
- [ ] Set `botName`, `primaryColor`, `systemPrompt` for your brand
- [ ] Add relevant `knowledgeBase` entries
- [ ] Paste the `<script>` tags before `</body>`
- [ ] Test it — a chat bubble should appear in the corner
- [ ] (Optional) Set up the proxy server to hide your API key

---

## 📄 License

MIT — free for personal and commercial use. Attribution appreciated but not required.

---

Built with ❤️ using the [Anthropic Claude API](https://anthropic.com)
