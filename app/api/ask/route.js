/**
 * Assistant API — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/api/ask/route.js
 *
 * Two stages, deliberately separate:
 *   1. Classify. One word out. No prose, no tools, no answer.
 *   2. Respond. Only for labels that permit it, with a prompt scoped to that label.
 *
 * DECLINE and CARE never reach a generative call.
 */

import { DISHES } from "../../../lib/dishes";
import {
  CLASSIFIER_MODEL, RESPONDER_MODEL, CLASSIFIER_PROMPT, PROMPTS, FIXED,
  LABELS, ALLOWED_DOMAINS, careLatched, NUMERIC_LABELS, LATCHED_RESPONSE,
  findDishes, dishContext,
} from "../../../lib/assistant";

const API = "https://api.anthropic.com/v1/messages";

async function anthropic(body) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

function textOf(data) {
  return (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("\n")
    .trim();
}

/** Last few turns only. Keeps the classifier cheap and the context honest. */
function recent(history = []) {
  return history
    .slice(-6)
    .map(m => ({ role: m.role, content: String(m.content).slice(0, 2000) }));
}

export async function POST(request) {
  try {
    const { question, history = [] } = await request.json();

    if (!question || typeof question !== "string" || question.trim().length < 2) {
      return Response.json({ error: "Ask me something about food or calories." }, { status: 400 });
    }
    if (question.length > 1000) {
      return Response.json({ error: "That is a long one. Try a shorter question." }, { status: 400 });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ask: ANTHROPIC_API_KEY not set");
      return Response.json({ error: "The assistant is not available right now." }, { status: 503 });
    }

    /* ---------- stage one: classify ---------- */

    const classify = await anthropic({
      model: CLASSIFIER_MODEL,
      max_tokens: 8,
      system: CLASSIFIER_PROMPT,
      messages: [...recent(history), { role: "user", content: question }],
    });

    let label = textOf(classify).toUpperCase().replace(/[^A-Z]/g, "");
    if (!LABELS.includes(label)) label = "DECLINE";

    /* ---------- the two that never generate ---------- */

    if (label === "CARE") {
      return Response.json({ label, answer: FIXED.CARE });
    }
    if (label === "DECLINE") {
      return Response.json({ label, answer: FIXED.DECLINE });
    }
    if (label === "ROUTE") {
      return Response.json({ label, answer: FIXED.ROUTE, cta: { href: "/plan", text: "Open the plan builder" } });
    }

    /* ---------- the latch ---------- */

    if (careLatched(history) && NUMERIC_LABELS.includes(label)) {
      return Response.json({ label: "CARE", answer: LATCHED_RESPONSE });
    }

    /* ---------- stage two: respond ---------- */

    const body = {
      model: RESPONDER_MODEL,
      max_tokens: 700,
      system: PROMPTS[label],
      messages: [...recent(history), { role: "user", content: question }],
    };

    let verified = false;

    if (label === "LIBRARY") {
      const matches = findDishes(question, DISHES);
      if (matches.length === 0) {
        // Classifier thought it was a known dish and it is not. Treat as lookup.
        body.system = PROMPTS.LOOKUP;
        body.tools = [{ type: "web_search_20250305", name: "web_search", allowed_domains: ALLOWED_DOMAINS, max_uses: 3 }];
      } else {
        verified = matches.every(d => d.verified);
        body.system += `\n\nVERIFIED DATA — answer only from this:\n\n${matches.map(dishContext).join("\n\n")}`;
      }
    }

    if (label === "LOOKUP") {
      body.tools = [{ type: "web_search_20250305", name: "web_search", allowed_domains: ALLOWED_DOMAINS, max_uses: 3 }];
    }

    const reply = await anthropic(body);
    const answer = textOf(reply);

    if (!answer) {
      return Response.json({
        label: "LOOKUP",
        answer: "We could not find a reliable figure for that. Rather than guess, we would rather tell you we do not know.",
      });
    }

    return Response.json({ label, answer, verified, approximate: label === "LOOKUP" });
  } catch (e) {
    console.error("ask:", e);
    return Response.json({ error: "Something went wrong. Try again in a moment." }, { status: 500 });
  }
}
