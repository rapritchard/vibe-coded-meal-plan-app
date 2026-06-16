// Shared types for the offline nutrition-resolution pipeline.

import type { RecipeNutrition } from "../../src/types";

/** Macros per 100g of a food/product. kcal + grams (sodium in mg). */
export interface Per100g {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fibre_g: number;
  sugar_g?: number;
  sodium_mg?: number;
  saturatedFat_g?: number;
}

export type Source = "openfoodfacts" | "cofid";

/** A candidate food record returned by a source (OFF product / CoFID food). */
export interface FoodRecord {
  source: Source;
  /** Barcode (OFF) or CoFID food code. */
  id: string;
  displayName: string;
  per100g: Per100g;
  /** Grams in one serving, when the source provides it (OFF serving_quantity). */
  servingGrams?: number;
}

/** A candidate plus a deterministic match score (higher = better). */
export interface Candidate extends FoodRecord {
  score: number;
}

/** The resolved match for one ingredient, written to the cache. */
export interface Resolution extends FoodRecord {
  confidence: number;
  reason?: string;
  needsReview?: boolean;
}

/** One recipe row read from Supabase (only the fields the pipeline needs). */
export interface RecipeRow {
  id: string;
  slug: string;
  name: string;
  type: string;
  data: {
    ingredients?: [name: string, quantity: number, unit: string][];
    serves?: string;
  } | null;
  nutrition: RecipeNutrition | null;
}
