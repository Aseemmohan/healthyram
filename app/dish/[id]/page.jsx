/**
 * Dish teardown — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/dish/[id]/page.jsx
 * The folder name includes the square brackets: [id]
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { DISHES, byId, totals } from "../../../lib/dishes";

export function generateStaticParams() {
  return DISHES.map(d => ({ id: d.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = byId(id);
  if (!dish) return { title: "Not found — Healthyram" };
  return {
    title: `${dish.name} — ${totals(dish).kcal} kcal, and where they actually are | Healthyram`,
    description: dish.headline,
  };
}

const TAG = { driver: "Where the damage is", good: "Worth eating", neutral: null };

function costClass(text) {
  const t = text.toLowerCase();
  if (t.startsWith("none") || t.startsWith("almost none")) return "none";
  if (t.startsWith("high")) return "high";
  return "some";
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = byId(id);
  if (!dish) notFound();

  const t = totals(dish);
  const segs = [...dish.components].sort((a, b) => b.kcal - a.kcal);

  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link className="mark" href="/">healthy<em>ram</em></Link>
          <Link className="nav-link" href="/">All dishes</Link>
        </div>
      </nav>

      <header className="dishhead">
        <div className="wrap">
          <p className="eyebrow">{dish.category === "sweet" ? "Sweet" : "Teardown"}</p>
          <h1>{dish.name}</h1>
          <div className="dish-meta">
            <span className="dish-kcal">{t.kcal}<small>kcal</small></span>
            <span className="dish-portion">{dish.portion}</span>
          </div>

          {dish.image && (
            <div className="photo">
              <img src={dish.image} alt={dish.name} />
            </div>
          )}

          <div className="demo">
            <p className="demo-cap">Where they sit</p>
            <div className="bar tall">
              {segs.map((c, i) => {
                const pct = (c.kcal / t.kcal) * 100;
                return (
                  <div
                    key={i}
                    className={`bar-seg ${c.verdict}`}
                    style={{ width: `${pct}%`, animationDelay: `${i * 90}ms` }}
                    title={`${c.name} — ${c.kcal} kcal`}
                  >
                    {pct > 18 && <span>{c.name}</span>}
                  </div>
                );
              })}
            </div>
            <div className="key">
              <span><i className="driver" />Driving the calories</span>
              <span><i className="neutral" />Neutral</span>
              <span><i className="good" />Worth eating</span>
            </div>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="verdict">
          <p className="eyebrow">The verdict</p>
          <p>{dish.headline}</p>
        </section>

        <section className="sec">
          <h2>Component by component</h2>
          <p className="sec-note">
            Per {dish.portion.toLowerCase()}. Estimates
            {dish.verified ? "" : ", not yet verified against IFCT 2017"}.
          </p>
          {dish.components.map((c, i) => (
            <article className={`comp ${c.verdict}`} key={i}>
              <div className="comp-top">
                <div>
                  <div className="comp-name">{c.name}</div>
                  <div className="comp-qty">{c.qty}{c.grams ? ` · ~${c.grams} g` : ""}</div>
                </div>
                <div className="comp-kcal">{c.kcal}</div>
              </div>
              <div className="macros">
                <div><span>Carbs</span><b>{c.carb} g</b></div>
                <div><span>Protein</span><b>{c.protein} g</b></div>
                <div><span>Fat</span><b>{c.fat} g</b></div>
                <div><span>Fibre</span><b>{c.fibre} g</b></div>
              </div>
              <p className="comp-note">{c.note}</p>
              {c.basis && <p className="comp-basis">Computed from {c.basis}</p>}
              {TAG[c.verdict] && <span className={`tag ${c.verdict}`}>{TAG[c.verdict]}</span>}
            </article>
          ))}

          {dish.multiplier && (
            <div className="mult">
              <h3>{dish.multiplier.note}</h3>
              <p>One cup looks trivial. The arithmetic is what gets people, and almost nobody does it.</p>
              <div className="mult-nums">
                <div><span>Per day</span><b>{dish.multiplier.dailyKcal}</b></div>
                <div><span>Per week</span><b>{dish.multiplier.weeklyKcal.toLocaleString()}</b></div>
                <div><span>Per year</span><b>{dish.multiplier.yearlyKg} kg</b></div>
              </div>
            </div>
          )}
        </section>

        <section className="sec">
          <h2>Three ways to fix it</h2>
          <p className="sec-note">Ordered by what you give up.</p>
          {dish.tiers.map(tier => (
            <article className="tier" key={tier.level}>
              <div className="tier-top">
                <span className="tier-n">Option {tier.level} · {tier.label}</span>
                <span className="tier-save">−{tier.saves}</span>
              </div>
              <h3>{tier.change}</h3>
              <p className="tier-why">{tier.why}</p>
              <p className={`cost ${costClass(tier.tasteCost)}`}>
                <b>Taste cost:</b> {tier.tasteCost}
              </p>
            </article>
          ))}
        </section>

        <Link className="back" href="/">← All thirty dishes</Link>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p>
            <strong>About these numbers.</strong> Estimates based on typical restaurant
            preparation. Portions vary widely, and oil absorbed during frying is the least
            certain figure here — it cannot be read off a composition table.
          </p>
          <p>
            General information about food. Not medical or dietary advice. If you have diabetes,
            kidney or liver disease, or take medication for any of them, speak to your doctor
            before changing how you eat.
          </p>
          <p>© 2026 Aseem Mohan.</p>
        </div>
      </footer>
    </>
  );
}
