/**
 * Meal plan generator — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/mealplan.js
 *
 * Takes the output of targets() from lib/program.js and assembles a
 * 14-day plan from the existing dish library. No new dish data is
 * required to ship this — slot assignment (breakfast/lunch/dinner/
 * snack) is inferred from each dish's existing `category`, `role`
 * and calorie count, using the rules below.
 *
 * THIS IS A HEURISTIC, NOT NUTRITION SCIENCE. It is deterministic
 * (same inputs always produce the same plan) and it is honest about
 * being an estimate, same as the rest of the site — see the note it
 * attaches to every generated plan.
 *
 * If you later want tighter control, add a `mealSlot` field directly
 * to each dish object in dishes.js / dishes-more.js / dishes-protein.js
 * (e.g. mealSlot: "lunch") and inferSlot() below will prefer it over
 * the heuristic automatically.
 */

import { DISHES, totals } from "./dishes";

const SPLIT = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 };
const DAYS = 14;
const LOOKBACK = 3; // don't repeat a dish within this many days

function kcalOf(d) { return totals(d).kcal; }
function proteinOf(d) { return totals(d).protein; }
function density(d) { return kcalOf(d) > 0 ? (proteinOf(d) / kcalOf(d)) * 100 : 0; }

/** Infer which meal(s) a dish reasonably fills. Explicit `mealSlot` wins if present. */
function inferSlots(d) {
  if (d.mealSlot) return [d.mealSlot];
  const kcal = kcalOf(d);
  if (d.category === "breakfast") return ["breakfast"];
  if (d.category === "sweet") return ["snack"];
  if (d.category === "street") return kcal < 200 ? ["snack"] : ["snack", "lunch"];
  if (kcal < 180) return ["snack"];
  return ["lunch", "dinner"];
}

function buildPools(veg) {
  const pool = DISHES.filter(d => !veg || d.veg);
  const pools = { breakfast: [], lunch: [], dinner: [], snack: [] };
  pool.forEach(d => {
    inferSlots(d).forEach(slot => pools[slot].push(d));
  });
  return pools;
}

/** Pick the best candidate for a slot: closest to the calorie target,
 *  preferring protein-dense dishes when the day is behind on protein,
 *  and avoiding anything used in the last LOOKBACK days. */
function pickForSlot(pool, targetKcal, recentIds, proteinBehind) {
  const candidates = pool.filter(d => !recentIds.has(d.id));
  const usable = candidates.length ? candidates : pool; // relax if pool is small
  const scored = usable.map(d => {
    const kcalGap = Math.abs(kcalOf(d) - targetKcal);
    const proteinBonus = proteinBehind ? density(d) * 4 : 0;
    return { d, score: kcalGap - proteinBonus };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0]?.d || null;
}

/**
 * @param {object} t - the object returned by targets() in lib/program.js
 * @param {boolean} veg
 * @returns {{ days: Array, summary: object }}
 */
export function generateMealPlan(t, veg) {
  const pools = buildPools(veg);
  const recent = []; // queue of Sets, one per day, length LOOKBACK
  let sweetUsed = false;
  const days = [];

  for (let day = 1; day <= DAYS; day++) {
    const recentIds = new Set(recent.flatMap(s => [...s]));
    const dayMeals = [];
    let runningProtein = 0;
    let runningKcal = 0;

    for (const slot of ["breakfast", "lunch", "snack", "dinner"]) {
      const slotTargetKcal = Math.round(t.intake * SPLIT[slot]);
      const expectedProteinByNow = t.proteinG * (
        slot === "breakfast" ? 0.25 : slot === "lunch" ? 0.60 : slot === "snack" ? 0.65 : 1.0
      );
      const behind = runningProtein < expectedProteinByNow;

      let candidatePool = pools[slot];
      // Sweets: at most once across the whole 14 days, and never two days running
      if (slot === "snack") {
        candidatePool = candidatePool.filter(d => d.category !== "sweet" || !sweetUsed);
      }

      const dish = pickForSlot(candidatePool, slotTargetKcal, recentIds, behind);
      if (!dish) continue;

      if (dish.category === "sweet") sweetUsed = true;
      recentIds.add(dish.id);

      const dk = kcalOf(dish), dp = proteinOf(dish);
      runningKcal += dk;
      runningProtein += dp;

      dayMeals.push({
        slot,
        id: dish.id,
        name: dish.name,
        kcal: dk,
        protein: dp,
        veg: dish.veg,
      });
    }

    days.push({
      day,
      meals: dayMeals,
      totalKcal: runningKcal,
      totalProtein: Math.round(runningProtein),
      proteinTarget: t.proteinG,
      kcalTarget: t.intake,
    });

    recent.push(new Set(dayMeals.map(m => m.id)));
    if (recent.length > LOOKBACK) recent.shift();
  }

  const avgKcal = Math.round(days.reduce((s, d) => s + d.totalKcal, 0) / DAYS);
  const avgProtein = Math.round(days.reduce((s, d) => s + d.totalProtein, 0) / DAYS);

  return {
    days,
    summary: {
      avgKcal,
      avgProtein,
      target: { kcal: t.intake, protein: t.proteinG },
      note: "Built from the same estimates as the rest of the site — restaurant portions vary, and this rotates the dish library to hit your calorie and protein target on average across the fortnight, not to the gram on any single day.",
    },
  };
}
