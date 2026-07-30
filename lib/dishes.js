/**
 * Dish library — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/dishes.js
 *
 * ─────────────────────────────────────────────────────────────
 * DATA STATUS: ESTIMATES. NOT YET VERIFIED AGAINST IFCT 2017.
 *
 * Every number below is a considered estimate based on typical
 * restaurant preparation. Before publishing, check each entry
 * against the Indian Food Composition Tables 2017 (NIN Hyderabad)
 * and set `verified: true`.
 *
 * Oil absorbed during frying is NOT in IFCT — it is estimated
 * separately and is always the least certain figure on the page.
 * ─────────────────────────────────────────────────────────────
 *
 * IMAGES
 * `image` is optional. Leave it null and the page renders on the
 * calorie bar alone, which is the stronger visual. If you do add
 * photographs, shoot real plates — stock food photography makes
 * this look like every recipe blog on the internet.
 * Put files in /public/dishes/ and set image: "/dishes/name.jpg".
 *
 * VERDICTS
 *   "driver"  — where the damage is
 *   "neutral" — contributes calories, no strong verdict
 *   "good"    — worth eating; protein, fibre, or both
 */
import { PROTEIN_DISHES } from "./dishes-protein";
import { MORE_DISHES } from "./dishes-more";
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
    id: "chole-bhature",
    name: "Chole bhature",
    category: "north",
    veg: true,
    verified: false,
    image: null,
    portion: "Restaurant plate: 2 bhature + 1 katori chole",
    headline: "The chole is genuinely good for you. The bhature are the dish.",
    components: [
      { name: "Bhatura", qty: "2 pieces", grams: 130, kcal: 550, carb: 62, protein: 10, fat: 28, fibre: 2,
        verdict: "driver",
        note: "Refined flour, deep fried. Each piece absorbs 10–12 g of oil in the fryer. Two thirds of the meal sits here." },
      { name: "Chickpeas in the chole", qty: "1 katori", grams: 150, kcal: 130, carb: 22, protein: 8, fat: 2, fibre: 7,
        verdict: "good",
        note: "High fibre, decent protein, low glycaemic load. Chickpeas are one of the better things in Indian cooking." },
      { name: "Oil in the gravy", qty: "~1.5 tbsp", grams: 20, kcal: 180, carb: 0, protein: 0, fat: 20, fibre: 0,
        verdict: "driver",
        note: "Invisible and unnoticed. Restaurant kitchens use fat for mouthfeel because it is faster than building flavour with spice and time." },
    ],
    tiers: [
      { level: 1, label: "Keep it, change the context", saves: 380, tasteCost: "Almost none",
        change: "One bhatura instead of two. Ask for less oil, or skim the top. Eat it at lunch and walk twenty minutes after.",
        why: "You still get the dish you came for. The chickpeas were never the problem." },
      { level: 2, label: "Replace the bread", saves: 420, tasteCost: "Real — it is not bhatura",
        change: "Tandoori roti or whole-wheat kulcha with the same chole.",
        why: "Still a recognisable meal, and the part you loved is intact. But be honest: you are eating chole with roti." },
      { level: 3, label: "Rebuild it", saves: 600, tasteCost: "High",
        change: "Air-fried almond or lupin flour bhatura, chole with 1 tsp oil.",
        why: "Low-carb compatible. A different food that reminds you of bhature. Some people are fine with that. Most are not, and that is reasonable." },
    ],
  },

  {
    id: "masala-chai",
    name: "Masala chai",
    category: "baseline",
    veg: true,
    verified: false,
    image: null,
    portion: "One cup, 150 ml, full-fat milk, 2 tsp sugar",
    headline: "The easiest win on this site, and the one nobody counts.",
    components: [
      { name: "Full-fat milk", qty: "~100 ml", grams: 100, kcal: 65, carb: 5, protein: 3, fat: 4, fibre: 0,
        verdict: "neutral", note: "Fine in itself. It is the frequency that matters." },
      { name: "Sugar", qty: "2 tsp", grams: 10, kcal: 40, carb: 10, protein: 0, fat: 0, fibre: 0,
        verdict: "driver", note: "Forty calories looks trivial. Multiply by your actual cup count." },
      { name: "Tea, spices, water", qty: "—", grams: 0, kcal: 0, carb: 0, protein: 0, fat: 0, fibre: 0,
        verdict: "good", note: "No calories. The spices are the point." },
    ],
    multiplier: { note: "Five cups a day", factor: 5, dailyKcal: 525, weeklyKcal: 3675, yearlyKg: 9.9 },
    tiers: [
      { level: 1, label: "Cut the sugar", saves: 200, tasteCost: "Two weeks of adjustment, then none",
        change: "Two teaspoons down to a half, over three weeks.",
        why: "Roughly 200 kcal a day at five cups. Around 5 kg of fat over a year, from one change that needs no willpower after the first fortnight." },
      { level: 2, label: "Reduce the count", saves: 300, tasteCost: "Habit, not taste",
        change: "Five cups down to two. Black tea or water for the rest.",
        why: "Most cups are social or reflexive rather than wanted. Work out which two you actually enjoy." },
      { level: 3, label: "Restructure it", saves: 450, tasteCost: "Moderate",
        change: "Unsweetened, with toned milk or a splash rather than a milk base.",
        why: "Near zero calories. Genuinely a different drink, and worth trying before you rule it out." },
    ],
  },

  {
    id: "poha",
    name: "Poha",
    category: "breakfast",
    veg: true,
    verified: false,
    image: null,
    portion: "One plate, ~150 g cooked",
    headline: "Everyone treats this as the light option. It is refined carbohydrate with almost no protein.",
    components: [
      { name: "Flattened rice", qty: "~1 katori dry", grams: 50, kcal: 180, carb: 38, protein: 3, fat: 0, fibre: 1,
        verdict: "driver", note: "Refined rice. Digests fast and leaves you hungry by eleven." },
      { name: "Oil", qty: "1 tbsp", grams: 15, kcal: 130, carb: 0, protein: 0, fat: 15, fibre: 0,
        verdict: "driver", note: "Often more, because poha absorbs it readily." },
      { name: "Peanuts, onion, curry leaves", qty: "—", grams: 25, kcal: 70, carb: 3, protein: 3, fat: 5, fibre: 1,
        verdict: "good", note: "The peanuts are the only protein in the dish. Keep them." },
    ],
    tiers: [
      { level: 1, label: "Add protein, cut the oil", saves: 60, tasteCost: "None",
        change: "Two eggs or a katori of sprouts alongside. Halve the oil.",
        why: "Poha is not bad, it is incomplete. Protein fixes the eleven-o'clock hunger that leads to a samosa." },
      { level: 2, label: "Reduce the base", saves: 120, tasteCost: "Low",
        change: "Two thirds the poha, double the vegetables and peanuts.",
        why: "Same plate volume, better composition. You will notice the fullness more than the taste." },
      { level: 3, label: "Replace it", saves: 200, tasteCost: "High — a different breakfast",
        change: "Besan chilla, moong dal chilla, or eggs with vegetables.",
        why: "Three times the protein for fewer calories. Breakfast is the easiest meal to change because nobody is watching." },
    ],
  },

  {
    id: "idli-sambar",
    name: "Idli sambar",
    category: "south",
    veg: true,
    verified: false,
    image: null,
    portion: "3 idli + 1 katori sambar",
    headline: "One of the genuinely good options. Steamed, fermented, and the sambar earns its place.",
    components: [
      { name: "Idli", qty: "3 pieces", grams: 120, kcal: 130, carb: 28, protein: 4, fat: 0, fibre: 1,
        verdict: "neutral", note: "Steamed, not fried. Fermentation improves digestibility. Low fat by construction." },
      { name: "Sambar", qty: "1 katori", grams: 150, kcal: 110, carb: 12, protein: 5, fat: 4, fibre: 4,
        verdict: "good", note: "Toor dal plus vegetables. Protein and fibre in one bowl." },
      { name: "Coconut chutney", qty: "2 tbsp", grams: 30, kcal: 90, carb: 3, protein: 1, fat: 8, fibre: 2,
        verdict: "neutral", note: "Where the calories quietly arrive. Coconut is fat-dense, and three or four spoons doubles this." },
    ],
    tiers: [
      { level: 1, label: "Watch the chutney and the count", saves: 90, tasteCost: "None",
        change: "One serving of chutney, no refills. Three idli, not six.",
        why: "Portion creep is the only real issue. The dish itself is well constructed." },
      { level: 2, label: "Improve the ratio", saves: 40, tasteCost: "None",
        change: "Two idli, two katori sambar.",
        why: "More protein and fibre, fewer refined carbohydrates, same satisfaction." },
      { level: 3, label: "Change the batter", saves: 60, tasteCost: "Moderate",
        change: "Ragi, oats or moong dal idli.",
        why: "More fibre and protein. Different texture, but this one survives the swap better than most." },
    ],
  },

  {
    id: "butter-chicken-naan",
    name: "Butter chicken with naan",
    category: "north",
    veg: false,
    verified: false,
    image: null,
    portion: "1 katori butter chicken + 2 naan",
    headline: "Nine hundred calories, and the chicken is the smallest part of the problem.",
    components: [
      { name: "Chicken", qty: "~100 g", grams: 100, kcal: 165, carb: 0, protein: 25, fat: 7, fibre: 0,
        verdict: "good", note: "Complete protein. This is the part worth eating." },
      { name: "Cream, butter and cashew", qty: "in the gravy", grams: 60, kcal: 280, carb: 8, protein: 3, fat: 26, fibre: 0,
        verdict: "driver", note: "The dish is named after this. It is also 30% of the meal before you touch the bread." },
      { name: "Naan", qty: "2 pieces", grams: 180, kcal: 480, carb: 88, protein: 14, fat: 8, fibre: 3,
        verdict: "driver", note: "Refined flour, often brushed with more butter leaving the tandoor." },
    ],
    tiers: [
      { level: 1, label: "One naan", saves: 240, tasteCost: "None to the curry",
        change: "One naan instead of two. Eat the chicken first, bread second.",
        why: "Halves the largest component and changes nothing about the dish you ordered." },
      { level: 2, label: "Swap the bread", saves: 340, tasteCost: "Low",
        change: "Two tandoori roti instead of naan.",
        why: "Whole wheat, no added fat, and the gravy is what you came for anyway." },
      { level: 3, label: "Order differently", saves: 500, tasteCost: "High — a different dish",
        change: "Chicken tikka with salad and one roti.",
        why: "Same flavour family, most of the protein, none of the cream. Not butter chicken, and we are not pretending otherwise." },
    ],
  },

  {
    id: "biryani",
    name: "Chicken biryani",
    category: "north",
    veg: false,
    verified: false,
    image: null,
    portion: "One restaurant plate, ~350 g",
    headline: "Better balanced than most restaurant food. The portion is the problem, not the recipe.",
    components: [
      { name: "Basmati rice", qty: "~2 katori cooked", grams: 220, kcal: 290, carb: 62, protein: 6, fat: 1, fibre: 1,
        verdict: "driver", note: "A restaurant plate is roughly twice a sensible serving of rice." },
      { name: "Chicken", qty: "~100 g", grams: 100, kcal: 170, carb: 0, protein: 24, fat: 8, fibre: 0,
        verdict: "good", note: "Real protein, and more of it than most Indian restaurant mains." },
      { name: "Ghee, oil and fried onion", qty: "—", grams: 30, kcal: 220, carb: 6, protein: 1, fat: 22, fibre: 1,
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
    id: "samosa",
    name: "Samosa",
    category: "street",
    veg: true,
    verified: false,
    image: null,
    portion: "One piece, ~60 g",
    headline: "Two hundred and sixty calories in four bites, and it will not keep you full for an hour.",
    components: [
      { name: "Refined flour pastry", qty: "1 shell", grams: 25, kcal: 90, carb: 18, protein: 2, fat: 1, fibre: 1,
        verdict: "neutral", note: "Small before it meets the fryer." },
      { name: "Absorbed frying oil", qty: "—", grams: 15, kcal: 135, carb: 0, protein: 0, fat: 15, fibre: 0,
        verdict: "driver", note: "More than half the calories. Deep-fried pastry is mostly a delivery system for oil." },
      { name: "Potato filling", qty: "~30 g", grams: 30, kcal: 35, carb: 7, protein: 1, fat: 0, fibre: 1,
        verdict: "neutral", note: "The least of your concerns." },
    ],
    tiers: [
      { level: 1, label: "One, with tea, and stop", saves: 260, tasteCost: "None",
        change: "One is a snack. Three is a meal with no protein in it. Never eat them hungry.",
        why: "Samosa is not worth engineering. It is worth eating occasionally and deliberately." },
      { level: 2, label: "Air-fried", saves: 120, tasteCost: "High — the shell is different",
        change: "Air-fried at 180°C.",
        why: "Removes the absorbed oil, which is the actual problem. The pastry will not shatter the same way, and that matters more than people admit." },
      { level: 3, label: "Change the snack", saves: 200, tasteCost: "High",
        change: "Roasted chana, sprouts chaat, or paneer tikka.",
        why: "Protein instead of fried starch. Actually keeps you full until dinner." },
    ],
  },

  {
    id: "dal-makhani-naan",
    name: "Dal makhani with naan",
    category: "north",
    veg: true,
    verified: false,
    image: null,
    portion: "1 katori dal makhani + 2 naan",
    headline: "People order this believing dal is the healthy choice. This particular dal is not.",
    components: [
      { name: "Black urad dal and rajma", qty: "1 katori base", grams: 100, kcal: 120, carb: 20, protein: 8, fat: 1, fibre: 8,
        verdict: "good", note: "Excellent on its own. Fibre and plant protein." },
      { name: "Cream and butter", qty: "—", grams: 45, kcal: 220, carb: 2, protein: 1, fat: 24, fibre: 0,
        verdict: "driver", note: "This is what separates dal makhani from dal. It is also two thirds of the bowl." },
      { name: "Naan", qty: "2 pieces", grams: 180, kcal: 480, carb: 88, protein: 14, fat: 8, fibre: 3,
        verdict: "driver", note: "As with butter chicken, the bread outweighs everything." },
    ],
    tiers: [
      { level: 1, label: "One naan, go easy on the cream", saves: 300, tasteCost: "Low",
        change: "One naan. Request less cream where the kitchen will do it.",
        why: "Still the dish. Two thirds of the calories gone." },
      { level: 2, label: "Change the dal", saves: 200, tasteCost: "Real — a different dal",
        change: "Dal tadka or dal fry with two roti.",
        why: "Same legumes, a fraction of the fat. The honest framing: you are ordering a different dish, not a lighter version of this one." },
      { level: 3, label: "Home version", saves: 400, tasteCost: "Moderate",
        change: "Slow-cooked with 1 tbsp butter and no cream, finished with a spoon of curd.",
        why: "Long cooking builds the texture that cream shortcuts. Takes hours, and gets genuinely close." },
    ],
  },

  {
    id: "thali",
    name: "Roti, sabzi, dal thali",
    category: "baseline",
    veg: true,
    verified: false,
    image: null,
    portion: "2 roti + 1 katori dal + 1 katori sabzi",
    headline: "The baseline everything else should be measured against. It is well built.",
    components: [
      { name: "Whole wheat roti", qty: "2 pieces", grams: 80, kcal: 240, carb: 46, protein: 8, fat: 2, fibre: 6,
        verdict: "neutral", note: "Whole grain, no added fat if made without ghee. Fine." },
      { name: "Dal", qty: "1 katori", grams: 150, kcal: 150, carb: 20, protein: 8, fat: 4, fibre: 6,
        verdict: "good", note: "Protein and fibre. The reason this meal works." },
      { name: "Sabzi", qty: "1 katori", grams: 150, kcal: 120, carb: 10, protein: 3, fat: 8, fibre: 4,
        verdict: "neutral", note: "Depends entirely on the oil. Two tablespoons and this doubles." },
    ],
    tiers: [
      { level: 1, label: "Control the oil, add curd", saves: 60, tasteCost: "None",
        change: "One tablespoon of oil per sabzi, not two. A katori of curd alongside.",
        why: "This meal is already sound. Oil is the only variable worth watching, and curd adds the protein it is slightly short of." },
      { level: 2, label: "Improve the protein", saves: 0, tasteCost: "None",
        change: "Add paneer, eggs, curd or a second dal. Keep the roti at two.",
        why: "Not about cutting calories. This meal's weakness is protein, and fixing that is what protects muscle in a deficit." },
      { level: 3, label: "Lower the carbohydrate", saves: 150, tasteCost: "Moderate",
        change: "One roti, double sabzi, add a protein.",
        why: "Low-carb compatible without abandoning the format. The version worth building a week around." },
    ],
  },

  {
    id: "gulab-jamun",
    name: "Gulab jamun",
    category: "sweet",
    veg: true,
    verified: false,
    image: null,
    portion: "2 pieces with syrup",
    headline: "Fried dough soaked in sugar syrup. There is no lighter version. Eat it deliberately.",
    components: [
      { name: "Khoya and flour dough, fried", qty: "2 pieces", grams: 70, kcal: 190, carb: 20, protein: 3, fat: 11, fibre: 0,
        verdict: "driver", note: "Milk solids and refined flour, deep fried." },
      { name: "Sugar syrup absorbed", qty: "—", grams: 40, kcal: 130, carb: 33, protein: 0, fat: 0, fibre: 0,
        verdict: "driver", note: "The soak is the point. It is also pure sugar." },
    ],
    tiers: [
      { level: 1, label: "One, after a meal, occasionally", saves: 160, tasteCost: "None",
        change: "One piece, not two. Squeeze the syrup out. After protein, never on an empty stomach.",
        why: "Some foods should not be optimised. They should be eaten rarely, properly, and without guilt." },
      { level: 2, label: "Change the occasion", saves: 320, tasteCost: "None to the dish",
        change: "Festivals and celebrations, not a weekly habit.",
        why: "Frequency is the only lever that matters here." },
      { level: 3, label: "Replace the craving", saves: 280, tasteCost: "High — it is not gulab jamun",
        change: "Dates, a square of dark chocolate, or curd with fruit.",
        why: "Worth trying, but do not pretend a date satisfies the same want. Sometimes it does. Often it does not, and you eat both." },
    ],
  },
];

export const DISHES = [...CORE_DISHES, ...MORE_DISHES, ...PROTEIN_DISHES];
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