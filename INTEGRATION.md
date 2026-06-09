# Integrating Orion Assistant into Your Website

> Add an AI chat assistant to any website in 5 minutes.

---

## Option A — Quick (API key in browser)

Good for: personal projects, internal tools, prototypes.

**Step 1** — Get a free API key at [openrouter.ai/keys](https://openrouter.ai/keys)

**Step 2** — Paste this before `</body>` in your HTML:

```html
<script>
  window.OrionConfig = {
    apiKey:       "sk-or-v1-YOUR-KEY-HERE",
    botName:      "MyBot",
    primaryColor: "#534AB7",
    systemPrompt: "You are a helpful assistant for MyWebsite. Answer questions clearly.",
    pages: [
      { title: "Home",       url: "/",        keywords: ["home", "main"] },
      { title: "About",      url: "/about",   keywords: ["about", "who"] },
      { title: "Contact",    url: "/contact", keywords: ["contact", "reach", "support"] },
      { title: "Pricing",    url: "/pricing", keywords: ["price", "cost", "fee", "how much"] }
    ],
    knowledgeBase: [
      { q: "What do you offer?", a: "We offer amazing products and services." },
      { q: "How can I contact you?", a: "Email us at hello@mywebsite.com" }
    ]
  }
</script>
<script src="https://cdn.jsdelivr.net/gh/Rushadroomi/Orion-Assistant@main/orion.js"></script>
```

**Done.** A chat bubble appears in the bottom-right corner. ✅

---

## Option B — Secure (API key on server)

Good for: public websites, production apps.

Your API key stays on a server — never exposed to users.

### Step 1 — Fork this repo on GitHub

Click **Fork** on [github.com/Rushadroomi/Orion-Assistant](https://github.com/Rushadroomi/Orion-Assistant)

### Step 2 — Deploy proxy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) → New Project → Import your forked repo
2. Click **Deploy**
3. Go to **Settings → Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your OpenRouter key `sk-or-v1-...`
   - Enable **Sensitive**
   - Click Save
4. Go to **Deployments** → click the 3 dots → **Redeploy**

### Step 3 — Add to your website

```html
<script>
  window.OrionConfig = {
    apiEndpoint:  "https://YOUR-PROJECT.vercel.app/api/chat",
    botName:      "MyBot",
    primaryColor: "#534AB7",
    systemPrompt: "You are a helpful assistant for MyWebsite.",
    pages: [
      { title: "Contact", url: "/contact", keywords: ["contact", "support"] },
      { title: "Pricing", url: "/pricing", keywords: ["price", "cost", "fee"] }
    ],
    knowledgeBase: [
      { q: "What do you offer?", a: "We offer amazing products and services." }
    ]
  }
</script>
<script src="https://cdn.jsdelivr.net/gh/Rushadroomi/Orion-Assistant@main/orion.js"></script>
```

**Done.** API key is safe. ✅

---

## All Config Options

| Option | Type | Default | Description |
|---|---|---|---|
| `apiKey` | string | — | OpenRouter API key (Option A only) |
| `apiEndpoint` | string | — | Your Vercel proxy URL (Option B only) |
| `botName` | string | `"Orion"` | Bot name shown in header |
| `subtitle` | string | `"Orion Assistant"` | Tagline under bot name |
| `primaryColor` | hex | `"#534AB7"` | Accent color |
| `position` | `"right"/"left"` | `"right"` | Corner position |
| `systemPrompt` | string | Generic prompt | Bot personality and rules |
| `pages` | array | `[]` | `{title, url, keywords[]}` — smart routing |
| `knowledgeBase` | array | `[]` | `{q, a}` — FAQ context |
| `welcomeMessage` | string | `"Hi! I'm Orion 👋"` | First message on open |
| `placeholder` | string | `"Type a message..."` | Input placeholder |

---

## Customization Examples

### Change color and position
```js
primaryColor: "#e63946",   // red
position:     "left",      // bottom-left corner
```

### Custom welcome message
```js
welcomeMessage: "Hey! 👋 I'm here to help. Ask me anything about our products!",
```

### Teaching the bot your business
```js
knowledgeBase: [
  { q: "What are your opening hours?",  a: "Mon–Sat, 9am–6pm PKT." },
  { q: "Do you ship internationally?",  a: "Yes, we ship to 50+ countries." },
  { q: "What is your refund policy?",   a: "Full refund within 30 days, no questions asked." },
  { q: "How do I track my order?",      a: "Use the tracking link sent to your email after purchase." }
]
```

---

## Free Models via OpenRouter

The widget uses `openrouter/free` by default — automatically picks the best available free model.

To use a specific model:
```js
model: "meta-llama/llama-3.1-8b-instruct:free"
```

Get your free key at [openrouter.ai/keys](https://openrouter.ai/keys) — no credit card needed.

---

## Support

Open an issue at [github.com/Rushadroomi/Orion-Assistant/issues](https://github.com/Rushadroomi/Orion-Assistant/issues)
