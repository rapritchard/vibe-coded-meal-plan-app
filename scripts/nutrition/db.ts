// Supabase access for the admin pipeline. Uses the SERVICE ROLE key so the job
// can read all recipes and write nutrition regardless of the RLS allowlist that
// guards the in-app manual-entry path. Never ship this key to the client.

import { createClient } from "@supabase/supabase-js";

import type { RecipeNutrition } from "../../src/types";
import type { RecipeRow } from "./types";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before running.",
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export interface FetchOpts {
  only?: string; // slug
  limit?: number;
}

/** Fetch `recipe`-type rows (the only type with structured ingredients+serves). */
export async function fetchRecipes(opts: FetchOpts = {}): Promise<RecipeRow[]> {
  let q = supabase
    .from("recipes")
    .select("id, slug, name, type, data, nutrition")
    .eq("type", "recipe")
    .order("slug");
  if (opts.only) q = q.eq("slug", opts.only);
  if (opts.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw new Error(`fetchRecipes: ${error.message}`);
  return (data ?? []) as RecipeRow[];
}

export async function writeNutrition(
  id: string,
  nutrition: RecipeNutrition,
): Promise<void> {
  const { error } = await supabase
    .from("recipes")
    .update({ nutrition })
    .eq("id", id);
  if (error) throw new Error(`writeNutrition(${id}): ${error.message}`);
}
