"use client";

/**
 * Login — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/login/page.jsx  (replaces the previous version)
 *
 * FIX: useSearchParams() must be inside a Suspense boundary or the
 * Next.js build fails during static prerendering. The actual sign-in
 * logic is unchanged — only the component structure changed.
 */

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabaseClient";

const PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  // { id: "facebook", label: "Continue with Facebook" },  // phase 2
  // { id: "linkedin_oidc", label: "Continue with LinkedIn" }, // phase 2
];

function LoginInner() {
  const [busy, setBusy] = useState(null);
  const params = useSearchParams();
  const next = params.get("next") || "/plan";

  async function signIn(provider) {
    setBusy(provider);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      setBusy(null);
      alert("Sign-in failed. Try again in a moment.");
    }
  }

  return (
    <>
      <p className="eyebrow">Sign in</p>
      <h1>Track your plan over time</h1>
      <p className="login-lede">
        Signing in lets Healthyram remember your plan and check back in with
        you in two weeks. We only store what the plan builder already asks
        for — nothing extra, and nothing sold or shared.
      </p>

      <div className="login-btns">
        {PROVIDERS.map(p => (
          <button key={p.id} disabled={!!busy} onClick={() => signIn(p.id)}>
            {busy === p.id ? "Redirecting…" : p.label}
          </button>
        ))}
      </div>

      <p className="login-alt">
        Just want a one-off number with nothing saved?{" "}
        <Link href="/plan-guest">Use the calculator without an account</Link>.
      </p>
    </>
  );
}

export default function Login() {
  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link className="mark" href="/">healthy<em>ram</em></Link>
          <span className="nav-link"><Link href="/">All dishes</Link></span>
        </div>
      </nav>

      <main className="login">
        <Suspense fallback={<p className="pl-note">Loading…</p>}>
          <LoginInner />
        </Suspense>
      </main>

      <style jsx global>{`
        .login { max-width: 460px; margin: 0 auto; padding: 60px var(--pad) 60px; text-align: center; }
        .login h1 {
          font-family: 'Fraunces', serif; font-weight: 400;
          font-size: clamp(1.6rem, 6vw, 2.2rem); letter-spacing: -0.03em; margin: 0 0 16px;
        }
        .login-lede { color: var(--soft); margin: 0 0 32px; font-size: .92rem; }
        .login-btns { display: grid; gap: 10px; }
        .login-btns button {
          padding: 14px 20px; border-radius: 8px; border: 1px solid var(--rule);
          background: var(--card); font: inherit; font-weight: 700; font-size: .95rem;
          cursor: pointer; color: var(--ink);
        }
        .login-btns button:hover { border-color: var(--leaf); }
        .login-btns button:disabled { opacity: .6; cursor: default; }
        .login-alt { margin-top: 28px; font-size: .82rem; color: var(--mute); }
        .login-alt a { color: var(--leaf); }
      `}</style>
    </>
  );
}