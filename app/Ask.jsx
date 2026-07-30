"use client";

/**
 * Ask bubble — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/Ask.jsx
 * Mounted in app/layout.js so it appears on every page.
 *
 * Conversation lives in React state only. Nothing is stored anywhere,
 * on the client or the server, and it clears when the tab closes.
 */

import { useState, useRef, useEffect } from "react";

const OPENERS = [
  "What is actually in chole bhature?",
  "How many calories does brisk walking burn?",
  "Is poha a good breakfast?",
];

export default function Ask() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;

    const next = [...msgs, { role: "user", content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: next.slice(0, -1) }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMsgs(m => [...m, { role: "assistant", content: data.error || "Something went wrong.", label: "ERROR" }]);
      } else {
        setMsgs(m => [...m, {
          role: "assistant",
          content: data.answer,
          label: data.label,
          verified: data.verified,
          approximate: data.approximate,
          cta: data.cta,
        }]);
      }
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "Could not reach the assistant. Check your connection.", label: "ERROR" }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className={`ask-fab ${open ? "hide" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Ask about food and calories"
      >
        <span>Ask</span>
      </button>

      <div className={`ask-panel ${open ? "on" : ""}`} role="dialog" aria-label="Ask Healthyram">
        <div className="ask-head">
          <div>
            <strong>Ask</strong>
            <span>Food, calories, activity</span>
          </div>
          <button className="ask-x" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>

        <div className="ask-body">
          {msgs.length === 0 && (
            <div className="ask-empty">
              <p>
                Questions about what is in a dish, where its calories sit, or how much
                activity burns. Not medical questions — those need someone who can see
                your history.
              </p>
              <div className="ask-openers">
                {OPENERS.map(o => (
                  <button key={o} onClick={() => send(o)}>{o}</button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div className={`ask-msg ${m.role}`} key={i}>
              {m.role === "assistant" && m.verified && <span className="ask-badge ok">Verified data</span>}
              {m.role === "assistant" && m.approximate && <span className="ask-badge approx">Approximate, external source</span>}
              <div className="ask-bubble">
                {String(m.content).split("\n\n").map((p, j) => <p key={j}>{p}</p>)}
              </div>
              {m.cta && <a className="ask-cta" href={m.cta.href}>{m.cta.text}</a>}
            </div>
          ))}

          {busy && <div className="ask-msg assistant"><div className="ask-bubble ask-wait"><i /><i /><i /></div></div>}
          <div ref={endRef} />
        </div>

        <div className="ask-foot">
          <div className="ask-input">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") send(); }}
              placeholder="Ask about a dish, or activity"
              disabled={busy}
              aria-label="Your question"
            />
            <button onClick={() => send()} disabled={busy || !input.trim()} aria-label="Send">→</button>
          </div>
          <p className="ask-note">
            General information about food. Not medical or dietary advice. Nothing here is stored.
          </p>
        </div>
      </div>

      <style jsx global>{`
        .ask-fab {
          position: fixed; right: 18px; bottom: 18px; z-index: 40;
          width: 60px; height: 60px; border-radius: 50%;
          background: var(--turmeric); color: var(--leaf-dk); border: none;
          font-family: 'Fraunces', serif; font-weight: 900; font-size: 1rem;
          cursor: pointer; box-shadow: 0 6px 20px rgba(18,46,34,.28);
          transition: transform 180ms ease, opacity 180ms ease;
        }
        .ask-fab:hover { transform: scale(1.06); }
        .ask-fab.hide { opacity: 0; pointer-events: none; transform: scale(.8); }

        .ask-panel {
          position: fixed; inset: auto 0 0 0; z-index: 45;
          height: 82vh; max-height: 720px;
          background: var(--paper);
          border-top-left-radius: 16px; border-top-right-radius: 16px;
          box-shadow: 0 -8px 40px rgba(18,46,34,.22);
          display: flex; flex-direction: column;
          transform: translateY(100%); transition: transform 260ms cubic-bezier(.22,1,.36,1);
        }
        .ask-panel.on { transform: none; }

        .ask-head {
          background: var(--leaf); color: #EFF3F0;
          padding: 15px 18px; display: flex; align-items: center; justify-content: space-between;
          border-top-left-radius: 16px; border-top-right-radius: 16px;
        }
        .ask-head strong { font-family: 'Fraunces', serif; font-size: 1.05rem; display: block; }
        .ask-head span { font-size: .76rem; color: #9DB2A7; }
        .ask-x { background: none; border: none; color: #9DB2A7; font-size: 1.7rem; line-height: 1; cursor: pointer; padding: 0 4px; }
        .ask-x:hover { color: var(--turmeric); }

        .ask-body { flex: 1; overflow-y: auto; padding: 18px; }

        .ask-empty p { margin: 0 0 16px; font-size: .9rem; color: var(--soft); }
        .ask-openers { display: flex; flex-direction: column; gap: 8px; }
        .ask-openers button {
          text-align: left; background: var(--card); border: 1px solid var(--rule);
          border-radius: 999px; padding: 10px 15px; font: inherit; font-size: .86rem;
          color: var(--soft); cursor: pointer;
        }
        .ask-openers button:hover { border-color: var(--leaf); color: var(--leaf); }

        .ask-msg { margin-bottom: 16px; }
        .ask-msg.user { text-align: right; }
        .ask-bubble {
          display: inline-block; text-align: left; max-width: 92%;
          padding: 12px 15px; border-radius: 12px; font-size: .92rem; line-height: 1.55;
        }
        .ask-msg.user .ask-bubble { background: var(--leaf); color: #EFF3F0; border-bottom-right-radius: 3px; }
        .ask-msg.assistant .ask-bubble { background: var(--card); border: 1px solid var(--rule); border-bottom-left-radius: 3px; }
        .ask-bubble p { margin: 0 0 10px; }
        .ask-bubble p:last-child { margin: 0; }

        .ask-badge {
          display: inline-block; margin-bottom: 6px; padding: 3px 8px; border-radius: 4px;
          font-size: .62rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase;
        }
        .ask-badge.ok { background: #E3EDE7; color: var(--leaf); }
        .ask-badge.approx { background: var(--turmeric-lt); color: #8A6200; }

        .ask-cta {
          display: inline-block; margin-top: 10px; background: var(--leaf); color: #fff;
          padding: 10px 18px; border-radius: 8px; text-decoration: none;
          font-size: .86rem; font-weight: 700;
        }

        .ask-wait { display: flex; gap: 5px; padding: 15px; }
        .ask-wait i { width: 6px; height: 6px; border-radius: 50%; background: var(--mute); animation: askb 1.1s infinite; }
        .ask-wait i:nth-child(2) { animation-delay: .18s; }
        .ask-wait i:nth-child(3) { animation-delay: .36s; }
        @keyframes askb { 0%,60%,100% { opacity:.3; } 30% { opacity:1; } }

        .ask-foot { border-top: 1px solid var(--rule); padding: 12px 18px 16px; background: var(--paper); }
        .ask-input { display: flex; gap: 8px; }
        .ask-input input {
          flex: 1; padding: 12px 14px; border: 1px solid var(--rule); border-radius: 999px;
          font: inherit; font-size: .92rem; background: var(--card); color: var(--ink);
        }
        .ask-input input:focus { outline: 2px solid var(--turmeric); outline-offset: 1px; }
        .ask-input button {
          width: 44px; border: none; border-radius: 50%; background: var(--leaf);
          color: #fff; font-size: 1.2rem; cursor: pointer;
        }
        .ask-input button:disabled { background: var(--mute); cursor: not-allowed; }
        .ask-note { margin: 10px 0 0; font-size: .7rem; color: var(--mute); text-align: center; }

        @media (min-width: 700px) {
          .ask-panel {
            inset: auto 20px 20px auto; width: 420px; height: 640px;
            border-radius: 16px;
          }
          .ask-head { border-radius: 16px 16px 0 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ask-panel, .ask-fab { transition: none; }
          .ask-wait i { animation: none; }
        }
      `}</style>
    </>
  );
}
