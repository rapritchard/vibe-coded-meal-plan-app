// Pure aggregation: sum per-100g macros across an ingredient's gram weight,
// then divide by servings. No network, unit-tested.

import type { Per100g } from "./types";

export interface IngredientContribution {
  name: string;
  grams: number;
  per100g: Per100g;
}

export interface NutritionTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  sugar_g: number;
  sodium_mg: number;
  saturatedFat_g: number;
}

const ZERO: NutritionTotals = {
  calories: 0,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
  fibre_g: 0,
  sugar_g: 0,
  sodium_mg: 0,
  saturatedFat_g: 0,
};

/** 1 g of salt contains 400 mg of sodium (sodium = salt / 2.5). */
export function saltToSodiumMg(saltGrams: number): number {
  return saltGrams * 400;
}

/** Parse a free-text serves field ("2", "1-2", "Serves 4") to a positive int,
 * defaulting to 1. */
export function parseServes(serves: string | undefined): number {
  const match = (serves ?? "").match(/\d+/);
  const n = match ? Number.parseInt(match[0], 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function round(value: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round(value * f) / f;
}

/** Sum contributions into whole-recipe totals (rounded). */
export function aggregate(contribs: IngredientContribution[]): NutritionTotals {
  const t = { ...ZERO };
  for (const c of contribs) {
    const f = c.grams / 100;
    const p = c.per100g;
    t.calories += (p.calories || 0) * f;
    t.protein_g += (p.protein_g || 0) * f;
    t.carbs_g += (p.carbs_g || 0) * f;
    t.fat_g += (p.fat_g || 0) * f;
    t.fibre_g += (p.fibre_g || 0) * f;
    t.sugar_g += (p.sugar_g || 0) * f;
    t.sodium_mg += (p.sodium_mg || 0) * f;
    t.saturatedFat_g += (p.saturatedFat_g || 0) * f;
  }
  return roundTotals(t);
}

/** Divide whole-recipe totals by servings → per-serving totals (rounded). */
export function perServing(
  totals: NutritionTotals,
  serves: string | undefined,
): { yieldServings: number; total: NutritionTotals } {
  const n = parseServes(serves);
  const total = { ...totals };
  for (const k of Object.keys(total) as (keyof NutritionTotals)[]) {
    total[k] = total[k] / n;
  }
  // Stored with yieldServings:1 so the app renders these per-serving values as-is.
  return { yieldServings: 1, total: roundTotals(total) };
}

function roundTotals(t: NutritionTotals): NutritionTotals {
  return {
    calories: Math.round(t.calories),
    protein_g: round(t.protein_g, 1),
    carbs_g: round(t.carbs_g, 1),
    fat_g: round(t.fat_g, 1),
    fibre_g: round(t.fibre_g, 1),
    sugar_g: round(t.sugar_g, 1),
    sodium_mg: Math.round(t.sodium_mg),
    saturatedFat_g: round(t.saturatedFat_g, 1),
  };
}
