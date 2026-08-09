/**
 * Movement plan — Healthyram
 * © 2026 Aseem Mohan. All rights reserved.
 *
 * INSTALL AT: lib/movement.js
 *
 * No equipment, no gym assumed — consistent with the rest of the site's
 * position (see TRUTHS.toning in lib/program.js: "You do not need a gym.
 * You do need resistance."). Two levers only: a daily walk, and a short
 * bodyweight circuit a few times a week. Deliberately not more than that —
 * more moving parts is where people fall off in week two.
 */

const WALK_BY_ACTIVITY = {
  sedentary: { minutes: 35, note: "This is the single highest-leverage thing on this page if most of your day is sitting. It does not need to happen all at once." },
  light:     { minutes: 28, note: "You're already moving some. This tops it up rather than starting from zero." },
  moderate:  { minutes: 20, note: "You're active most days already — this is maintenance, not a new habit to build." },
  high:      { minutes: 15, note: "Physical work or training already covers most of this. Treat this as recovery movement, not another session." },
};

const SESSIONS_BY_GOAL = {
  fatloss: 3, weight: 3, toning: 3, health: 2, maintain: 2,
};

const STANDARD_CIRCUIT = [
  { name: "Bodyweight squats", reps: "15 reps" },
  { name: "Push-ups", reps: "10 reps", note: "From the knees if a full push-up isn't there yet — same movement, lower load." },
  { name: "Glute bridge", reps: "15 reps" },
  { name: "Plank", reps: "30 seconds" },
  { name: "Standing lunges, alternating", reps: "10 per leg" },
];

const GENTLE_CIRCUIT = [
  { name: "Bodyweight squats", reps: "10 reps" },
  { name: "Wall push-ups", reps: "10 reps" },
  { name: "Standing marches", reps: "20 total" },
  { name: "Plank, knees down", reps: "20 seconds" },
  { name: "Standing hip circles", reps: "10 each direction" },
];

const GOAL_FRAMING = {
  fatloss: "Three rounds of this, three times a week, is enough to protect the muscle a calorie deficit would otherwise eat into. It does not need to be more than this.",
  weight: "Three rounds of this, three times a week, is enough to protect the muscle a calorie deficit would otherwise eat into. It does not need to be more than this.",
  toning: "This is the resistance work the site keeps pointing back to — without it you get lighter, not firmer. Add a round or a rep every couple of weeks once it stops feeling hard.",
  health: "Twice a week is enough to matter for insulin sensitivity and blood pressure. This is about consistency, not intensity.",
  maintain: "Twice a week, mainly to hold what you have. Nothing here needs to feel difficult.",
};

/**
 * @param {object} p
 * @param {string} p.goal
 * @param {string} p.activity - sedentary | light | moderate | high
 * @returns {{ walk: object, circuit: object }}
 */
export function buildMovementPlan({ goal, activity }) {
  const walk = WALK_BY_ACTIVITY[activity] || WALK_BY_ACTIVITY.sedentary;
  const sessionsPerWeek = SESSIONS_BY_GOAL[goal] || 2;
  const isGentle = goal === "health" || goal === "maintain";
  const exercises = isGentle ? GENTLE_CIRCUIT : STANDARD_CIRCUIT;
  const rounds = isGentle ? 2 : 3;

  return {
    walk: {
      dailyMinutes: walk.minutes,
      note: walk.note,
      postMeal: {
        minutes: 20,
        note: "Walk 20 minutes after your largest meal, specifically. This blunts the glucose response measurably, and it counts toward the daily total above rather than sitting on top of it.",
      },
    },
    circuit: {
      sessionsPerWeek,
      rounds,
      restBetweenRounds: "60 seconds",
      exercises,
      note: GOAL_FRAMING[goal] || GOAL_FRAMING.maintain,
    },
  };
}
