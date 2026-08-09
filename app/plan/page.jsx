"use client";

/**
 * Plan builder — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/plan/page.jsx  (replaces the existing file)
 *
 * CHANGES FROM THE ORIGINAL:
 *   - Gated behind login by middleware.js (Google OAuth via Supabase).
 *   - On completing the wizard, also generates and saves a 14-day meal
 *     plan (lib/mealplan.js) and the profile snapshot to Supabase.
 *   - If the signed-in user already has an active (< 14 days old) plan,
 *     offers to view it on /account instead of rebuilding from scratch.
 *
 * The medical screening, baseline, targets and dish-selection logic
 * below is UNCHANGED from the original — see lib/program.js. The
 * no-account version of this calculator still exists at /plan-guest
 * for anyone who wants a one-off number with nothing saved.
 */

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BLOCKING_MEDS, BLOCKING_CONDITIONS, CAUTION_FLAGS, BLOCKED_MESSAGE,
  screen, baseline, targets, selectDishes, habits, TRUTHS,
} from "../../lib/program";
import { generateMealPlan } from "../../lib/mealplan";
import { supabaseBrowser } from "../../lib/supabaseClient";

const ACTIVITY_OPTIONS = [
  { id: "sedentary", label: "Desk job, little walking" },
  { id: "light",     label: "Some walking most days" },
  { id: "moderate",  label: "Active most days" },
  { id: "high",      label: "Physical work or daily training" },
];

const GOAL_OPTIONS = [
  { id: "fatloss",  label: "Lose fat",          note: "Keep muscle, lose the rest" },
  { id: "weight",   label: "Lose weight",       note: "Straightforward reduction" },
  { id: "toning",   label: "Change composition",note: "Firmer, not just lighter" },
  { id: "health",   label: "Metabolic health",  note: "Waist and bloodwork, not the scale" },
  { id: "maintain", label: "Hold where I am",   note: "Stop the drift" },
];

export default function PlanBuilder() {
  const [step, setStep] = useState(1);
  const [age, setAge] = useState("");
  const [meds, setMeds] = useState([]);
  const [conds, setConds] = useState([]);
  const [noneMedical, setNoneMedical] = useState(false);

  const [sex, setSex] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [activity, setActivity] = useState("");

  const [goal, setGoal] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [veg, setVeg] = useState(false);

  const [user, setUser] = useState(null);
  const [existingPlan, setExistingPlan] = useState(undefined); // undefined = still checking
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error

  /* ---- who is signed in, and do they already have an active plan ---- */
  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (!user) { setExistingPlan(null); return; }
      const { data } = await supabase
        .from("meal_plans")
        .select("id, created_at, ends_at")
        .eq("user_id", user.id)
        .eq("is_current", true)
        .maybeSingle();
      setExistingPlan(data || null);
    });
  }, []);

  function toggle(list, setList, id) {
    setNoneMedical(false);
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  }

  const check = useMemo(
    () => screen({ meds, conditions: conds, age: Number(age) || undefined }),
    [meds, conds, age]
  );

  const result = useMemo(() => {
    if (step !== 4) return null;
    const b = baseline({
      sex, age: Number(age), heightCm: Number(height),
      weightKg: Number(weight), waistCm: Number(waist),
    });
    const t = targets({
      sex, age: Number(age), heightCm: Number(height), weightKg: Number(weight),
      activity, goal, goalWeightKg: goalWeight ? Number(goalWeight) : undefined,
    });
    const plan = generateMealPlan(t, veg);
    return {
      b, t, plan,
      dishes: selectDishes({ veg, goal, baselineResult: b }),
      week1: habits({ targets: t, baselineResult: b, week: 1 }),
    };
  }, [step, sex, age, height, weight, waist, activity, goal, goalWeight, veg]);

  /* ---- persist to Supabase once the result is computed ---- */
  useEffect(() => {
    if (!result || !user || saveState !== "idle") return;
    (async () => {
      setSaveState("saving");
      const supabase = supabaseBrowser();
      const nextCheckin = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || null,
        sex, age: Number(age), height_cm: Number(height), weight_kg: Number(weight),
        waist_cm: Number(waist), activity, goal,
        goal_weight_kg: goalWeight ? Number(goalWeight) : null, veg,
        bmi: result.b.bmi, whtr: result.b.whtr,
        intake_kcal: result.t.intake, protein_g: result.t.proteinG,
        updated_at: new Date().toISOString(),
        next_checkin_at: nextCheckin,
      });

      // retire any previous current plan, then insert the new one
      await supabase.from("meal_plans")
        .update({ is_current: false })
        .eq("user_id", user.id)
        .eq("is_current", true);

      const { error: planErr } = await supabase.from("meal_plans").insert({
        user_id: user.id, is_current: true,
        weight_kg: Number(weight), goal,
        intake_kcal: result.t.intake, protein_g: result.t.proteinG,
        plan: result.plan,
        ends_at: nextCheckin,
      });

      await supabase.from("progress_log").insert({
        user_id: user.id, weight_kg: Number(weight), waist_cm: Number(waist),
        bmi: result.b.bmi, whtr: result.b.whtr,
      });

      setSaveState(profileErr || planErr ? "error" : "saved");
    })();
  }, [result, user, saveState]);

  const step1Ready = age && (noneMedical || meds.length || conds.length);
  const step2Ready = sex && height && weight && waist && activity;
  const step3Ready = goal && (goal === "maintain" || goal === "health" || goalWeight);

  /* ---------------- already has an active plan ---------------- */
  if (step === 1 && existingPlan) {
    const daysLeft = Math.ceil((new Date(existingPlan.ends_at) - Date.now()) / 86400000);
    return (
      <Shell>
        <div className="pl-block">
          <p className="eyebrow">Welcome back</p>
          <h1>You already have an active plan</h1>
          <p className="pl-lede">
            {daysLeft > 0
              ? `Started ${new Date(existingPlan.created_at).toLocaleDateString()}. Your next check-in is in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
              : "Your two weeks are up — time to check back in and get a fresh plan."}
          </p>
          <Link className="pl-btn" href="/account">
            {daysLeft > 0 ? "View your plan" : "Reassess and get a new plan"}
          </Link>
          <button className="pl-btn ghost" style={{ marginLeft: 12 }}
            onClick={() => setExistingPlan(null)}>
            Start over anyway
          </button>
        </div>
      </Shell>
    );
  }

  /* ---------------- blocked ---------------- */
  if (step === 1.5) {
    return (
      <Shell>
        <div className="pl-block">
          <p className="eyebrow" style={{ color: "var(--chilli)" }}>We are stopping here</p>
          <h1>No plan for you today, and that is deliberate</h1>
          <p className="pl-lede">{BLOCKED_MESSAGE}</p>
          <div className="pl-reasons">
            <h3>Why</h3>
            {check.reasons.map((r, i) => <p key={i}>{r}</p>)}
          </div>
          <p className="pl-lede">
            The dish teardowns are still worth your time — nothing there depends on any of this.
          </p>
          <Link className="pl-btn" href="/">Read the teardowns</Link>
        </div>
      </Shell>
    );
  }

  /* ---------------- results ---------------- */
  if (step === 4 && result) {
    const { b, t, dishes, week1, plan } = result;
    return (
      <Shell>
        <div className="pl-res">
          <p className="eyebrow">Your starting point</p>
          <h1>{b.headline}</h1>

          <div className="pl-nums">
            <div><span>Waist to height</span><b>{b.whtr}</b><em>{b.whtrOk ? "Healthy range" : "Above 0.5"}</em></div>
            <div><span>Waist</span><b>{b.waistCm} cm</b><em>{b.waistOver ? `${b.waistExcess} cm over` : "Within range"}</em></div>
            <div><span>BMI</span><b>{b.bmi}</b><em>{b.bmiBand}</em></div>
          </div>
          <p className="pl-note">{b.note}</p>

          {check.cautions.length > 0 && (
            <div className="pl-caution">
              <h3>Worth knowing</h3>
              {check.cautions.map((c, i) => <p key={i}>{c}</p>)}
            </div>
          )}

          <h2>Your targets</h2>
          <div className="pl-nums">
            <div><span>Daily intake</span><b>{t.intake}</b><em>kcal</em></div>
            <div><span>Protein</span><b>{t.proteinG} g</b><em>every day</em></div>
            <div><span>Fibre</span><b>{t.fibreG} g</b><em>every day</em></div>
          </div>
          <p className="pl-note">{t.proteinNote}</p>
          <p className="pl-real">{t.realistic}</p>

          {t.warnings.map((w, i) => (
            <div className="pl-warn" key={i}><p>{w}</p></div>
          ))}

          <h2>Start with one thing</h2>
          <div className="pl-habit">
            <strong>{week1.current.habit}</strong>
            <p>{week1.current.why}</p>
          </div>
          <details className="pl-more">
            <summary>The next seven weeks</summary>
            {week1.stack.slice(1).map(s => (
              <div key={s.week}><b>Week {s.week}.</b> {s.habit}</div>
            ))}
          </details>

          <h2>Your 14-day meal plan</h2>
          <p className="pl-note">{plan.summary.note}</p>
          <p className="pl-note">
            Averaging <b>{plan.summary.avgKcal} kcal</b> and <b>{plan.summary.avgProtein} g protein</b> a
            day against your target of {plan.summary.target.kcal} kcal / {plan.summary.target.protein} g.
          </p>
          {plan.summary.shortfall && (
            <div className="pl-warn">
              <p>{plan.summary.shortfallNote}</p>
            </div>
          )}
          <div className="pl-plandays">
            {plan.days.map(d => (
              <details className="pl-day" key={d.day}>
                <summary>
                  Day {d.day} <span>{d.totalKcal} kcal · {d.totalProtein} g protein</span>
                </summary>
                {d.meals.map((m, i) => (
                  <Link href={`/dish/${m.id}`} className="pl-meal" key={i}>
                    <span className="pl-meal-slot">{m.slot}</span>
                    <span className="pl-meal-name">{m.name}<em className="pl-meal-portion">{m.portion}</em></span>
                    <span className="pl-meal-nums">{m.kcal} kcal · {m.protein}g</span>
                  </Link>
                ))}
              </details>
            ))}
          </div>

          {saveState === "saved" && (
            <p className="pl-note" style={{ color: "var(--leaf)" }}>
              Saved to your account. We'll ask you to check back in in two weeks —
              in the meantime this plan is always on <Link href="/account">your account page</Link>.
            </p>
          )}
          {saveState === "error" && (
            <p className="pl-note" style={{ color: "var(--chilli)" }}>
              Everything above is correct, but saving it to your account didn't go through.
              Refreshing this page will try again.
            </p>
          )}

          <h2>What to eat</h2>
          <p className="pl-note">
            Protein first. These are the dishes that get you to {t.proteinG} g a day —
            ordered by protein per calorie, best first.
          </p>
          {dishes.solutions.map(d => (
            <Link className="pl-dish solution" href={`/dish/${d.id}`} key={d.id}>
              <div className="pl-dish-top">
                <strong>{d.name}</strong>
                <span>{d.protein} g protein</span>
              </div>
              <p>{d.headline}</p>
              <em>{d.kcal} kcal · {d.density} g protein per 100 kcal</em>
            </Link>
          ))}

          <h2>What to change</h2>
          <p className="pl-note">
            Dishes you probably already eat, and the fix that saves the most.
          </p>
          {dishes.fixes.map(d => (
            <Link className="pl-dish" href={`/dish/${d.id}`} key={d.id}>
              <div className="pl-dish-top">
                <strong>{d.name}</strong>
                <span>−{d.tier.saves} kcal</span>
              </div>
              <p>{d.tier.change}</p>
              <em>Taste cost: {d.tier.tasteCost}</em>
            </Link>
          ))}

          <h2>Things worth hearing</h2>
          <div className="pl-truths">
            {(goal === "toning" ? [TRUTHS.toning, TRUTHS.plateau, TRUTHS.spotReduction]
                                : [TRUTHS.plateau, TRUTHS.spotReduction, TRUTHS.estimates]
             ).map((x, i) => <p key={i}>{x}</p>)}
          </div>

          <button className="pl-btn ghost" onClick={() => { setStep(1); setSaveState("idle"); }}>
            Start again
          </button>
        </div>
      </Shell>
    );
  }

  /* ---------------- steps ---------------- */
  return (
    <Shell>
      <p className="eyebrow">Step {step} of 3</p>
      <h1>
        {step === 1 && "First, some medical questions"}
        {step === 2 && "Your measurements"}
        {step === 3 && "What are you after?"}
      </h1>

      {step === 1 && (
        <>
          <p className="pl-lede">
            These come first because some combinations make low-carbohydrate eating or fasting
            genuinely unsafe. We would rather stop here than hand you something that hurts you.
          </p>

          <label className="pl-field">
            <span>Your age</span>
            <input type="number" inputMode="decimal" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 42" />
          </label>

          <h3 className="pl-h3">Do you take any of these?</h3>
          <div className="pl-opts">
            {BLOCKING_MEDS.map(m => (
              <button key={m.id} className={meds.includes(m.id) ? "on" : ""}
                onClick={() => toggle(meds, setMeds, m.id)}>{m.label}</button>
            ))}
          </div>

          <h3 className="pl-h3">Does any of this apply?</h3>
          <div className="pl-opts">
            {BLOCKING_CONDITIONS.filter(c => c.id !== "under18").map(c => (
              <button key={c.id} className={conds.includes(c.id) ? "on" : ""}
                onClick={() => toggle(conds, setConds, c.id)}>{c.label}</button>
            ))}
          </div>

          <h3 className="pl-h3">Anything else we should know?</h3>
          <div className="pl-opts">
            {CAUTION_FLAGS.filter(f => f.id !== "over65").map(f => (
              <button key={f.id} className={meds.includes(f.id) || conds.includes(f.id) ? "on" : ""}
                onClick={() => toggle(conds, setConds, f.id)}>{f.label}</button>
            ))}
          </div>

          <button className={`pl-none ${noneMedical ? "on" : ""}`}
            onClick={() => { setMeds([]); setConds([]); setNoneMedical(true); }}>
            None of these apply to me
          </button>

          <button className="pl-btn" disabled={!step1Ready}
            onClick={() => setStep(check.blocked ? 1.5 : 2)}>
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="pl-lede">
            Waist matters more than weight here, so measure it properly — at the navel, standing,
            breathing out, tape snug but not pulled tight.
          </p>

          <h3 className="pl-h3">Sex at birth</h3>
          <div className="pl-opts row">
            <button className={sex === "male" ? "on" : ""} onClick={() => setSex("male")}>Male</button>
            <button className={sex === "female" ? "on" : ""} onClick={() => setSex("female")}>Female</button>
          </div>
          <p className="pl-hint">Used only because waist thresholds and metabolic rate differ.</p>

          <div className="pl-row">
            <label className="pl-field">
              <span>Height, cm</span>
              <input type="number" inputMode="decimal" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
            </label>
            <label className="pl-field">
              <span>Weight, kg</span>
              <input type="number" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)} placeholder="75" />
            </label>
            <label className="pl-field">
              <span>Waist, cm</span>
              <input type="number" inputMode="decimal" value={waist} onChange={e => setWaist(e.target.value)} placeholder="92" />
            </label>
          </div>

          <h3 className="pl-h3">How active are you, honestly?</h3>
          <div className="pl-opts">
            {ACTIVITY_OPTIONS.map(a => (
              <button key={a.id} className={activity === a.id ? "on" : ""}
                onClick={() => setActivity(a.id)}>{a.label}</button>
            ))}
          </div>

          <div className="pl-nav">
            <button className="pl-back" onClick={() => setStep(1)}>Back</button>
            <button className="pl-btn" disabled={!step2Ready} onClick={() => setStep(3)}>Continue</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className="pl-h3">Which of these is closest?</h3>
          <div className="pl-opts">
            {GOAL_OPTIONS.map(g => (
              <button key={g.id} className={goal === g.id ? "on" : ""} onClick={() => setGoal(g.id)}>
                <strong>{g.label}</strong><em>{g.note}</em>
              </button>
            ))}
          </div>

          {goal && goal !== "maintain" && goal !== "health" && (
            <label className="pl-field">
              <span>Target weight, kg</span>
              <input type="number" value={goalWeight} onChange={e => setGoalWeight(e.target.value)} placeholder="70" />
            </label>
          )}

          <h3 className="pl-h3">Do you eat meat?</h3>
          <div className="pl-opts row">
            <button className={!veg ? "on" : ""} onClick={() => setVeg(false)}>Yes</button>
            <button className={veg ? "on" : ""} onClick={() => setVeg(true)}>Vegetarian</button>
          </div>

          <div className="pl-nav">
            <button className="pl-back" onClick={() => setStep(2)}>Back</button>
            <button className="pl-btn" disabled={!step3Ready} onClick={() => setStep(4)}>Build the plan</button>
          </div>
        </>
      )}
    </Shell>
  );
}

/* ---------------- shell ---------------- */

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
      <footer className="foot">
        <div className="wrap">
          <p>
            <strong>Signed-in plans are saved so we can check back in with you in two weeks.</strong>{" "}
            Prefer nothing stored? Use the <Link href="/plan-guest">guest calculator</Link> instead.
          </p>
          <p>
            General information about food. Not medical or dietary advice, and no substitute for
            someone who can see your bloodwork.
          </p>
          <p>© 2026 Aseem Mohan. · <a href="/privacy" style={{ color: "var(--turmeric)" }}>Privacy notice</a></p>
        </div>
      </footer>

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
        .pl-h3 {
          font-family: 'Manrope', sans-serif; font-size: .74rem; font-weight: 800;
          letter-spacing: .1em; text-transform: uppercase; color: var(--mute);
          margin: 30px 0 12px;
        }
        .pl-lede { color: var(--soft); margin: 0 0 26px; }
        .pl-hint { font-size: .8rem; color: var(--mute); margin: 8px 0 0; }
        .pl-note { font-size: .87rem; color: var(--soft); margin: 12px 0 0; }
        .pl-real { margin: 16px 0 0; font-size: .95rem; }

        .pl-field { display: block; margin-bottom: 14px; }
        .pl-field span {
          display: block; font-size: .74rem; font-weight: 800; letter-spacing: .09em;
          text-transform: uppercase; color: var(--mute); margin-bottom: 6px;
        }
        .pl-field input {
          width: 100%; padding: 13px 15px; border: 1px solid var(--rule);
          border-radius: 8px; font: inherit; font-size: 1rem;
          background: var(--card); color: var(--ink);
        }
        .pl-field input:focus { outline: 2px solid var(--turmeric); outline-offset: 1px; }
        .pl-row { display: grid; grid-template-columns: 1fr; gap: 0; }

        .pl-opts { display: grid; gap: 8px; }
        .pl-opts.row { grid-template-columns: 1fr 1fr; }
        .pl-opts button {
          text-align: left; background: var(--card); border: 1px solid var(--rule);
          border-radius: 8px; padding: 13px 16px; font: inherit; font-size: .92rem;
          color: var(--ink); cursor: pointer; transition: border-color 140ms ease, background 140ms ease;
        }
        .pl-opts button:hover { border-color: var(--leaf); }
        .pl-opts button.on { border-color: var(--leaf); background: #E3EDE7; }
        .pl-opts button strong { display: block; font-weight: 700; }
        .pl-opts button em { display: block; font-style: normal; font-size: .82rem; color: var(--soft); margin-top: 2px; }

        .pl-none {
          display: block; width: 100%; margin-top: 20px; padding: 14px;
          background: none; border: 1px dashed var(--rule); border-radius: 8px;
          font: inherit; font-size: .9rem; color: var(--soft); cursor: pointer;
        }
        .pl-none.on { border-style: solid; border-color: var(--leaf); background: #E3EDE7; color: var(--leaf); font-weight: 700; }

        .pl-btn {
          display: inline-block; margin-top: 28px; background: var(--leaf); color: #fff;
          border: none; border-radius: 8px; padding: 15px 30px; font: inherit;
          font-weight: 700; font-size: 1rem; cursor: pointer; text-decoration: none;
        }
        .pl-btn:hover { background: var(--leaf-lt); }
        .pl-btn:disabled { background: var(--mute); cursor: not-allowed; }
        .pl-btn.ghost { background: none; border: 1px solid var(--rule); color: var(--soft); }
        .pl-back { background: none; border: none; color: var(--soft); font: inherit; text-decoration: underline; cursor: pointer; padding: 15px 0; }
        .pl-nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; }

        .pl-block h1 { max-width: 16ch; }
        .pl-reasons { background: var(--chilli-lt); border-left: 4px solid var(--chilli); padding: 20px 22px; border-radius: 8px; margin: 24px 0; }
        .pl-reasons h3 { font-family: 'Fraunces', serif; font-size: 1rem; margin: 0 0 10px; }
        .pl-reasons p { font-size: .9rem; margin: 0 0 12px; }
        .pl-reasons p:last-child { margin: 0; }

        .pl-nums { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 20px; }
        .pl-nums div { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 16px 14px; }
        .pl-nums span { display: block; font-size: .64rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--mute); }
        .pl-nums b { display: block; font-family: 'Fraunces', serif; font-weight: 900; font-size: 1.6rem; letter-spacing: -.02em; margin: 4px 0 2px; }
        .pl-nums em { font-style: normal; font-size: .74rem; color: var(--soft); }

        .pl-caution { background: var(--turmeric-lt); border-left: 4px solid var(--turmeric); padding: 18px 20px; border-radius: 8px; margin-top: 24px; }
        .pl-caution h3 { font-family: 'Fraunces', serif; font-size: 1rem; margin: 0 0 8px; }
        .pl-caution p { font-size: .88rem; margin: 0 0 10px; }
        .pl-caution p:last-child { margin: 0; }

        .pl-warn { background: var(--chilli-lt); border-left: 4px solid var(--chilli); padding: 16px 18px; border-radius: 8px; margin-top: 14px; }
        .pl-warn p { margin: 0; font-size: .89rem; }

        .pl-habit { background: var(--leaf); color: #EFF3F0; border-radius: 10px; padding: 22px 24px; }
        .pl-habit strong { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.2rem; display: block; margin-bottom: 10px; }
        .pl-habit p { margin: 0; font-size: .92rem; color: #B9C9C0; }

        .pl-more { margin-top: 14px; }
        .pl-more summary { cursor: pointer; font-size: .88rem; color: var(--leaf); font-weight: 700; }
        .pl-more div { font-size: .89rem; color: var(--soft); margin-top: 12px; }
        .pl-more b { color: var(--ink); }

        .pl-plandays { margin-top: 16px; display: grid; gap: 8px; }
        .pl-day {
          background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 14px 16px;
        }
        .pl-day summary {
          cursor: pointer; font-weight: 700; display: flex; justify-content: space-between; gap: 10px;
        }
        .pl-day summary span { font-weight: 500; color: var(--soft); font-size: .85rem; }
        .pl-meal {
          display: grid; grid-template-columns: 90px 1fr auto; gap: 10px; align-items: center;
          padding: 8px 0; text-decoration: none; color: var(--ink); border-top: 1px solid var(--rule);
        }
        .pl-meal:first-of-type { border-top: none; margin-top: 10px; }
        .pl-meal-slot { font-size: .7rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--mute); }
        .pl-meal-name { font-weight: 600; display: block; }
        .pl-meal-portion { display: block; font-style: normal; font-size: .78rem; color: var(--mute); font-weight: 400; margin-top: 1px; }
        .pl-meal-nums { font-size: .8rem; color: var(--soft); white-space: nowrap; }

        .pl-dish {
          display: block; background: var(--card); border: 1px solid var(--rule);
          border-radius: 10px; padding: 16px 18px; margin-bottom: 10px; text-decoration: none;
        }
        .pl-dish:hover { border-color: var(--leaf); }
        .pl-dish-top { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
        .pl-dish strong { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.05rem; }
        .pl-dish span { font-weight: 800; color: var(--leaf); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .pl-dish p { margin: 8px 0 6px; font-size: .89rem; color: var(--soft); }
        .pl-dish em { font-style: normal; font-size: .78rem; color: var(--mute); }
        .pl-dish.solution { border-left: 4px solid var(--leaf); }
        .pl-dish.solution span { color: var(--leaf); }

        .pl-truths p {
          background: var(--card); border-left: 3px solid var(--steel);
          padding: 15px 17px; border-radius: 8px; margin: 0 0 10px;
          font-size: .9rem; color: var(--soft);
        }

        @media (min-width: 620px) {
          .pl-row { grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .pl-nums { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 619px) {
          .pl-opts.row { grid-template-columns: 1fr; }
          .pl-nav { flex-direction: column-reverse; align-items: stretch; gap: 2px; }
          .pl-btn { width: 100%; text-align: center; }
          .pl-dish-top { flex-direction: column; gap: 4px; }
          .pl-meal { grid-template-columns: 70px 1fr; }
          .pl-meal-nums { grid-column: 2; }
        }
      `}</style>
    </>
  );
}
