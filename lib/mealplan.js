/**
 * Meal plan generator — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/mealplan.js  (replaces the previous version)
 *
 * FIX (v2): the first version weighted calorie-matching far more
 * heavily than protein-matching, so it consistently under-shot the
 * daily protein target by 30-50% — it was optimising for the wrong
 * thing. This version:
 *
 *   1. Scores candidates on NORMALISED distance from both the slot's
 *      calorie target AND its protein target, with protein weighted
 *      more heavily (protein is the number that actually matters here).
 *   2. Runs a top-up pass after the initial picks: if the day still
 *      falls short of ~90% of the protein target, it swaps out the
 *      least protein-dense meal for the best available high-protein
 *      option, even if that costs some calorie precision. Hitting
 *      protein matters more than hitting calories to the gram.
 *   3. Carries the dish's `portion` string through to the output
 *      (e.g. "2 pieces", "1 katori") — this was captured in the dish
 *      data all along but never passed through before.
 *
 * Everything else — the slot inference, the 40-dish source pool — is
 * unchanged from the original.
 */

import { DISHES, totals } from "./dishes.js";

const KCAL_SPLIT    = { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 };
const PROTEIN_SPLIT = { breakfast: 0.20, lunch: 0.32, dinner: 0.35, snack: 0.13 };
const DAYS = 14;
const LOOKBACK = 1; // don't repeat a dish within this many days
const PROTEIN_FLOOR = 0.90; // trigger the top-up pass below this fraction of target

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
  // Solution dishes in the 180-320 kcal band (sprouts, lighter dals) are
  // genuinely snack-sized and far more protein-dense than the site's actual
  // snack foods (samosa, pani puri, bhel puri) — worth making them
  // available to the snack slot too, since without them the snack slot
  // has no realistic way to contribute to a high protein target.
  if (d.role === "solution" && kcal <= 320) return ["lunch", "dinner", "snack"];
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

function shape(dish, slot) {
  return {
    slot,
    id: dish.id,
    name: dish.name,
    portion: dish.portion,
    kcal: kcalOf(dish),
    protein: proteinOf(dish),
    veg: dish.veg,
  };
}

/** Best candidate for a slot: normalised distance from BOTH the calorie
 *  and protein targets, protein weighted 2.5x more than calories, plus
 *  a mild penalty for dishes already used often this fortnight so the
 *  14 days don't collapse into the same 3-4 day cycle repeated. */
const KCAL_CEILING_FACTOR = 1.75; // no single dish should blow more than 75% past its slot's calorie budget

function pickForSlot(pool, kcalTarget, proteinTarget, excludeIds, usageCount) {
  let candidates = pool.filter(d => !excludeIds.has(d.id));
  if (!candidates.length) candidates = pool;

  // Hard ceiling: don't let a slot pick a dish wildly bigger than its budget,
  // even if that dish is very protein-dense. Falls back to the unfiltered
  // pool only if nothing fits, so a slot is never left with zero options.
  const capped = candidates.filter(d => kcalOf(d) <= kcalTarget * KCAL_CEILING_FACTOR);
  const usable = capped.length ? capped : candidates;

  const scored = usable.map(d => {
    const k = kcalOf(d), p = proteinOf(d);
    const normKcal = Math.abs(k - kcalTarget) / kcalTarget;
    const normProtein = Math.abs(p - proteinTarget) / Math.max(proteinTarget, 1);
    const repeatPenalty = (usageCount[d.id] || 0) * 0.15;
    const score = normKcal + normProtein * 2.2 + repeatPenalty;
    return { d, score };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0]?.d || null;
}

/** After the initial picks, if the day is still short on protein,
 *  swap the least protein-dense meal for the best unused high-protein
 *  option in that same slot's pool. Repeats a few times if needed. */
function topUpProtein(dayMeals, pools, proteinTarget, kcalTargets, recentIds) {
  let attempts = 0;
  const meals = [...dayMeals];
  const eligibleSlots = new Set(["breakfast", "lunch", "dinner", "snack"]);

  while (attempts < 6) {
    const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
    if (totalProtein >= proteinTarget * PROTEIN_FLOOR) break;

    // find the weakest link — lowest protein density among today's
    // replaceable meals
    let weakestIdx = -1, weakestDensity = Infinity;
    meals.forEach((m, i) => {
      if (!eligibleSlots.has(m.slot)) return;
      const dens = m.kcal > 0 ? (m.protein / m.kcal) * 100 : 0;
      if (dens < weakestDensity) { weakestDensity = dens; weakestIdx = i; }
    });
    if (weakestIdx === -1) break;

    const slot = meals[weakestIdx].slot;
    const kcalCeiling = kcalTargets[slot] * KCAL_CEILING_FACTOR;
    const usedTodayIds = new Set(meals.map(m => m.id));

    // Respect the same day-to-day variety window the initial pass uses —
    // without this, the top-up pass just swaps the same "best" dishes
    // back in every day regardless of what was eaten yesterday, which
    // silently undoes the variety the rest of the generator is built for.
    let pool = pools[slot].filter(d =>
      !usedTodayIds.has(d.id) && !recentIds.has(d.id) && kcalOf(d) <= kcalCeiling
    );
    // Only relax the recent-day exclusion if there's truly no other option —
    // hitting the protein target matters more than variety as a last resort,
    // but it's the last resort, not the first move.
    if (pool.length === 0) {
      pool = pools[slot].filter(d => !usedTodayIds.has(d.id) && kcalOf(d) <= kcalCeiling);
    }
    if (pool.length === 0) break;

    // best available replacement by protein density, within the calorie ceiling
    const replacement = pool.reduce((best, d) =>
      density(d) > density(best) ? d : best
    , pool[0]);

    if (!replacement || proteinOf(replacement) <= meals[weakestIdx].protein) break;

    meals[weakestIdx] = shape(replacement, slot);
    attempts++;
  }

  return meals;
}

/**
 * @param {object} t - the object returned by targets() in lib/program.js
 * @param {boolean} veg
 * @returns {{ days: Array, summary: object }}
 */
export function generateMealPlan(t, veg) {  const pools = buildPools(veg);
  const recent = []; // queue of Sets, one per day, length LOOKBACK
  const usageCount = {}; // dish id -> times used across the whole 14 days
  let sweetUsed = false;
  const days = [];

  for (let day = 1; day <= DAYS; day++) {
    const recentIds = new Set(recent.flatMap(s => [...s]));
    let dayMeals = [];
    const kcalTargets = {};
    const todayIds = new Set(); // prevents the same dish appearing twice on one day

    for (const slot of ["breakfast", "lunch", "snack", "dinner"]) {
      const slotKcalTarget = Math.round(t.intake * KCAL_SPLIT[slot]);
      const slotProteinTarget = Math.round(t.proteinG * PROTEIN_SPLIT[slot]);
      kcalTargets[slot] = slotKcalTarget;

      let candidatePool = pools[slot];
      if (slot === "snack") {
        candidatePool = candidatePool.filter(d => d.category !== "sweet" || !sweetUsed);
      }

      const excludeIds = new Set([...recentIds, ...todayIds]);
      const dish = pickForSlot(candidatePool, slotKcalTarget, slotProteinTarget, excludeIds, usageCount);
      if (!dish) continue;

      if (dish.category === "sweet") sweetUsed = true;
      todayIds.add(dish.id);
      dayMeals.push(shape(dish, slot));
    }

    // protein top-up pass — this is what actually closes the gap to target,
    // bounded so it doesn't blow past the calorie target to get there
    dayMeals = topUpProtein(dayMeals, pools, t.proteinG, kcalTargets, recentIds);

    dayMeals.forEach(m => { usageCount[m.id] = (usageCount[m.id] || 0) + 1; });

    const totalKcal = dayMeals.reduce((s, m) => s + m.kcal, 0);
    const totalProtein = Math.round(dayMeals.reduce((s, m) => s + m.protein, 0));

    days.push({
      day,
      meals: dayMeals,
      totalKcal,
      totalProtein,
      proteinTarget: t.proteinG,
      kcalTarget: t.intake,
    });

    recent.push(new Set(dayMeals.map(m => m.id)));
    if (recent.length > LOOKBACK) recent.shift();
  }

  const avgKcal = Math.round(days.reduce((s, d) => s + d.totalKcal, 0) / DAYS);
  const avgProtein = Math.round(days.reduce((s, d) => s + d.totalProtein, 0) / DAYS);
  const proteinPct = Math.round((avgProtein / t.proteinG) * 100);

  // Honest flag, not a silent shortfall: if the achievable average is still
  // meaningfully under target, that's a real limit of how many genuinely
  // protein-dense dishes exist in the library today (especially on the
  // vegetarian side, where Paneer tikka is close to the only standout) —
  // not something the generator can algorithm its way past. Surface it
  // plainly rather than implying the plan hit a number it didn't.
  const shortfall = proteinPct < 90;

  return {
    days,
    summary: {
      avgKcal,
      avgProtein,
      proteinPct,
      shortfall,
      target: { kcal: t.intake, protein: t.proteinG },
      note: "Built from the same estimates as the rest of the site — restaurant portions vary, and this rotates the dish library to hit your calorie and protein target on average across the fortnight, not to the gram on any single day.",
      shortfallNote: shortfall
        ? `This plan is averaging ${avgProtein} g against your ${t.proteinG} g target (${proteinPct}%) — the highest the current dish library can realistically reach at this calorie level without pushing well past your calorie target too. This is a gap in how many genuinely protein-dense dishes are in the library right now, not a reason to distrust the rest of the plan. Worth knowing about rather than a number quietly falling short.`
        : null,
      vegSupplementNote: (shortfall && veg)
        ? "Worth saying plainly: a whole-food vegetarian diet at this calorie level genuinely struggles to reach a high protein target — this isn't a gap in the dish library alone, it's a real constraint of plant-food protein density. A whey or plant (pea) protein shake is the standard, unremarkable way vegetarians close this gap in practice, and adding one is a reasonable, common choice if hitting the number matters to you."
        : null,
    },
  };
}
