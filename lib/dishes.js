/**
 * Dish library — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/dishes.js   (replace the file entirely)
 *
 * ─────────────────────────────────────────────────────────────
 * WHAT "VERIFIED" MEANS HERE
 *
 * The ten dishes below are marked verified: true. That means the
 * INGREDIENT values come from the Indian Food Composition Tables
 * 2017 (National Institute of Nutrition, Hyderabad), looked up by
 * IFCT food code and cross-checked against computed macros.
 *
 * It does NOT mean the dish is verified. IFCT contains 528 raw
 * foods — uncooked rice, wheat flour, tomatoes. It holds no cooked
 * dishes. So the RECIPE ASSUMPTIONS — how much flour is in a
 * bhatura, how much oil a samosa absorbs, how big a katori is —
 * remain estimates and always will be.
 *
 * Each component carries a `basis` field naming the ingredients and
 * weights it was computed from. That is the audit trail, and it
 * should be shown on the page.
 *
 * Values absent from IFCT (cooking oil, ghee, butter, cream, sugar,
 * curd, groundnut) use standard reference figures and say so in the
 * basis string. IFCT lists only four milk products and does not
 * cost edible oils.
 *
 * The other thirty dishes remain verified: false.
 * ─────────────────────────────────────────────────────────────
 */

import { MORE_DISHES } from "./dishes-more";
import { PROTEIN_DISHES } from "./dishes-protein";
import { VEG_PROTEIN_DISHES } from "./dishes-veg-protein";

export const UNITS = {
  katori: "Standard Indian serving bowl, ~150 ml level",
  roti: "One medium chapati, ~40 g raw dough",
  tsp: "5 ml",
  tbsp: "15 ml",
};

export const CATEGORIES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "north",     label: "North Indian" },
  { id: "south",     label: "South Indian" },
  { id: "street",    label: "Street food" },
  { id: "sweet",     label: "Sweets" },
  { id: "baseline",  label: "Everyday" },
];

const CORE_DISHES = [
  {
    id: "chole-bhature", name: "Chole bhature", category: "north",
    veg: true, verified: true, image: null, role: "problem",
    portion: "Restaurant plate: 2 bhature + 1 katori chole",
    headline: "The chole is genuinely good for you — sixteen grams of fibre. The bhature are the dish.",
    components: [
      { name: "Bhatura", qty: "2 pieces", grams: 128, kcal: 549, carb: 82, protein: 11, fat: 19, fibre: 3,
        basis: "IFCT A018 wheat flour refined 110 g + cooking oil 18 g absorbed",
        verdict: "driver",
        note: "Refined flour, deep fried. Eighty-two grams of carbohydrate and nearly six hundred calories in two pieces of bread." },
      { name: "Chickpeas in the chole", qty: "1 katori", grams: 120, kcal: 193, carb: 28, protein: 12, fat: 3, fibre: 16,
        basis: "IFCT B002 Bengal gram whole 60 g dry + G017 onion 30 g + D074 tomato 30 g",
        verdict: "good",
        note: "Sixteen grams of fibre and twelve of protein. IFCT puts whole Bengal gram at 25 g of dietary fibre per 100 g dry — higher than most published figures, and it makes this one of the best things in Indian cooking." },
      { name: "Oil in the gravy", qty: "~1.5 tbsp", grams: 20, kcal: 180, carb: 0, protein: 0, fat: 20, fibre: 0,
        basis: "cooking oil 20 g, standard reference — IFCT does not cost edible oils",
        verdict: "driver",
        note: "Invisible and unnoticed. Restaurant kitchens use fat for mouthfeel because it is faster than building flavour with spice and time." },
    ],
    tiers: [
      { level: 1, label: "Keep it, change the context", saves: 400, tasteCost: "Almost none",
        change: "One bhatura instead of two. Ask for less oil, or skim the top. Eat it at lunch and walk twenty minutes after.",
        why: "You still get the dish you came for. The chickpeas were never the problem." },
      { level: 2, label: "Replace the bread", saves: 430, tasteCost: "Real — it is not bhatura",
        change: "Tandoori roti or whole-wheat kulcha with the same chole.",
        why: "Still a recognisable meal, and the part you loved is intact. But be honest: you are eating chole with roti." },
      { level: 3, label: "Rebuild it", saves: 620, tasteCost: "High",
        change: "Air-fried almond or lupin flour bhatura, chole with 1 tsp oil.",
        why: "Low-carb compatible. A different food that reminds you of bhature. Some people are fine with that. Most are not, and that is reasonable." },
    ],
  },

  {
    id: "masala-chai", name: "Masala chai", category: "baseline",
    veg: true, verified: true, image: null, role: "problem",
    portion: "One cup, 150 ml, full-fat milk, 2 tsp sugar",
    headline: "The easiest win on this site, and the one nobody counts.",
    components: [
      { name: "Full-fat milk", qty: "~100 ml", grams: 100, kcal: 73, carb: 5, protein: 3, fat: 4, fibre: 0,
        basis: "IFCT L002 whole cow milk 100 g",
        verdict: "neutral", note: "Fine in itself. It is the frequency that matters." },
      { name: "Sugar", qty: "2 tsp", grams: 10, kcal: 40, carb: 10, protein: 0, fat: 0, fibre: 0,
        basis: "sucrose 10 g, standard reference",
        verdict: "driver", note: "Forty calories looks trivial. Multiply by your actual cup count." },
      { name: "Tea, spices, water", qty: "—", grams: 0, kcal: 0, carb: 0, protein: 0, fat: 0, fibre: 0,
        basis: "negligible",
        verdict: "good", note: "No calories. The spices are the point." },
    ],
    multiplier: {
      note: "Five cups a day", factor: 5, dailyKcal: 565, weeklyKcal: 3955,
      yearNote: "The arithmetic says around 26 kg a year. Expect considerably less in practice, because the body adapts to any sustained change. Either way it is the largest single lever most people have, and it costs no willpower after the first fortnight.",
    },
    tiers: [
      { level: 1, label: "Cut the sugar", saves: 200, tasteCost: "Two weeks of adjustment, then none",
        change: "Two teaspoons down to a half, over three weeks.",
        why: "Two hundred calories a day at five cups, from one change your palate stops noticing." },
      { level: 2, label: "Reduce the count", saves: 340, tasteCost: "Habit, not taste",
        change: "Five cups down to two. Black tea or water for the rest.",
        why: "Most cups are social or reflexive rather than wanted. Work out which two you actually enjoy." },
      { level: 3, label: "Restructure it", saves: 480, tasteCost: "Moderate",
        change: "Unsweetened, with toned milk or a splash rather than a milk base.",
        why: "Near zero calories. Genuinely a different drink, and worth trying before you rule it out." },
    ],
  },

  {
    id: "poha", name: "Poha", category: "breakfast",
    veg: true, verified: true, image: null, role: "problem",
    portion: "One plate, ~150 g cooked",
    headline: "Everyone treats this as the light option. Seven grams of protein and twenty-one of fat.",
    components: [
      { name: "Flattened rice", qty: "~1 katori dry", grams: 50, kcal: 177, carb: 38, protein: 4, fat: 1, fibre: 2,
        basis: "IFCT A011 rice flakes 50 g",
        verdict: "driver", note: "Refined rice. Digests fast and leaves you hungry by eleven." },
      { name: "Oil", qty: "1 tbsp", grams: 14, kcal: 126, carb: 0, protein: 0, fat: 14, fibre: 0,
        basis: "cooking oil 14 g, standard reference",
        verdict: "driver", note: "A third of the plate's calories, and often more, because poha absorbs it readily." },
      { name: "Peanuts, onion, curry leaves", qty: "—", grams: 47, kcal: 85, carb: 5, protein: 4, fat: 6, fibre: 2,
        basis: "groundnut 12 g standard reference + IFCT G017 onion 35 g",
        verdict: "good", note: "The peanuts are most of the protein in the dish. Keep them, and add more." },
    ],
    tiers: [
      { level: 1, label: "Add protein, cut the oil", saves: 60, tasteCost: "None",
        change: "Two eggs or a katori of sprouts alongside. Halve the oil.",
        why: "Poha is not bad, it is incomplete. Seven grams of protein in a 390-calorie breakfast is what causes the eleven-o'clock samosa." },
      { level: 2, label: "Reduce the base", saves: 120, tasteCost: "Low",
        change: "Two thirds the poha, double the vegetables and peanuts.",
        why: "Same plate volume, better composition. You will notice the fullness more than the taste." },
      { level: 3, label: "Replace it", saves: 200, tasteCost: "High — a different breakfast",
        change: "Besan chilla, moong dal chilla, or eggs with vegetables.",
        why: "Three times the protein for fewer calories. Breakfast is the easiest meal to change because nobody is watching." },
    ],
  },

  {
    id: "idli-sambar", name: "Idli sambar", category: "south",
    veg: true, verified: true, image: null, role: "problem",
    portion: "3 idli + 1 katori sambar + chutney",
    headline: "Steamed and fermented, which is good. But three idli carry more than their reputation suggests, and the chutney is a quarter of the plate.",
    components: [
      { name: "Idli", qty: "3 pieces", grams: 73, kcal: 254, carb: 52, protein: 9, fat: 1, fibre: 4,
        basis: "IFCT A015 rice 55 g + B003 black gram dal 18 g, dry batter weight",
        verdict: "driver",
        note: "Steamed rather than fried, and fermentation helps digestibility — but three idli come from roughly 73 g of dry rice and dal, which is more than most people assume." },
      { name: "Sambar", qty: "1 katori", grams: 80, kcal: 145, carb: 17, protein: 6, fat: 6, fibre: 3,
        basis: "IFCT B021 red gram dal 25 g + G017 onion 25 g + D074 tomato 25 g + oil 5 g",
        verdict: "good", note: "Toor dal and vegetables. Protein and fibre in one bowl, and the best thing on the tray." },
      { name: "Coconut chutney", qty: "2 tbsp", grams: 25, kcal: 117, carb: 1, protein: 1, fat: 12, fibre: 2,
        basis: "IFCT H007 fresh coconut kernel 22 g + tempering oil 3 g",
        verdict: "driver",
        note: "IFCT puts fresh coconut kernel at 41% fat. Two spoons is 117 calories, refills are free, and nobody counts them." },
    ],
    tiers: [
      { level: 1, label: "One serving of chutney, three idli", saves: 200, tasteCost: "None",
        change: "No chutney refills. Three idli, not six.",
        why: "The chutney is the surprise. A second and third helping adds more than a fourth idli would." },
      { level: 2, label: "Shift towards the sambar", saves: 85, tasteCost: "None",
        change: "Two idli, two katori sambar.",
        why: "More protein and fibre, fewer refined carbohydrates, and sambar refills are usually free too." },
      { level: 3, label: "Change the batter", saves: 60, tasteCost: "Moderate",
        change: "Ragi, oats or moong dal idli.",
        why: "More fibre and protein. Different texture, but this one survives the swap better than most." },
    ],
  },

  {
    id: "butter-chicken-naan", name: "Butter chicken with naan", category: "north",
    veg: false, verified: true, image: null, role: "problem",
    portion: "1 katori butter chicken + 2 naan",
    headline: "Nine hundred and forty calories, and the chicken is the smallest part of the problem.",
    components: [
      { name: "Chicken", qty: "~100 g", grams: 100, kcal: 200, carb: 0, protein: 18, fat: 14, fibre: 0,
        basis: "IFCT N002 chicken thigh skinless 100 g",
        verdict: "good", note: "Complete protein. The part worth eating." },
      { name: "Cream, butter and cashew", qty: "in the gravy", grams: 95, kcal: 249, carb: 5, protein: 3, fat: 24, fibre: 1,
        basis: "butter 15 g + cream 30 g standard reference + IFCT H005 cashew 10 g + D074 tomato 40 g",
        verdict: "driver", note: "The dish is named after this. Twenty-four grams of fat before you touch the bread." },
      { name: "Naan", qty: "2 pieces", grams: 125, kcal: 495, carb: 85, protein: 12, fat: 11, fibre: 3,
        basis: "IFCT A018 wheat flour refined 115 g + oil or butter 10 g",
        verdict: "driver", note: "Over half the meal. Refined flour, often brushed with more butter leaving the tandoor." },
    ],
    tiers: [
      { level: 1, label: "One naan", saves: 250, tasteCost: "None to the curry",
        change: "One naan instead of two. Eat the chicken first, bread second.",
        why: "Halves the largest component and changes nothing about the dish you ordered." },
      { level: 2, label: "Swap the bread", saves: 340, tasteCost: "Low",
        change: "Two tandoori roti instead of naan.",
        why: "Whole wheat, no added fat, and the gravy is what you came for anyway." },
      { level: 3, label: "Order differently", saves: 500, tasteCost: "High — a different dish",
        change: "Chicken tikka with salad and one roti.",
        why: "Same flavour family, more protein per calorie, none of the cream." },
    ],
  },

  {
    id: "biryani", name: "Chicken biryani", category: "north",
    veg: false, verified: true, image: null, role: "problem",
    portion: "One restaurant plate, ~350 g",
    headline: "Better balanced than most restaurant food. The portion is the problem, not the recipe.",
    components: [
      { name: "Basmati rice", qty: "~2 katori cooked", grams: 80, kcal: 285, carb: 63, protein: 6, fat: 0, fibre: 2,
        basis: "IFCT A015 rice raw milled 80 g dry",
        verdict: "driver", note: "A restaurant plate is roughly twice a sensible serving of rice." },
      { name: "Chicken", qty: "~100 g", grams: 100, kcal: 200, carb: 0, protein: 18, fat: 14, fibre: 0,
        basis: "IFCT N002 chicken thigh skinless 100 g",
        verdict: "good", note: "Real protein, and more of it than most Indian restaurant mains." },
      { name: "Ghee, oil and fried onion", qty: "—", grams: 63, kcal: 184, carb: 4, protein: 1, fat: 18, fibre: 1,
        basis: "ghee 18 g standard reference + IFCT G017 onion 45 g",
        verdict: "driver", note: "Birista and layering fat. Necessary for the dish, and worth knowing about." },
    ],
    tiers: [
      { level: 1, label: "Two thirds, with raita", saves: 220, tasteCost: "None",
        change: "Eat two thirds and stop. A full katori of plain curd raita alongside.",
        why: "The curd adds protein and volume and slows the meal down. The single most effective change to biryani." },
      { level: 2, label: "Shift the ratio", saves: 180, tasteCost: "None",
        change: "Ask for extra chicken and less rice where the kitchen allows it.",
        why: "Same plate, materially better composition. Many places will do this." },
      { level: 3, label: "Rebuild it", saves: 350, tasteCost: "Moderate",
        change: "Home version, half the rice replaced with cauliflower, 1 tbsp ghee total.",
        why: "Survives the swap better than most dishes because the spice does the work, not the rice." },
    ],
  },

  {
    id: "samosa", name: "Samosa", category: "street",
    veg: true, verified: true, image: null, role: "problem",
    portion: "One piece, ~60 g",
    headline: "Two hundred and fifty calories in four bites, and more than half of it is oil.",
    components: [
      { name: "Refined flour pastry", qty: "1 shell", grams: 26, kcal: 91, carb: 19, protein: 3, fat: 0, fibre: 1,
        basis: "IFCT A018 wheat flour refined 26 g",
        verdict: "neutral", note: "Small before it meets the fryer." },
      { name: "Absorbed frying oil", qty: "—", grams: 15, kcal: 135, carb: 0, protein: 0, fat: 15, fibre: 0,
        basis: "cooking oil 15 g absorbed, estimated — the least certain figure on this page",
        verdict: "driver", note: "Over half the calories. Deep-fried pastry is mostly a delivery system for oil." },
      { name: "Potato and pea filling", qty: "~35 g", grams: 38, kcal: 28, carb: 6, protein: 1, fat: 0, fibre: 1,
        basis: "IFCT F008 potato 32 g + D061 fresh peas 6 g",
        verdict: "neutral", note: "Twenty-eight calories. The least of your concerns." },
    ],
    tiers: [
      { level: 1, label: "One, with tea, and stop", saves: 255, tasteCost: "None",
        change: "One is a snack. Three is a meal with no protein in it. Never eat them hungry.",
        why: "Samosa is not worth engineering. It is worth eating occasionally and deliberately." },
      { level: 2, label: "Air-fried", saves: 120, tasteCost: "High — the shell is different",
        change: "Air-fried at 180°C.",
        why: "Removes the absorbed oil, which is the actual problem. The pastry will not shatter the same way." },
      { level: 3, label: "Change the snack", saves: 200, tasteCost: "High",
        change: "Roasted chana, sprouts chaat, or paneer tikka.",
        why: "Protein instead of fried starch. Actually keeps you full until dinner." },
    ],
  },

  {
    id: "dal-makhani-naan", name: "Dal makhani with naan", category: "north",
    veg: true, verified: true, image: null, role: "problem",
    portion: "1 katori dal makhani + 2 naan",
    headline: "People order this believing dal is the healthy choice. The lentils are 132 calories. The rest is not.",
    components: [
      { name: "Black urad dal and rajma", qty: "1 katori base", grams: 45, kcal: 132, carb: 20, protein: 10, fat: 1, fibre: 9,
        basis: "IFCT B004 black gram whole 35 g + B018 rajmah 10 g, dry",
        verdict: "good", note: "Ten grams of protein and nine of fibre for 132 calories. Excellent on its own." },
      { name: "Cream and butter", qty: "—", grams: 50, kcal: 195, carb: 1, protein: 1, fat: 21, fibre: 0,
        basis: "butter 15 g + cream 35 g, standard reference — IFCT lists only four milk products and holds neither",
        verdict: "driver", note: "More calories than the lentils. This is the entire difference between dal makhani and dal." },
      { name: "Naan", qty: "2 pieces", grams: 125, kcal: 495, carb: 85, protein: 12, fat: 11, fibre: 3,
        basis: "IFCT A018 wheat flour refined 115 g + oil or butter 10 g",
        verdict: "driver", note: "As with butter chicken, the bread outweighs everything." },
    ],
    tiers: [
      { level: 1, label: "One naan, go easy on the cream", saves: 300, tasteCost: "Low",
        change: "One naan. Request less cream where the kitchen will do it.",
        why: "Still the dish. Most of the calories gone." },
      { level: 2, label: "Change the dal", saves: 195, tasteCost: "Real — a different dal",
        change: "Dal tadka or dal fry with two roti.",
        why: "Same legumes, a fraction of the fat. The honest framing: you are ordering a different dish." },
      { level: 3, label: "Home version", saves: 400, tasteCost: "Moderate",
        change: "Slow-cooked with 1 tbsp butter and no cream, finished with a spoon of curd.",
        why: "Long cooking builds the texture that cream shortcuts. Takes hours, and gets genuinely close." },
    ],
  },

  {
    id: "thali", name: "Roti, sabzi, dal thali", category: "baseline",
    veg: true, verified: true, image: null, role: "problem",
    portion: "2 roti + 1 katori dal + 1 katori sabzi",
    headline: "Sixteen grams of fibre for 525 calories. This is the baseline everything else should be measured against.",
    components: [
      { name: "Whole wheat roti", qty: "2 pieces", grams: 75, kcal: 240, carb: 48, protein: 8, fat: 1, fibre: 9,
        basis: "IFCT A019 wheat flour atta 75 g",
        verdict: "neutral", note: "IFCT puts atta at 11.4 g of fibre per 100 g against 2.8 for refined flour. That difference is the whole argument for whole wheat." },
      { name: "Dal", qty: "1 katori", grams: 55, kcal: 148, carb: 17, protein: 7, fat: 6, fibre: 3,
        basis: "IFCT B021 red gram dal 30 g dry + D074 tomato 20 g + oil 5 g",
        verdict: "good", note: "Protein and fibre. The reason this meal works." },
      { name: "Sabzi", qty: "1 katori", grams: 135, kcal: 136, carb: 7, protein: 3, fat: 10, fibre: 4,
        basis: "IFCT D036 cauliflower 90 g + F008 potato 35 g + oil 10 g",
        verdict: "neutral", note: "Two thirds of these calories are the oil. Two tablespoons instead of one and this doubles." },
    ],
    tiers: [
      { level: 1, label: "Control the oil, add curd", saves: 90, tasteCost: "None",
        change: "One tablespoon of oil per sabzi, not two. A katori of curd alongside.",
        why: "This meal is already sound. Oil is the only variable worth watching, and curd adds the protein it is short of." },
      { level: 2, label: "Improve the protein", saves: 0, tasteCost: "None",
        change: "Add paneer, eggs, curd or a second dal. Keep the roti at two.",
        why: "Not about cutting calories. Eighteen grams of protein is light for a main meal, and protein is what protects muscle in a deficit." },
      { level: 3, label: "Lower the carbohydrate", saves: 120, tasteCost: "Moderate",
        change: "One roti, double sabzi, add a protein.",
        why: "Low-carb compatible without abandoning the format." },
    ],
  },

  {
    id: "gulab-jamun", name: "Gulab jamun", category: "sweet",
    veg: true, verified: true, image: null, role: "problem",
    portion: "2 pieces with syrup",
    headline: "Fried milk solids soaked in sugar syrup. There is no lighter version. Eat it deliberately.",
    components: [
      { name: "Khoya and flour dough, fried", qty: "2 pieces", grams: 59, kcal: 254, carb: 14, protein: 7, fat: 19, fibre: 0,
        basis: "IFCT L004 khoa 38 g + A018 wheat flour refined 10 g + absorbed oil 11 g",
        verdict: "driver", note: "IFCT puts khoa at 20.6% fat before it goes anywhere near a fryer." },
      { name: "Sugar syrup absorbed", qty: "—", grams: 32, kcal: 128, carb: 32, protein: 0, fat: 0, fibre: 0,
        basis: "sucrose 32 g absorbed, estimated",
        verdict: "driver", note: "The soak is the point of the dish. It is also thirty-two grams of sugar." },
    ],
    tiers: [
      { level: 1, label: "One, after a meal, occasionally", saves: 190, tasteCost: "None",
        change: "One piece, not two. Squeeze the syrup out. After protein, never on an empty stomach.",
        why: "Some foods should not be optimised. They should be eaten rarely, properly, and without guilt." },
      { level: 2, label: "Change the occasion", saves: 382, tasteCost: "None to the dish",
        change: "Festivals and celebrations, not a weekly habit.",
        why: "Frequency is the only lever that matters here." },
      { level: 3, label: "Replace the craving", saves: 300, tasteCost: "High — it is not gulab jamun",
        change: "Dates, a square of dark chocolate, or curd with fruit.",
        why: "Worth trying, but do not pretend a date satisfies the same want. Sometimes it does. Often it does not, and you eat both." },
    ],
  },
];

export const DISHES = [...CORE_DISHES, ...MORE_DISHES, ...PROTEIN_DISHES, ...VEG_PROTEIN_DISHES];
export const PENDING = [];

export function totals(dish) {
  return dish.components.reduce((t, c) => ({
    kcal: t.kcal + c.kcal,
    carb: t.carb + c.carb,
    protein: t.protein + c.protein,
    fat: t.fat + c.fat,
    fibre: t.fibre + c.fibre,
  }), { kcal: 0, carb: 0, protein: 0, fat: 0, fibre: 0 });
}

export function drivers(dish) {
  return dish.components.filter(c => c.verdict === "driver");
}

/** Share of the dish's calories sitting in its single worst component. */
export function concentration(dish) {
  const t = totals(dish);
  const worst = Math.max(...dish.components.map(c => c.kcal));
  return Math.round((worst / t.kcal) * 100);
}

export function byId(id) {
  return DISHES.find(d => d.id === id) || null;
}

export function forDiet(veg) {
  return veg ? DISHES.filter(d => d.veg) : DISHES;
}

export function verifiedCount() {
  return DISHES.filter(d => d.verified).length;
}
