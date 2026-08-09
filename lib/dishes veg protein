/**
 * Vegetarian high-protein dishes — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/dishes-veg-protein.js
 *
 * WHY THIS FILE EXISTS
 *
 * The vegetarian meal plan generator was consistently landing at ~50-60%
 * of the protein target, not because of a bug in the generator, but
 * because the vegetarian side of the dish library genuinely didn't have
 * enough protein-dense options — Paneer tikka was close to the only
 * standout (30 g protein / 495 kcal). Everything else clustered at
 * 14-18 g wrapped in roti, rice, or naan, which caps how much protein
 * a day can carry without blowing well past the calorie target too.
 *
 * These three dishes are the actual fix: genuinely protein-dense
 * vegetarian foods that are a normal part of an Indian kitchen, not
 * a workaround.
 *
 * ON VERIFICATION STATUS
 * Unlike the ten core dishes (verified: true, looked up directly against
 * IFCT 2017 by food code), these three are built from figures compiled
 * across several published nutrition sources rather than a direct IFCT
 * lookup this session — the same honesty standard the rest of the
 * unverified 30 dishes already carry. Marked verified: false accordingly.
 * Worth a proper IFCT pass later, same as the rest of that pile.
 */

export const VEG_PROTEIN_DISHES = [
  {
    id: "soya-chunks-curry", name: "Soya chunks curry", category: "north",
    veg: true, verified: false, image: null, role: "solution",
    portion: "50 g dry soya chunks, rehydrated, in onion-tomato masala — ~1 katori",
    headline: "The best protein-per-calorie vegetarian main on this site — better than most of the paneer dishes.",
    components: [
      { name: "Soya chunks (dry weight, rehydrated in the cooking)", qty: "50 g dry", grams: 50, kcal: 173, carb: 17, protein: 26, fat: 0, fibre: 7,
        basis: "compiled from published nutrition sources for dry soya chunks (~52 g protein, ~345 kcal, ~13 g fibre per 100 g dry) — not yet independently checked against a primary IFCT lookup",
        verdict: "good",
        note: "The protein figure looks almost implausible for a vegetarian food, but it's real — soya chunks are dried, defatted soy flour pressed into pieces, so almost nothing but protein and fibre by weight. Rehydrating in the curry adds water, not calories." },
      { name: "Onion-tomato masala, 1 tbsp oil", qty: "—", grams: 95, kcal: 163, carb: 6, protein: 2, fat: 15, fibre: 1,
        basis: "onion 40 g + tomato 40 g, standard reference + cooking oil 15 g, standard reference — IFCT does not cost edible oils",
        verdict: "neutral", note: "The gravy base. Cut the oil to a level tablespoon and this drops by about 60 kcal with no real taste cost." },
    ],
    tiers: [
      { level: 1, label: "As is", saves: 0, tasteCost: "None",
        change: "This dish doesn't need fixing — it's already doing the job. Watch the oil if you're being strict.",
        why: "28 g of protein for 336 kcal is a genuinely good ratio. Most of the site's fix-it advice doesn't apply here." },
      { level: 2, label: "Less oil", saves: 60, tasteCost: "Low",
        change: "1 level tablespoon of oil instead of a generous one.",
        why: "The protein and fibre are untouched. Only the gravy's oil is negotiable." },
    ],
  },

  {
    id: "roasted-chana", name: "Roasted chana (bhuna chana)", category: "baseline",
    veg: true, verified: false, image: null, role: "solution",
    portion: "40 g, dry roasted — a handful",
    headline: "Zero cooking, zero oil, and the most protein-dense snack on this site by a real margin.",
    components: [
      { name: "Dry-roasted Bengal gram", qty: "40 g", grams: 40, kcal: 146, carb: 23, protein: 8, fat: 2, fibre: 5,
        basis: "compiled from published nutrition sources for roasted Bengal gram / chana dalia (~20.8 g protein, ~364 kcal, ~11.5 g fibre per 100 g) — not yet independently checked against a primary IFCT lookup",
        verdict: "good",
        note: "Roasting removes moisture rather than adding anything, which is why the protein figure per 100 g looks higher than boiled chana — same chickpea, less water. No oil in this at all, which is unusual for an Indian snack." },
    ],
    tiers: [
      { level: 1, label: "As is", saves: 0, tasteCost: "None",
        change: "Eat it plain, or with a squeeze of lime and chaat masala if it needs more going on.",
        why: "There's nothing to fix. This is already the answer to 'what's a snack that isn't a samosa'." },
    ],
  },

  {
    id: "hung-curd-bowl", name: "Hung curd bowl with fruit and nuts", category: "breakfast",
    veg: true, verified: false, image: null, role: "solution",
    portion: "150 g hung curd + 1 banana + 1 tbsp mixed nuts/seeds",
    headline: "The vegetarian breakfast this site was missing — every other vegetarian breakfast option tops out around 14 g protein. This clears 18.",
    components: [
      { name: "Hung curd (strained dahi)", qty: "150 g", grams: 150, kcal: 90, carb: 5, protein: 14, fat: 3, fibre: 0,
        basis: "compiled from published nutrition sources for homemade hung curd from toned milk (~9 g protein, ~60 kcal per 100 g after straining) — not yet independently checked against a primary IFCT lookup",
        verdict: "good",
        note: "Straining regular dahi for a few hours removes the whey and roughly doubles the protein per 100 g — it's the same milk, just concentrated. Regular unstrained dahi is closer to 3.5 g protein per 100 g, worth knowing if you're swapping one for the other." },
      { name: "Banana", qty: "1 medium", grams: 100, kcal: 89, carb: 23, protein: 1, fat: 0, fibre: 3,
        basis: "standard reference figure for one medium banana",
        verdict: "neutral", note: "Carries most of the carbohydrate in this bowl. Swap for a lower-sugar fruit if that matters for your goal." },
      { name: "Mixed nuts or seeds", qty: "1 tbsp", grams: 15, kcal: 85, carb: 3, protein: 4, fat: 7, fibre: 1,
        basis: "standard reference figure for 15 g mixed peanuts/seeds",
        verdict: "good", note: "Adds texture and a real protein contribution, not just decoration." },
    ],
    tiers: [
      { level: 1, label: "As is", saves: 0, tasteCost: "None",
        change: "This is already the fix — no tier needed.",
        why: "If mornings have been the weak point of hitting a protein target on a vegetarian diet, this is the specific thing that changes that." },
      { level: 2, label: "Higher protein version", saves: -60, tasteCost: "None",
        change: "200 g hung curd instead of 150 g.",
        why: "Adds roughly 5 g more protein for about 30 kcal. The 'saves' figure here is negative on purpose — this tier costs a few more calories in exchange for more protein, which is the right trade on a high-protein target." },
    ],
  },
];
