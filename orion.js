/**
 * Orion Assistant — Embeddable AI Chat Widget
 * Version: 1.0.0
 *
 * Usage:
 *   <script>
 *     window.OrionConfig = {
 *       apiKey: "sk-ant-...",          // required — developer's own Anthropic key
 *       botName: "MyBot",             // optional
 *       subtitle: "AI Assistant",     // optional
 *       primaryColor: "#534AB7",      // optional
 *       position: "right",            // optional: "right" | "left"
 *       systemPrompt: "You are...",   // optional
 *       knowledgeBase: [              // optional
 *         { q: "What are hours?", a: "9am-6pm Mon-Sat" }
 *       ],
 *       welcomeMessage: "Hi! How can I help?", // optional
 *       placeholder: "Type a message...",       // optional
 *     }
 *   </script>
 *   <script src="orion.js"></script>
 */

(function () {
  "use strict";

  const cfg = window.OrionConfig || {};

  // ── Config defaults ───────────────────────────────────────────────
  const API_KEY        = cfg.apiKey || "";
  const BOT_NAME       = cfg.botName || "Orion";
  const SUBTITLE       = cfg.subtitle || "Orion Assistant";
  const PRIMARY        = cfg.primaryColor || "#534AB7";
  const POSITION       = cfg.position === "left" ? "left" : "right";
  const WELCOME_MSG    = cfg.welcomeMessage || `Hi! I'm ${BOT_NAME} 👋 How can I help you today?`;
  const PLACEHOLDER    = cfg.placeholder || "Type a message...";
  const KNOWLEDGE_BASE = cfg.knowledgeBase || [];
  const SYSTEM_PROMPT  = cfg.systemPrompt ||
    `You are ${BOT_NAME}, a helpful and friendly AI assistant embedded on a website. Answer questions clearly and concisely. If you don't know something, say so honestly.`;

  // ── Derived ───────────────────────────────────────────────────────
  const LETTER  = BOT_NAME.charAt(0).toUpperCase();
  const PRIMARY_DARK  = shadeColor(PRIMARY, -30);
  const PRIMARY_LIGHT = shadeColor(PRIMARY, 80);

  function shadeColor(hex, pct) {
    const num = parseInt(hex.replace("#",""), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + pct));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
    const b = Math.min(255, Math.max(0, (num & 0xff) + pct));
    return "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join("");
  }

  // ── Conversation state ────────────────────────────────────────────
  let history = [];
  let isLoading = false;

  // ── Build system prompt with KB ───────────────────────────────────
  function buildSystemPrompt() {
    let prompt = SYSTEM_PROMPT;
    if (KNOWLEDGE_BASE.length > 0) {
      prompt += "\n\nKnowledge base — use these facts when relevant:\n";
      KNOWLEDGE_BASE.forEach(item => {
        prompt += `Q: ${item.q}\nA: ${item.a}\n\n`;
      });
    }
    return prompt;
  }

  // ── Inject CSS ────────────────────────────────────────────────────
  function injectStyles() {
    const side = POSITION === "left" ? "left: 24px; right: auto;" : "right: 24px; left: auto;";
    const msgRadius = POSITION === "left"
      ? { bot: "4px 14px 14px 14px", user: "14px 14px 4px 14px" }
      : { bot: "4px 14px 14px 14px", user: "14px 4px 14px 14px" };

    const css = `
      #orion-launcher {
        position: fixed; bottom: 24px; ${side} z-index: 999999;
        width: 56px; height: 56px; border-radius: 50%;
        background: ${PRIMARY}; border: none; cursor: pointer;
        box-shadow: 0 4px 20px rgba(0,0,0,0.22);
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      #orion-launcher:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.28); }
      #orion-launcher svg { transition: opacity 0.15s, transform 0.15s; }
      #orion-launcher.open .icon-chat { opacity: 0; transform: scale(0.5); position: absolute; }
      #orion-launcher.open .icon-close { opacity: 1; transform: scale(1); }
      #orion-launcher .icon-close { opacity: 0; transform: scale(0.5); position: absolute; transition: opacity 0.15s, transform 0.15s; }

      #orion-window {
        position: fixed; bottom: 92px; ${side} z-index: 999998;
        width: 370px; height: 560px; max-height: calc(100vh - 110px);
        background: #ffffff; border-radius: 16px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
        display: flex; flex-direction: column; overflow: hidden;
        opacity: 0; transform: translateY(16px) scale(0.97);
        transition: opacity 0.22s ease, transform 0.22s ease;
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      #orion-window.open {
        opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
      }

      .or-header {
        background: ${PRIMARY}; padding: 16px 18px;
        display: flex; align-items: center; gap: 12px; flex-shrink: 0;
      }
      .or-avatar {
        width: 36px; height: 36px; border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex; align-items: center; justify-content: center;
        font-weight: 700; font-size: 15px; color: #fff; flex-shrink: 0;
      }
      .or-header-text { flex: 1; }
      .or-header-name { font-size: 15px; font-weight: 600; color: #fff; line-height: 1.2; }
      .or-header-sub { font-size: 12px; color: rgba(255,255,255,0.75); }
      .or-status { display: flex; align-items: center; gap: 5px; }
      .or-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; animation: or-pulse 2s infinite; }
      @keyframes or-pulse { 0%,100%{opacity:1}50%{opacity:0.45} }
      .or-close-btn { background: transparent; border: none; cursor: pointer; color: rgba(255,255,255,0.8); padding: 4px; line-height: 0; border-radius: 6px; }
      .or-close-btn:hover { color: #fff; background: rgba(255,255,255,0.15); }

      .or-messages {
        flex: 1; overflow-y: auto; padding: 16px 14px;
        display: flex; flex-direction: column; gap: 12px;
        background: #f8f8fb; scroll-behavior: smooth;
      }
      .or-messages::-webkit-scrollbar { width: 4px; }
      .or-messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

      .or-msg-row { display: flex; align-items: flex-end; gap: 8px; }
      .or-msg-row.user { flex-direction: row-reverse; }
      .or-msg-avatar {
        width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 600;
      }
      .or-msg-avatar.bot { background: ${PRIMARY_LIGHT}; color: ${PRIMARY_DARK}; }
      .or-msg-avatar.user { background: #e2e2e8; color: #555; }

      .or-bubble {
        max-width: 78%; padding: 9px 13px; font-size: 14px; line-height: 1.55;
        word-break: break-word;
      }
      .or-bubble.bot {
        background: #ffffff; color: #1a1a1a;
        border-radius: ${msgRadius.bot};
        border: 1px solid #ebebeb;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      }
      .or-bubble.user {
        background: ${PRIMARY}; color: #ffffff;
        border-radius: ${msgRadius.user};
      }
      .or-time { font-size: 10px; color: #aaa; margin-top: 3px; text-align: right; }
      .or-msg-row.bot .or-time { text-align: left; }

      .or-typing { display: flex; gap: 4px; padding: 4px 0; align-items: center; }
      .or-typing-dot { width: 6px; height: 6px; border-radius: 50%; background: #bbb; animation: or-typing 1.1s infinite; }
      .or-typing-dot:nth-child(2){animation-delay:.18s}
      .or-typing-dot:nth-child(3){animation-delay:.36s}
      @keyframes or-typing { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-4px);opacity:1} }

      .or-input-area {
        padding: 12px 14px; background: #fff;
        border-top: 1px solid #efefef; flex-shrink: 0;
      }
      .or-input-row { display: flex; gap: 8px; align-items: flex-end; }
      .or-input {
        flex: 1; padding: 9px 12px; border-radius: 10px;
        border: 1.5px solid #e0e0e8; background: #f8f8fb;
        font-size: 14px; font-family: inherit; color: #1a1a1a;
        resize: none; min-height: 38px; max-height: 110px;
        line-height: 1.45; outline: none; transition: border-color 0.15s;
      }
      .or-input:focus { border-color: ${PRIMARY}; background: #fff; }
      .or-input::placeholder { color: #bbb; }
      .or-send {
        width: 38px; height: 38px; border-radius: 10px; border: none;
        background: ${PRIMARY}; color: #fff; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background 0.15s, transform 0.1s; flex-shrink: 0;
      }
      .or-send:hover { background: ${PRIMARY_DARK}; }
      .or-send:active { transform: scale(0.95); }
      .or-send:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

      .or-branding {
        text-align: center; padding: 6px; font-size: 10px; color: #ccc;
        background: #fff; border-top: 1px solid #f2f2f2;
      }
      .or-branding a { color: #bbb; text-decoration: none; }
      .or-branding a:hover { color: #888; }

      .or-error { background: #fff1f1; color: #c0392b; border: 1px solid #fccaca; border-radius: 8px; padding: 8px 12px; font-size: 13px; margin: 4px 0; }

      @media (max-width: 420px) {
        #orion-window { width: calc(100vw - 20px); ${POSITION === "left" ? "left:10px" : "right:10px"}; bottom: 80px; }
        #orion-launcher { ${POSITION === "left" ? "left:16px" : "right:16px"}; bottom: 16px; }
      }
    `;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── Build DOM ─────────────────────────────────────────────────────
  function buildWidget() {
    // Launcher button
    const launcher = document.createElement("button");
    launcher.id = "orion-launcher";
    launcher.setAttribute("aria-label", `Open ${BOT_NAME} chat`);
    launcher.innerHTML = `
      <svg class="icon-chat" width="24" height="24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="icon-close" width="22" height="22" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>`;
    launcher.addEventListener("click", toggleWindow);

    // Chat window
    const win = document.createElement("div");
    win.id = "orion-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", `${BOT_NAME} chat window`);
    win.innerHTML = `
      <div class="or-header">
        <div class="or-avatar">${LETTER}</div>
        <div class="or-header-text">
          <div class="or-header-name">${BOT_NAME}</div>
          <div class="or-header-sub">${SUBTITLE}</div>
        </div>
        <div class="or-status"><div class="or-status-dot"></div></div>
        <button class="or-close-btn" aria-label="Close chat">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="or-messages" id="or-messages"></div>
      <div class="or-input-area">
        <div class="or-input-row">
          <textarea class="or-input" id="or-input" placeholder="${PLACEHOLDER}" rows="1" aria-label="Type your message"></textarea>
          <button class="or-send" id="or-send" aria-label="Send message">
            <svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="or-branding">Powered by <a href="https://anthropic.com" target="_blank" rel="noopener">Claude AI</a></div>`;

    document.body.appendChild(launcher);
    document.body.appendChild(win);

    // Events
    win.querySelector(".or-close-btn").addEventListener("click", toggleWindow);
    document.getElementById("or-send").addEventListener("click", sendMessage);
    document.getElementById("or-input").addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    document.getElementById("or-input").addEventListener("input", autoResize);

    // Welcome message
    appendMessage("bot", WELCOME_MSG);
  }

  // ── Toggle window ─────────────────────────────────────────────────
  function toggleWindow() {
    const win = document.getElementById("orion-window");
    const launcher = document.getElementById("orion-launcher");
    const isOpen = win.classList.contains("open");
    win.classList.toggle("open", !isOpen);
    launcher.classList.toggle("open", !isOpen);
    launcher.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) {
      setTimeout(() => document.getElementById("or-input").focus(), 220);
    }
  }

  // ── Append message ────────────────────────────────────────────────
  function appendMessage(role, text) {
    const msgs = document.getElementById("or-messages");
    const isBot = role === "bot";
    const time  = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const row = document.createElement("div");
    row.className = `or-msg-row ${isBot ? "bot" : "user"}`;
    row.innerHTML = `
      <div class="or-msg-avatar ${isBot ? "bot" : "user"}">${isBot ? LETTER : "U"}</div>
      <div>
        <div class="or-bubble ${isBot ? "bot" : "user"}">${escapeHtml(text).replace(/\n/g,"<br>")}</div>
        <div class="or-time">${time}</div>
      </div>`;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
    return row;
  }

  function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  // ── Typing indicator ──────────────────────────────────────────────
  function showTyping() {
    const msgs = document.getElementById("or-messages");
    const row = document.createElement("div");
    row.className = "or-msg-row bot";
    row.id = "or-typing";
    row.innerHTML = `
      <div class="or-msg-avatar bot">${LETTER}</div>
      <div class="or-bubble bot">
        <div class="or-typing">
          <div class="or-typing-dot"></div>
          <div class="or-typing-dot"></div>
          <div class="or-typing-dot"></div>
        </div>
      </div>`;
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById("or-typing");
    if (t) t.remove();
  }

  // ── Auto resize textarea ──────────────────────────────────────────
  function autoResize() {
    const el = document.getElementById("or-input");
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 110) + "px";
  }

  // ── Send message ──────────────────────────────────────────────────
  async function sendMessage() {
    if (isLoading) return;
    const input = document.getElementById("or-input");
    const sendBtn = document.getElementById("or-send");
    const text = input.value.trim();
    if (!text) return;

    if (!API_KEY) {
      appendMessage("bot", "⚠️ No API key configured. Please set apiKey in window.OrionConfig.");
      return;
    }

    input.value = "";
    input.style.height = "auto";
    isLoading = true;
    sendBtn.disabled = true;

    appendMessage("user", text);
    history.push({ role: "user", content: text });
    showTyping();

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: history
        })
      });

      const data = await res.json();
      removeTyping();

      if (data.error) {
        showError(data.error.message || "API error. Check your API key.");
      } else {
        const reply = data.content[0].text;
        history.push({ role: "assistant", content: reply });
        appendMessage("bot", reply);
      }
    } catch (err) {
      removeTyping();
      showError("Network error. Please try again.");
    }

    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  function showError(msg) {
    const msgs = document.getElementById("or-messages");
    const div = document.createElement("div");
    div.className = "or-error";
    div.textContent = "⚠️ " + msg;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => { injectStyles(); buildWidget(); });
    } else {
      injectStyles();
      buildWidget();
    }
  }

  init();

})();
