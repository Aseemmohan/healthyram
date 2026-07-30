/**
 * Programme logic — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/program.js
 *
 * Order of operations is deliberate and must not be changed:
 *
 *   1. screen()      — medical gate. Runs FIRST. Can block everything.
 *   2. baseline()    — vitals, Asian thresholds, waist-to-height
 *   3. targets()     — calories, protein, timeline, with hard guardrails
 *   4. selectDishes()— which teardowns and which tier for this person
 *   5. habits()      — weekly stack, not a meal plan
 *
 * No plan is generated for anyone who fails screening. Not a softened
 * plan, not a plan with a warning. No plan.
 */

import { DISHES, forDiet } from "./dishes";

/* ============================================================
   1. MEDICAL SCREENING — the gate
   ============================================================ */

export const BLOCKING_MEDS = [
  { id: "sglt2", label: "SGLT2 inhibitor (empagliflozin, dapagliflozin, canagliflozin, Jardiance, Farxiga)",
    reason: "SGLT2 inhibitors reduce how the kidneys clear ketones and increase ketone production. Combined with a low-carbohydrate diet or fasting, this can cause ketoacidosis at normal blood sugar levels — a medical emergency that is easy to miss because glucose readings look fine. Cases have been reported even after stopping the medication." },
  { id: "glp1", label: "GLP-1 agonist (semaglutide, Ozempic, Wegovy, liraglutide, tirzepatide, Mounjaro)",
    reason: "Reduced appetite plus deliberate fasting can drop intake far below what is safe, and cases of ketoacidosis have been reported when these are combined with fasting. Your doctor should set the eating pattern alongside the medication." },
  { id: "insulin", label: "Insulin",
    reason: "Changing carbohydrate intake changes insulin requirements immediately. Doing this without dose adjustment risks severe hypoglycaemia." },
  { id: "sulfonylurea", label: "Sulfonylurea (glimepiride, gliclazide, glipizide)",
    reason: "These drive insulin release regardless of what you eat. Reducing carbohydrates without adjusting the dose risks hypoglycaemia." },
];

export const BLOCKING_CONDITIONS = [
  { id: "t1d",        label: "Type 1 diabetes", reason: "Any significant dietary change needs to be managed with your diabetes team." },
  { id: "pregnant",   label: "Pregnant or breastfeeding", reason: "This is not the time for a deficit or a restrictive eating pattern. Nutritional needs are higher, not lower." },
  { id: "kidney",     label: "Kidney disease", reason: "Protein and electrolyte targets must be set by your renal team, not a website." },
  { id: "liver",      label: "Liver disease", reason: "Fat metabolism and ketone handling are affected. This needs medical supervision." },
  { id: "pancreatitis", label: "History of pancreatitis", reason: "Higher-fat eating patterns can precipitate an episode." },
  { id: "gallbladder", label: "Gallbladder removed or gallstones", reason: "Fat digestion is impaired without normal bile storage. Higher-fat approaches often cause problems." },
  { id: "ed",         label: "History of an eating disorder", reason: "Calorie targets, tracking and restriction can restart patterns that are difficult to stop. Support from someone who knows your history will help more than any plan we could generate." },
  { id: "under18",    label: "Under 18", reason: "Growth requirements make deficit-based plans inappropriate." },
];

export const CAUTION_FLAGS = [
  { id: "metformin", label: "Metformin only, no other diabetes medication",
    note: "Metformin alone does not carry the same risk. Still tell your doctor you are changing your diet — your dose may need review as things improve." },
  { id: "bp",        label: "Blood pressure medication",
    note: "Lower carbohydrate intake causes fluid loss in the first two weeks. Blood pressure often falls, sometimes enough to need a dose review. Watch for dizziness on standing." },
  { id: "thyroid",   label: "Thyroid condition",
    note: "Take thyroid medication on an empty stomach, well away from your eating window if you use time-restricted eating." },
  { id: "over65",    label: "Over 65",
    note: "Protein needs are higher, not lower, and muscle loss is the main risk in a deficit. We have raised your protein target accordingly." },
];

/**
 * @returns {{ blocked: boolean, reasons: string[], cautions: string[] }}
 */
export function screen({ meds = [], conditions = [], age }) {
  const reasons = [];

  BLOCKING_MEDS.forEach(m => {
    if (meds.includes(m.id)) reasons.push(`${m.label} — ${m.reason}`);
  });
  BLOCKING_CONDITIONS.forEach(c => {
    if (conditions.includes(c.id)) reasons.push(`${c.label}. ${c.reason}`);
  });
  if (age !== undefined && age < 18) {
    reasons.push("Under 18. Growth requirements make deficit-based plans inappropriate.");
  }

  const cautions = CAUTION_FLAGS
    .filter(f => meds.includes(f.id) || conditions.includes(f.id) || (f.id === "over65" && age >= 65))
    .map(f => f.note);

  return { blocked: reasons.length > 0, reasons, cautions };
}

export const BLOCKED_MESSAGE =
  "We are not going to generate a plan for you, and that is deliberate rather than unhelpful. " +
  "The combination you have described has a documented risk of serious harm with the eating patterns this site is built around. " +
  "Take this page to your doctor — the specific question to ask is whether a lower-carbohydrate or time-restricted approach is safe alongside your current medication, and what monitoring you would need. " +
  "Most people get a workable answer. It just needs to come from someone who can see your bloodwork.";

/* ============================================================
   2. BASELINE — Asian thresholds throughout
   ============================================================ */

export const BMI_BANDS = [
  { max: 18.5, label: "Underweight",  risk: "low-weight" },
  { max: 23.0, label: "Healthy",      risk: "none" },
  { max: 27.5, label: "Overweight",   risk: "raised" },
  { max: 999,  label: "Obese",        risk: "high" },
];

export const WAIST_LIMIT = { male: 90, female: 80 }; // cm, South Asian

export function baseline({ sex, age, heightCm, weightKg, waistCm }) {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  const band = BMI_BANDS.find(b => bmi < b.max);
  const whtr = waistCm / heightCm;
  const waistOver = waistCm > WAIST_LIMIT[sex];

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiBand: band.label,
    bmiRisk: band.risk,
    whtr: Math.round(whtr * 100) / 100,
    whtrOk: whtr < 0.5,
    waistCm,
    waistLimit: WAIST_LIMIT[sex],
    waistOver,
    waistExcess: waistOver ? Math.round(waistCm - WAIST_LIMIT[sex]) : 0,
    note: "Thresholds used here are the Asian cutoffs — overweight from BMI 23 rather than 25, and waist limits of 90 cm for men and 80 cm for women. South Asians develop insulin resistance at lower body weights than European populations, so Western calculators will tell you that you are fine when you are not.",
    headline: whtr >= 0.5
      ? "Your waist is more than half your height. That is the number to move first — it responds faster than weight and it tracks the fat that actually matters."
      : "Your waist-to-height ratio is in the healthy range. Keep it under 0.5 and most of the metabolic risk looks after itself.",
  };
}

/* ============================================================
   3. TARGETS — with guardrails that cannot be overridden
   ============================================================ */

const ACTIVITY = {
  sedentary: { factor: 1.2,  label: "Desk job, little walking" },
  light:     { factor: 1.375, label: "Some walking, occasional activity" },
  moderate:  { factor: 1.55, label: "Active most days" },
  high:      { factor: 1.725, label: "Physically demanding work or daily training" },
};

export const GOALS = {
  fatloss:  { label: "Fat loss",        deficitPct: 0.20, proteinPerKg: 1.8 },
  weight:   { label: "Weight loss",     deficitPct: 0.20, proteinPerKg: 1.8 },
  toning:   { label: "Body composition",deficitPct: 0.15, proteinPerKg: 2.0 },
  maintain: { label: "Maintain",        deficitPct: 0.00, proteinPerKg: 1.6 },
  health:   { label: "Metabolic health",deficitPct: 0.12, proteinPerKg: 1.6 },
};

const FLOOR = { female: 1300, male: 1600 };

export function targets({ sex, age, heightCm, weightKg, activity, goal, goalWeightKg }) {
  // Mifflin-St Jeor
  const bmr = Math.round(
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161)
  );
  const tdee = Math.round(bmr * ACTIVITY[activity].factor);
  const g = GOALS[goal];

  const warnings = [];

  // Guardrail: goal weight must not go below BMI 18.5
  const minHealthy = Math.round(18.5 * Math.pow(heightCm / 100, 2) * 10) / 10;
  let target = goalWeightKg;
  if (target && target < minHealthy) {
    target = minHealthy;
    warnings.push(
      `The goal weight you entered is below a healthy range for your height. We have set it to ${minHealthy} kg, which is the lowest weight we will build a plan around. If you feel strongly that you need to be lighter than that, please speak to a doctor rather than following anything generated here.`
    );
  }

  // Guardrail: calorie floor
  let intake = Math.round(tdee * (1 - g.deficitPct));
  if (intake < FLOOR[sex]) {
    intake = FLOOR[sex];
    warnings.push(
      `We have raised your daily intake to ${FLOOR[sex]} kcal. Going lower costs you muscle rather than fat, and it is not sustainable past a few weeks.`
    );
  }
  if (intake < bmr) {
    intake = bmr;
    warnings.push("Your target has been set at your resting metabolic rate. Eating below the energy your body uses at rest is counterproductive.");
  }

  // Guardrail: rate of loss, 0.5–1.0% bodyweight per week
  const weeklyDeficit = (tdee - intake) * 7;
  let weeklyLossKg = weeklyDeficit / 7700;
  const maxWeekly = weightKg * 0.01;
  if (weeklyLossKg > maxWeekly) {
    weeklyLossKg = maxWeekly;
    warnings.push("Loss rate capped at 1% of bodyweight per week. Faster than that is mostly water and muscle, and it comes back.");
  }

  const proteinG = Math.round((target || weightKg) * (age >= 65 ? g.proteinPerKg + 0.2 : g.proteinPerKg));
  const toLose = target ? Math.max(0, weightKg - target) : 0;
  const weeks = weeklyLossKg > 0 ? Math.ceil(toLose / weeklyLossKg) : 0;

  return {
    bmr, tdee,
    intake,
    deficit: tdee - intake,
    proteinG,
    proteinNote: "Protein is the one number worth hitting exactly. In a deficit it is what decides whether you lose fat or lose muscle.",
    fibreG: 30,
    goalWeight: target,
    weeklyLossKg: Math.round(weeklyLossKg * 100) / 100,
    weeks,
    realistic: weeks > 0
      ? `About ${weeks} weeks at a sustainable rate. Expect it to take longer than that — everyone has weeks where nothing moves, and those weeks are normal rather than failure.`
      : "Maintenance. The target is holding your waist measurement, not the number on the scale.",
    warnings,
  };
}

/* ============================================================
   4. DISH SELECTION
   ============================================================ */

/**
 * Which tier to recommend, per dish, for this person.
 * Aggression rises with how far the person is from their goal —
 * not with how motivated they claim to be on day one.
 */
export function selectDishes({ veg, goal, baselineResult, eats = [] }) {
  const pool = veg ? DISHES.filter(d => d.veg) : DISHES;

  const far = baselineResult.whtr >= 0.58 || baselineResult.bmiRisk === "high";
  const some = baselineResult.whtr >= 0.5 || baselineResult.bmiRisk === "raised";
  const defaultTier = far ? 2 : 1;

  const kcal = d => d.components.reduce((s, c) => s + c.kcal, 0);
  const prot = d => d.components.reduce((s, c) => s + c.protein, 0);
  /** Grams of protein per 100 kcal. Above 6 is genuinely protein-dense. */
  const density = d => (prot(d) / kcal(d)) * 100;

  const shape = (d, tierLevel) => {
    const tier = d.tiers.find(t => t.level === tierLevel) || d.tiers[0];
    return {
      id: d.id,
      name: d.name,
      veg: d.veg,
      role: d.role || "problem",
      kcal: kcal(d),
      protein: prot(d),
      density: Math.round(density(d) * 10) / 10,
      recommendedTier: tier.level,
      tier,
      headline: d.headline,
    };
  };

  /* Solutions — what to eat. Ordered by protein density, best first.
     Tier 1 for these, because the point is to eat them, not to fix them. */
  const solutions = pool
    .filter(d => d.role === "solution")
    .sort((a, b) => density(b) - density(a))
    .slice(0, 5)
    .map(d => shape(d, 1));

  /* Fixes — what to change. Ordered by what the change saves. */
  const fixes = pool
    .filter(d => d.role !== "solution")
    .filter(d => eats.length === 0 || eats.includes(d.id))
    .map(d => {
      const worst = Math.max(...d.components.map(c => c.kcal));
      const share = worst / kcal(d);
      let level = goal === "maintain" ? 1 : defaultTier;
      if (share > 0.5 && far) level = Math.min(3, level + 1);
      return shape(d, level);
    })
    .sort((a, b) => b.tier.saves - a.tier.saves)
    .slice(0, 6);

  return { solutions, fixes };
}


/* ============================================================
   5. HABITS — not a meal plan
   ============================================================ */

export function habits({ targets: t, baselineResult, week = 1 }) {
  const stack = [
    { week: 1, habit: `Hit ${t.proteinG} g of protein a day. Nothing else changes this week.`,
      why: "Protein first. It is the only target that protects muscle, and it reduces appetite enough that the rest becomes easier." },
    { week: 2, habit: "Cut added sugar in tea and coffee by half.",
      why: "At four or five cups a day this is 200 kcal with no willpower cost after the first fortnight." },
    { week: 3, habit: "One tablespoon of cooking oil per dish, not two.",
      why: "The highest-leverage, lowest-taste-cost change in Indian cooking. Nobody notices it in a well-spiced dish." },
    { week: 4, habit: "Walk 20 minutes after your largest meal.",
      why: "Blunts the glucose response measurably. No gym, no equipment, no change of clothes." },
    { week: 5, habit: "Two resistance sessions. Bodyweight is fine.",
      why: "Without a resistance stimulus you will lose weight and look softer rather than tighter. Protein alone does not protect muscle." },
    { week: 6, habit: "Stop eating three hours before bed.",
      why: "The simplest form of time-restricted eating, and the one that improves sleep rather than costing it." },
    { week: 7, habit: "Measure your waist. Same spot, same time of day.",
      why: "It moves before the scale does. On weeks when weight stalls, this is the number that keeps you going." },
    { week: 8, habit: "Rebuild one regular meal using its tier-two swap.",
      why: "One meal, permanently changed, beats a diet you abandon in three weeks." },
  ];
  return { current: stack.find(s => s.week === week), stack };
}

/* ============================================================
   6. HONESTY NOTES — surface these, do not bury them
   ============================================================ */

export const TRUTHS = {
  toning: "Toning is not a thing. It is fat loss with muscle kept. Muscle is kept by eating enough protein and giving your muscles a reason to stay — which means resistance work. Without that you will get lighter and softer, not tighter. You do not need a gym. You do need resistance.",
  spotReduction: "You cannot choose where fat comes off. Belly fat usually goes last in men and hips last in women. This is genetics and it is not negotiable.",
  plateau: "Two to three weeks with no movement is normal, not failure. Weight is mostly water on any given day. Trust the waist measurement and the monthly trend.",
  keto: "Low-carb works very well for some people, mostly because it kills appetite and reduces the number of food decisions you make in a day. In controlled studies it does not beat other approaches once protein and calories match. Choose it because it suits you, not because it is metabolically special.",
  fasting: "Time-restricted eating is a tool for eating less without counting. If you eat the same amount in a shorter window, nothing happens. That is not a failure of fasting, it is arithmetic.",
  estimates: "Every calorie figure on this site is an estimate. Restaurant portions vary by a third, and absorbed frying oil cannot be measured from a table. Use these numbers to compare dishes and find the drivers, not as precise accounting.",
};
