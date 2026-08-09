"use client";

/**
 * Account — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/account/page.jsx
 *
 * Shows the signed-in user's current plan, their check-in countdown,
 * and (once 14 days are up) sends them back through the plan builder
 * to reassess. Gated behind login by middleware.js.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../../lib/supabaseClient";

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: p }, { data: mp }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("meal_plans").select("*").eq("user_id", user.id).eq("is_current", true).maybeSingle(),
      ]);
      setProfile(p);
      setPlan(mp);
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    const supabase = supabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <Shell><p className="pl-note">Loading your account…</p></Shell>;
  }

  if (!profile || !plan) {
    return (
      <Shell>
        <p className="eyebrow">No plan yet</p>
        <h1>Let's build your first plan</h1>
        <Link className="pl-btn" href="/plan">Start</Link>
      </Shell>
    );
  }

  const daysLeft = Math.ceil((new Date(plan.ends_at) - Date.now()) / 86400000);
  const dueForCheckin = daysLeft <= 0;

  return (
    <Shell>
      <p className="eyebrow">Your account</p>
      <h1>{dueForCheckin ? "Time to check back in" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} until your check-in`}</h1>

      <div className="pl-nums">
        <div><span>Weight at last check-in</span><b>{profile.weight_kg} kg</b></div>
        <div><span>Daily intake</span><b>{profile.intake_kcal}</b><em>kcal</em></div>
        <div><span>Protein</span><b>{profile.protein_g} g</b></div>
      </div>

      {dueForCheckin ? (
        <>
          <p className="pl-lede" style={{ marginTop: 24 }}>
            Two weeks is up. Enter your current weight and waist again and we'll rebuild your
            plan around where you actually are now, not where you started.
          </p>
          <Link className="pl-btn" href="/plan">Reassess and get a new plan</Link>
        </>
      ) : (
        <>
          <h2>Your current 14-day plan</h2>
          <p className="pl-note">{plan.plan.summary.note}</p>
          <div className="pl-plandays">
            {plan.plan.days.map(d => (
              <details className="pl-day" key={d.day}>
                <summary>
                  Day {d.day} <span>{d.totalKcal} kcal · {d.totalProtein} g protein</span>
                </summary>
                {d.meals.map((m, i) => (
                  <Link href={`/dish/${m.id}`} className="pl-meal" key={i}>
                    <span className="pl-meal-slot">{m.slot}</span>
                    <span className="pl-meal-name">{m.name}</span>
                    <span className="pl-meal-nums">{m.kcal} kcal · {m.protein}g</span>
                  </Link>
                ))}
              </details>
            ))}
          </div>
        </>
      )}

      <button className="pl-btn ghost" style={{ marginTop: 32 }} onClick={signOut}>
        Sign out
      </button>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link className="mark" href="/">healthy<em>ram</em></Link>
          <span className="nav-link">
            <Link href="/">All dishes</Link> · <Link href="/plan">Build a plan</Link> · <Link href="/account">Account</Link>
          </span>
        </div>
      </nav>
      <main className="pl">{children}</main>

      {/* Duplicated from app/plan/page.jsx rather than shared, so this page
          renders correctly even when a visitor lands here directly without
          /plan ever having mounted in the session. If you change the plan
          page's look, mirror the change here too. */}
      <style jsx global>{`
        .pl { max-width: 680px; margin: 0 auto; padding: 40px var(--pad) 60px; }
        .pl h1 {
          font-family: 'Fraunces', serif; font-weight: 400;
          font-size: clamp(1.7rem, 6vw, 2.6rem); line-height: 1.08;
          letter-spacing: -0.03em; margin: 0 0 18px;
        }
        .pl h2 {
          font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.4rem;
          letter-spacing: -0.02em; margin: 44px 0 12px;
        }
        .pl-lede { color: var(--soft); margin: 0 0 26px; }
        .pl-note { font-size: .87rem; color: var(--soft); margin: 12px 0 0; }

        .pl-nums { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 20px; }
        .pl-nums div { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 16px 14px; }
        .pl-nums span { display: block; font-size: .64rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--mute); }
        .pl-nums b { display: block; font-family: 'Fraunces', serif; font-weight: 900; font-size: 1.6rem; letter-spacing: -.02em; margin: 4px 0 2px; }
        .pl-nums em { font-style: normal; font-size: .74rem; color: var(--soft); }

        .pl-btn {
          display: inline-block; margin-top: 28px; background: var(--leaf); color: #fff;
          border: none; border-radius: 8px; padding: 15px 30px; font: inherit;
          font-weight: 700; font-size: 1rem; cursor: pointer; text-decoration: none;
        }
        .pl-btn:hover { background: var(--leaf-lt); }
        .pl-btn.ghost { background: none; border: 1px solid var(--rule); color: var(--soft); }

        .pl-plandays { margin-top: 16px; display: grid; gap: 8px; }
        .pl-day { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 14px 16px; }
        .pl-day summary { cursor: pointer; font-weight: 700; display: flex; justify-content: space-between; gap: 10px; }
        .pl-day summary span { font-weight: 500; color: var(--soft); font-size: .85rem; }
        .pl-meal {
          display: grid; grid-template-columns: 90px 1fr auto; gap: 10px; align-items: center;
          padding: 8px 0; text-decoration: none; color: var(--ink); border-top: 1px solid var(--rule);
        }
        .pl-meal:first-of-type { border-top: none; margin-top: 10px; }
        .pl-meal-slot { font-size: .7rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--mute); }
        .pl-meal-name { font-weight: 600; }
        .pl-meal-nums { font-size: .8rem; color: var(--soft); white-space: nowrap; }

        @media (min-width: 620px) { .pl-nums { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 619px) {
          .pl-meal { grid-template-columns: 70px 1fr; }
          .pl-meal-nums { grid-column: 2; }
        }
      `}</style>
    </>
  );
}
