/**
 * Hydration plan — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/hydration.js
 *
 * Two parts: a daily water target, and honest guidance on sugary drinks —
 * which is arguably the single biggest lever most people have and don't
 * track (see the masala-chai teardown on the dish pages, same argument).
 */

const ACTIVITY_BONUS_ML = { sedentary: 0, light: 150, moderate: 300, high: 500 };

const ALTERNATIVES = [
  { name: "Water with mint, cucumber, or lemon", note: "Zero calories. Genuinely changes how plain water tastes, which is usually the actual complaint." },
  { name: "Unsweetened buttermilk (chaas) with roasted cumin", note: "Traditional, hydrating, and close to zero sugar as long as nothing sweet goes in." },
  { name: "Black tea or coffee, or with stevia instead of sugar", note: "Stevia is a plant-derived, non-caloric sweetener — a straightforward way to keep the ritual of a sweet drink without the sugar load." },
  { name: "Sparkling water with a wedge of lime", note: "Replaces the fizz-and-sweetness of a soft drink without the sugar." },
  { name: "Coconut water, in moderation", note: "Natural electrolytes, but it does carry its own sugar — a step down from a soft drink, not a zero-sugar swap." },
];

/**
 * @param {object} p
 * @param {number} p.weightKg
 * @param {string} p.activity - sedentary | light | moderate | high
 * @returns {{ dailyTargetMl: number, dailyTargetGlasses: number, note: string, sugarNote: string, alternatives: object[] }}
 */
export function buildHydrationPlan({ weightKg, activity }) {
  const base = Math.round(weightKg * 33);
  const bonus = ACTIVITY_BONUS_ML[activity] || 0;
  const dailyTargetMl = base + bonus;
  const dailyTargetGlasses = Math.round(dailyTargetMl / 250);

  return {
    dailyTargetMl,
    dailyTargetGlasses,
    note: bonus > 0
      ? `Roughly ${dailyTargetGlasses} glasses (250 ml each) a day — the baseline for your weight, plus extra for your activity level. More again on hot or humid days, or if you're sweating visibly.`
      : `Roughly ${dailyTargetGlasses} glasses (250 ml each) a day, based on your weight. More on hot or humid days, or if you're sweating visibly.`,
    sugarNote: "Sugary drinks are worth treating as the first thing to cut, not the last — they add calories with zero fibre, zero protein, and no fullness signal, so they're the easiest calories to remove without noticing. A single sweet drink or two a day can be a bigger lever than most food changes on this site.",
    alternatives: ALTERNATIVES,
  };
}
