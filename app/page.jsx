/**
 * Landing page — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: app/page.jsx   (delete the default app/page.tsx first)
 * Server component — statically generated, fully indexable.
 */

import Link from "next/link";
import { DISHES, PENDING, CATEGORIES, byId, totals, concentration } from "../lib/dishes";

export const metadata = {
  title: "Healthyram — where the calories in Indian food actually are",
  description:
    "Honest teardowns of thirty everyday Indian dishes. Which component is doing the damage, and three ways to fix it, with the taste cost stated plainly.",
};

function Bar({ dish, tall = false }) {
  const t = totals(dish);
  const segs = [...dish.components].sort((a, b) => b.kcal - a.kcal);
  return (
    <div className={`bar ${tall ? "tall" : "mini"}`}>
      {segs.map((c, i) => {
        const pct = (c.kcal / t.kcal) * 100;
        return (
          <div
            key={i}
            className={`bar-seg ${c.verdict}`}
            style={{ width: `${pct}%`, animationDelay: `${i * 90}ms` }}
            title={`${c.name} — ${c.kcal} kcal`}
          >
            {tall && pct > 18 && <span>{c.name}</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const demo = byId("chole-bhature") || DISHES[0];

  return (
    <>
      <nav className="nav">
        <div className="nav-in">
          <Link className="mark" href="/">healthy<em>ram</em></Link>
          <span className="nav-link">Thirty dishes, honest numbers</span>
        </div>
      </nav>

      <header className="hero">
        <div className="wrap">
          <p className="eyebrow">Not another recipe blog</p>
          <h1>
            One component is doing seventy per cent of the damage.
            <br />
            <em>It is rarely the one you think.</em>
          </h1>
          <p className="hero-sub">
            We take thirty everyday Indian dishes apart and show you exactly where the calories
            sit — then give you three ways to fix each one, with the taste cost stated plainly
            instead of pretended away.
          </p>

          <div className="demo">
            <p className="demo-cap">
              <b>{demo.name}</b> · {totals(demo).kcal} kcal · {demo.portion.toLowerCase()}
            </p>
            <Bar dish={demo} tall />
            <div className="key">
              <span><i className="driver" />Driving the calories</span>
              <span><i className="neutral" />Neutral</span>
              <span><i className="good" />Worth eating</span>
            </div>
          </div>
        </div>
      </header>

      <div className="chips">
        <div className="chips-in">
          {CATEGORIES.map(c => (
            <a className="chip" href={`#${c.id}`} key={c.id}>{c.label}</a>
          ))}
        </div>
      </div>

      <main className="wrap">
        {CATEGORIES.map(cat => {
          const live = DISHES.filter(d => d.category === cat.id);
          const soon = PENDING.filter(d => d.category === cat.id);
          if (!live.length && !soon.length) return null;

          return (
            <section className="band" id={cat.id} key={cat.id}>
              <h2>{cat.label}</h2>
              <p className="band-note">
                {live.length} {live.length === 1 ? "teardown" : "teardowns"}
                {soon.length ? ` · ${soon.length} in progress` : ""}
              </p>
              <div className="grid">
                {live.map(d => {
                  const t = totals(d);
                  return (
                    <Link className="card" href={`/dish/${d.id}`} key={d.id}>
                      <div className="card-top">
                        <h3>{d.name}</h3>
                        <span className="card-kcal">{t.kcal} kcal</span>
                      </div>
                      <p className="card-line">{d.headline}</p>
                      <Bar dish={d} />
                      <p className="card-foot">{concentration(d)}% in one component</p>
                    </Link>
                  );
                })}
                {soon.map(d => (
                  <div className="card soon" key={d.id}>
                    <div className="card-top"><h3>{d.name}</h3></div>
                    <p className="card-line">Teardown in progress.</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="foot">
        <div className="wrap">
          <p>
            <strong>About the numbers.</strong> Every figure here is an estimate. Restaurant
            portions vary by a third or more, and oil absorbed during frying cannot be read off
            any composition table — it has to be estimated, and it is frequently the largest
            number on the page. Use these to compare dishes and find what is driving the
            calories, not as precise accounting.
          </p>
          <p>
            Values are being verified against the Indian Food Composition Tables 2017, published
            by the National Institute of Nutrition, Hyderabad. Dishes are marked verified once
            that is done.
          </p>
          <p>
            General information about food. Not medical or dietary advice, and no substitute for
            someone who can see your bloodwork.
          </p>
          <p>© 2026 Aseem Mohan.</p>
        </div>
      </footer>
    </>
  );
}
