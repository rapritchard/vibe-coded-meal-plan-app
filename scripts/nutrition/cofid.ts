// UK CoFID (PHE McCance & Widdowson Composition of Foods Integrated Dataset)
// lookup. The committed data/cofid.json is generated once by build-cofid.ts.
// This module loads it and does deterministic fuzzy name matching — no network.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import type { Candidate, FoodRecord } from "./types";

const here = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(here, "data", "cofid.json");

// ── Tokenisation + scoring (pure, exported for tests) ────────────────────────

/** Crude singular stemmer so "bananas"→"banana", "tomatoes"→"tomato". */
function stem(w: string): string {
  if (w.length <= 3) return w;
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("oes")) return w.slice(0, -2); // tomatoes, potatoes
  if (/(ses|xes|ches|shes)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("ss")) return w;
  if (w.endsWith("s")) return w.slice(0, -1);
  return w;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(stem);
}

/**
 * Score a CoFID candidate name against an ingredient query in [0,1]. CoFID names
 * are "Food, qualifier, qualifier" — the pre-comma segment is the actual food,
 * so we weight a match there heavily, credit the full name for qualifiers (e.g.
 * "red" in "Lentils, red, split"), penalise extra words in the food segment (so
 * "Bananas, raw" beats "Banana bread"), and nudge plain "raw" foods up.
 */
export function scoreCofidName(query: string, displayName: string): number {
  const q = [...new Set(tokenize(query))];
  if (q.length === 0) return 0;

  const baseSet = new Set(tokenize(displayName.split(",")[0]));
  const fullSet = new Set(tokenize(displayName));

  let baseHits = 0;
  let fullHits = 0;
  for (const t of q) {
    if (baseSet.has(t)) baseHits++;
    if (fullSet.has(t)) fullHits++;
  }

  const baseCov = baseHits / q.length;
  const fullCov = fullHits / q.length;
  const baseExtra = baseSet.size - baseHits;
  const rawBonus = /\braw\b/.test(displayName.toLowerCase()) ? 0.05 : 0;

  const score = baseCov * 0.55 + fullCov * 0.4 - 0.06 * baseExtra + rawBonus;
  return Math.max(0, Math.min(1, score));
}

// ── Supplemental foods (curated; not in CoFID) ───────────────────────────────
// CoFID omits common pantry items — ground spices, plant milks, prepared stock,
// plain black beans — so OFF would otherwise match them to snack products
// (cinnamon → "Cinnamon Crisps"). These per-100g values are approximate (USDA /
// label-typical) and tagged source "cofid" (bundled local data). Spices are
// used in tiny amounts, so precision barely affects recipe totals.
const SUPPLEMENTAL: FoodRecord[] = [
  { source: "cofid", id: "supp:cinnamon", displayName: "Cinnamon, ground", per100g: { calories: 247, protein_g: 4, carbs_g: 81, fat_g: 1.2, fibre_g: 53, sugar_g: 2.2, sodium_mg: 10 } },
  { source: "cofid", id: "supp:cumin", displayName: "Cumin, ground", per100g: { calories: 375, protein_g: 18, carbs_g: 44, fat_g: 22, fibre_g: 11, sugar_g: 2.3, sodium_mg: 168 } },
  { source: "cofid", id: "supp:paprika", displayName: "Paprika, ground", per100g: { calories: 282, protein_g: 14, carbs_g: 54, fat_g: 13, fibre_g: 35, sugar_g: 10, sodium_mg: 68 } },
  { source: "cofid", id: "supp:ground-coriander", displayName: "Coriander, ground", per100g: { calories: 298, protein_g: 12, carbs_g: 55, fat_g: 18, fibre_g: 42, sugar_g: 0, sodium_mg: 35 } },
  { source: "cofid", id: "supp:turmeric", displayName: "Turmeric, ground", per100g: { calories: 312, protein_g: 10, carbs_g: 67, fat_g: 3.2, fibre_g: 23, sugar_g: 3.2, sodium_mg: 27 } },
  { source: "cofid", id: "supp:chilli-powder", displayName: "Chilli powder", per100g: { calories: 282, protein_g: 14, carbs_g: 50, fat_g: 14, fibre_g: 35, sugar_g: 7.2, sodium_mg: 1640 } },
  { source: "cofid", id: "supp:oat-milk", displayName: "Oat milk, unsweetened", per100g: { calories: 45, protein_g: 1, carbs_g: 6.6, fat_g: 1.5, fibre_g: 0.8, sugar_g: 4, sodium_mg: 40 } },
  { source: "cofid", id: "supp:almond-milk", displayName: "Almond milk, unsweetened", per100g: { calories: 13, protein_g: 0.5, carbs_g: 0.1, fat_g: 1.1, fibre_g: 0.2, sugar_g: 0.1, sodium_mg: 60 } },
  { source: "cofid", id: "supp:soya-milk", displayName: "Soya milk, unsweetened", per100g: { calories: 42, protein_g: 3.3, carbs_g: 1.8, fat_g: 1.8, fibre_g: 0.5, sugar_g: 0.6, sodium_mg: 32 } },
  { source: "cofid", id: "supp:plant-milk", displayName: "Plant-based milk", per100g: { calories: 40, protein_g: 1.5, carbs_g: 5, fat_g: 1.5, fibre_g: 0.5, sugar_g: 3, sodium_mg: 40 } },
  { source: "cofid", id: "supp:veg-stock", displayName: "Vegetable stock, prepared", per100g: { calories: 4, protein_g: 0.3, carbs_g: 0.5, fat_g: 0.1, fibre_g: 0, sugar_g: 0.2, sodium_mg: 320 } },
  { source: "cofid", id: "supp:chicken-stock", displayName: "Chicken stock, prepared", per100g: { calories: 4, protein_g: 0.5, carbs_g: 0.3, fat_g: 0.1, fibre_g: 0, sugar_g: 0.1, sodium_mg: 340 } },
  { source: "cofid", id: "supp:black-beans", displayName: "Black beans, canned, drained", per100g: { calories: 114, protein_g: 8.9, carbs_g: 16, fat_g: 0.5, fibre_g: 7.5, sugar_g: 0.3, sodium_mg: 240 } },
  { source: "cofid", id: "supp:white-sugar", displayName: "Sugar, white, granulated", per100g: { calories: 400, protein_g: 0, carbs_g: 100, fat_g: 0, fibre_g: 0, sugar_g: 100, sodium_mg: 0 } },
  { source: "cofid", id: "supp:mushrooms", displayName: "Mushrooms, white, raw", per100g: { calories: 22, protein_g: 3.1, carbs_g: 0.4, fat_g: 0.5, fibre_g: 1, sugar_g: 0.2, sodium_mg: 5 } },
  { source: "cofid", id: "supp:stock-cube", displayName: "Stock cube, dry", per100g: { calories: 230, protein_g: 11, carbs_g: 24, fat_g: 11, fibre_g: 1, sugar_g: 8, sodium_mg: 20000 } },
  { source: "cofid", id: "supp:plant-yoghurt", displayName: "Plant-based yoghurt", per100g: { calories: 70, protein_g: 3, carbs_g: 8, fat_g: 3, fibre_g: 0.5, sugar_g: 4, sodium_mg: 40 } },
];

// ── Dataset load + search ────────────────────────────────────────────────────

let rows: FoodRecord[] | null = null;

function load(): FoodRecord[] {
  if (rows) return rows;
  try {
    rows = JSON.parse(readFileSync(DATA_PATH, "utf8")) as FoodRecord[];
  } catch {
    rows = []; // dataset not built yet — pipeline degrades to OFF-only
  }
  return rows;
}

export function cofidLoaded(): boolean {
  return load().length > 0;
}

/** Top `limit` CoFID candidates for an ingredient name, best first. */
export function searchCofid(name: string, limit = 5): Candidate[] {
  return [...SUPPLEMENTAL, ...load()]
    .map((r) => ({ ...r, score: scoreCofidName(name, r.displayName) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
