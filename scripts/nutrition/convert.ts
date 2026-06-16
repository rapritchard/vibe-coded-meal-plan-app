// Deterministic ingredient-name cleanup + unit→grams conversion.
// No network, no LLM — pure functions, unit-tested.

import type { FoodRecord } from "./types";

/** Lowercase, drop parentheticals and anything after the first comma, collapse
 * whitespace. Turns "Black beans, drained (400g tin)" into "black beans". */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .split(",")[0]
    .replace(/\s+/g, " ")
    .trim();
}

// US→UK (and common-variant) ingredient aliases, applied to the SEARCH term
// only (cache + reporting keep the original name). These route whole foods to
// the right CoFID entry instead of an Open Food Facts snack product — e.g.
// "cilantro" has no CoFID match but "coriander leaves" does.
const ALIASES: Record<string, string> = {
  cilantro: "fresh coriander leaves",
  "fresh cilantro": "fresh coriander leaves",
  "vegetable broth": "vegetable stock",
  "vegetable stock": "vegetable stock",
  "chicken broth": "chicken stock",
  "bok choy": "pak choi",
  "pak choy": "pak choi",
  "all-purpose flour": "plain flour",
  "all purpose flour": "plain flour",
  "plain white flour": "plain flour",
  "sea salt": "salt",
  "kosher salt": "salt",
  "flaky sea salt": "salt",
  eggplant: "aubergine",
  zucchini: "courgette",
  scallion: "spring onion",
  scallions: "spring onions",
  "green onion": "spring onion",
  "green onions": "spring onions",
  "garbanzo beans": "chickpeas",
  garbanzos: "chickpeas",
  cornstarch: "cornflour",
  arugula: "rocket",
  "snow peas": "mangetout",
  shrimp: "prawns",
  "fresh coriander": "fresh coriander leaves",
  "red chilli": "red chilli pepper",
  "red chili": "red chilli pepper",
  "green chilli": "green chilli pepper",
};

/** Map an ingredient name to a better search term (US→UK etc.), else itself. */
export function aliasIngredient(name: string): string {
  return ALIASES[normalizeName(name)] ?? normalizeName(name);
}

// Volume units → grams (approx; assumes ~1 g/ml). Last-resort when a food has
// no serving size and the unit isn't a known count.
const VOLUME_UNITS: Record<string, number> = {
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  cup: 240,
  cups: 240,
  pinch: 0.36,
  dash: 0.6,
};

// Container units → grams (nominal UK sizes). Coarse — tinned goods vary and
// beans are often drained — so callers should treat these as review-worthy.
const CONTAINER_UNITS: Record<string, number> = {
  tin: 400,
  tins: 400,
  can: 400,
  cans: 400,
  jar: 340,
  jars: 340,
};

// Free-text / measure-y units mapped directly to grams (coarse, review-worthy).
// Covers "small handful", "squeeze", oil "sprays", "to taste", "g jar" (where the
// quantity is already grams), and "juice of N lemons" style counts.
const SPECIAL_UNITS: Record<string, number> = {
  handful: 30,
  handfuls: 30,
  "small handful": 20,
  "small handfuls": 20,
  "large handful": 40,
  "large handfuls": 40,
  squeeze: 5,
  splash: 5,
  drizzle: 5,
  glug: 10,
  capful: 5,
  capfuls: 5,
  // Ginger is usually given as a length/thumb of fresh root.
  cm: 6,
  inch: 15,
  inches: 15,
  thumb: 15,
  thumbs: 15,
  spray: 0.3,
  sprays: 0.3,
  "few sprays": 1,
  "to taste": 0.5,
  lemon: 45, // juice of one lemon
  lemons: 45,
  lime: 30,
  limes: 30,
  "g jar": 1,
  "g tin": 1,
  "g can": 1,
  "g pack": 1,
  "g bag": 1,
  "g packet": 1,
};

// Units that denote a count of whole items ("2 bananas", "2 cloves garlic").
// For these we look up a per-item weight in COUNT_GRAMS, trying "<name> <unit>"
// (e.g. "garlic cloves") before the bare name.
const COUNT_UNITS = new Set([
  "",
  "whole",
  "each",
  "piece",
  "pieces",
  "unit",
  "units",
  "x",
  "medium",
  "large",
  "small",
  "clove",
  "cloves",
  "stick",
  "sticks",
  "slice",
  "slices",
  "head",
  "heads",
  "sprig",
  "sprigs",
  "handful",
  "handfuls",
  "bunch",
  "bunches",
]);

// Deterministic grams for one whole item, keyed by normalised ingredient name.
// Used for count units before falling back to a record's serving size.
const COUNT_GRAMS: Record<string, number> = {
  banana: 118,
  "ripe banana": 118,
  egg: 50,
  eggs: 50,
  crumpet: 60,
  crumpets: 60,
  "garlic clove": 3,
  "garlic cloves": 3,
  "garlic bulb": 45,
  shallot: 40,
  "banana shallot": 50,
  carrot: 61,
  carrots: 61,
  "small carrot": 50,
  onion: 110,
  "brown onion": 110,
  "red onion": 110,
  "red onions": 110,
  "white onion": 110,
  "yellow onion": 110,
  "large onion": 150,
  "small onion": 70,
  potato: 170,
  "baking potato": 250,
  tomato: 120,
  tomatoes: 120,
  "roma tomato": 62,
  "cherry tomatoes": 17,
  "baby plum tomatoes": 15,
  "on-the-vine tomatoes": 120,
  "bell pepper": 119,
  "red bell pepper": 119,
  "green bell pepper": 119,
  "yellow bell pepper": 119,
  "orange bell pepper": 119,
  "red pepper": 119,
  lemon: 58,
  lemons: 58,
  lime: 44,
  limes: 44,
  avocado: 150,
  avocados: 150,
  "celery stick": 40,
  "spring onion": 15,
  "spring onions": 15,
  mushroom: 18,
  mushrooms: 18,
  "oyster mushrooms": 15,
  "baby chestnut mushrooms": 15,
  "red chilli": 15,
  "red chili pepper": 15,
  chilli: 15,
  date: 8,
  dates: 8,
  "medjool dates": 24,
  sourdough: 50,
  "rice cakes": 9,
  "rice cake": 9,
  "tortilla wraps": 50,
  "tortilla wrap": 50,
  flatbreads: 80,
  "flat pita breads": 60,
  "vegan sausages": 50,
  "vegan richmond sausages": 50,
  "halloumi blocks": 225,
  "paneer block": 225,
  "tempeh block": 200,
  cucumber: 300,
  courgette: 200,
  courgettes: 200,
  aubergine: 250,
  "pak choi": 150,
  "romaine lettuce": 300,
  lettuce: 300,
  "lettuce heads": 300,
  cauliflower: 600,
  "cauliflower head": 600,
  "dried shiitake mushrooms": 3,
  "dried shiitake mushroom": 3,
  "stock cube": 11,
  "stock cubes": 11,
  "vegetable stock cube": 11,
  "lemon juice": 45, // a count of "Lemon juice" = juice of N lemons (~45g each)
  "lime juice": 30,
  "romaine lettuce heads": 300,
  "star anise": 0.5,
  "rice paper sheets": 10,
  "rice paper sheet": 10,
  "fresh ginger slices": 3,
  "fresh ginger slice": 3,
  "vegetable broth": 250, // "1 vegetable broth" ≈ one carton/portion
};

// Approximate grams for count units when no specific per-item weight is known
// ("1 handful raspberries"). Coarse — treat resolved values as review-worthy.
const GENERIC_COUNT_GRAMS: Record<string, number> = {
  handful: 30,
  handfuls: 30,
  sprig: 1,
  sprigs: 1,
  bunch: 30,
  bunches: 30,
};

/** Direct mass conversion to grams, or null if the unit isn't a mass unit. */
function massGrams(quantity: number, unit: string): number | null {
  switch (unit) {
    case "g":
    case "gram":
    case "grams":
      return quantity;
    case "kg":
      return quantity * 1000;
    case "mg":
      return quantity / 1000;
    case "ml":
    case "milliliter":
    case "millilitre":
      return quantity;
    case "l":
    case "litre":
    case "liter":
      return quantity * 1000;
    default:
      return null;
  }
}

export interface GramResult {
  grams: number | null;
  /** Why grams is null, for the skipped-items report. */
  reason?: string;
}

/**
 * Resolve an ingredient line to grams. Order: mass units → deterministic
 * per-item weight for counts → the matched record's serving size → volume
 * table. Returns `{ grams: null, reason }` when nothing applies.
 */
export function convertToGrams(
  quantity: number,
  unit: string,
  name: string,
  record?: Pick<FoodRecord, "servingGrams">,
): GramResult {
  const u = unit.toLowerCase().trim();

  const mass = massGrams(quantity, u);
  if (mass !== null) return { grams: mass };

  if (COUNT_UNITS.has(u)) {
    const nName = normalizeName(name);
    // Try "<name> <unit>" (e.g. "garlic cloves", "celery stick"), then the bare
    // name, then a generic weight for the unit ("handful" → 30g).
    const perItem =
      (u ? COUNT_GRAMS[`${nName} ${u}`] : undefined) ??
      COUNT_GRAMS[nName] ??
      GENERIC_COUNT_GRAMS[u];
    if (perItem !== undefined) return { grams: quantity * perItem };
    if (record?.servingGrams) return { grams: quantity * record.servingGrams };
    return {
      grams: null,
      reason: `no per-item weight for "${name}" (${quantity} ${unit || "count"})`,
    };
  }

  if (u in SPECIAL_UNITS) return { grams: quantity * SPECIAL_UNITS[u] };

  if (u in VOLUME_UNITS) return { grams: quantity * VOLUME_UNITS[u] };

  if (u in CONTAINER_UNITS) return { grams: quantity * CONTAINER_UNITS[u] };

  if (record?.servingGrams) return { grams: quantity * record.servingGrams };

  return { grams: null, reason: `unknown unit "${unit}" for "${name}"` };
}
