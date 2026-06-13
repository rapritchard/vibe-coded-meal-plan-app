// ─────────────────────────────────────────────────────────────────────────────
// src/lib/nutrition.ts
// Thin client wrapper over the `enrich-nutrition` Edge Function. The USDA API
// key lives only on the server (a Supabase secret), so enrichment must go
// through the function rather than calling the provider from the browser.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";
import type { RecipeNutrition } from "@/types";

export interface EnrichResult {
  nutrition: RecipeNutrition;
  /** Ingredients that couldn't be converted to grams or matched in USDA. */
  skipped: string[];
}

/**
 * Asks the server to compute and persist nutrition for one recipe. Requires an
 * authenticated session (the function is JWT-gated). Throws on failure.
 */
export async function enrichNutrition(recipeId: string): Promise<EnrichResult> {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase.functions.invoke<EnrichResult>(
    "enrich-nutrition",
    { body: { id: recipeId } },
  );
  if (error) throw error;
  if (!data) throw new Error("No response from enrich-nutrition");
  return data;
}
