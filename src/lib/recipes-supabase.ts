// ─────────────────────────────────────────────────────────────────────────────
// src/lib/recipes-supabase.ts
// Maps between the unified Supabase `recipes` table (structured cols + jsonb
// data) and the discriminated AnyRecipe union. Read-through localStorage
// cache keeps the app responsive offline and on first paint.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";
import type {
  AnyRecipe,
  Dessert,
  RecipeNutrition,
  EffortLevel,
  IngredientTuple,
  MealCategory,
  Mood,
  Recipe,
  SmoothieRecipe,
  Snack,
  TimeKey,
  ToolAlt,
} from "@/types";

interface RecipeRow {
  id: string;
  slug: string;
  type: "recipe" | "smoothie" | "snack" | "dessert";
  category: string;
  name: string;
  moods: Mood[];
  effort: EffortLevel;
  is_batch: boolean;
  good_on_the_go: boolean;
  data: Record<string, unknown>;
  nutrition: RecipeNutrition | null;
}

const CACHE_KEY = "recipes-cache-v2";

// ── Row ↔ AnyRecipe mapping ─────────────────────────────────────────────────

function rowToAnyRecipe(row: RecipeRow): AnyRecipe {
  const base = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    moods: row.moods ?? [],
    effort: row.effort,
    isBatch: row.is_batch,
    goodOnTheGo: row.good_on_the_go,
    nutrition: row.nutrition ?? null,
  };
  const d = row.data ?? {};

  switch (row.type) {
    case "recipe":
      return {
        ...base,
        type: "recipe",
        category: row.category as MealCategory,
        phase: (d.phase as number) ?? 1,
        time: (d.time as string) ?? "",
        serves: (d.serves as string) ?? "",
        timeKey: (d.timeKey as TimeKey) ?? "⚡",
        leadTime: (d.leadTime as string | null) ?? null,
        ingredients: (d.ingredients as IngredientTuple[]) ?? [],
        toolAlts: (d.toolAlts as ToolAlt[]) ?? [],
        parallelTasks: (d.parallelTasks as string[]) ?? [],
        steps: (d.steps as string[]) ?? [],
        tip: (d.tip as string) ?? "",
        variations: (d.variations as string[]) ?? [],
        variationSteps: (d.variationSteps as (string[] | null)[]) ?? [],
      } satisfies Recipe;

    case "smoothie":
      return {
        ...base,
        type: "smoothie",
        category: "smoothie",
        desc: (d.desc as string) ?? "",
        ingredients: (d.ingredients as string[]) ?? [],
        bc151: (d.bc151 as string[]) ?? [],
        duo: (d.duo as string[]) ?? [],
        tip: (d.tip as string) ?? "",
        variations: (d.variations as string[]) ?? [],
      } satisfies SmoothieRecipe;

    case "snack":
      return {
        ...base,
        type: "snack",
        category: "snack",
        badge: (d.badge as string) ?? "",
        desc: (d.desc as string) ?? "",
      } satisfies Snack;

    case "dessert":
      return {
        ...base,
        type: "dessert",
        category: "dessert",
        time: (d.time as string) ?? "",
        serves: (d.serves as string) ?? "",
        leadTime: (d.leadTime as string) ?? "",
        steps: (d.steps as string[]) ?? [],
        tip: (d.tip as string) ?? "",
        variations: (d.variations as string[]) ?? [],
      } satisfies Dessert;
  }
}

function anyRecipeToRow(item: AnyRecipe): RecipeRow {
  // Pull out columns that are denormalised on the table; everything else is
  // jsonb data. We destructure-and-rest by re-listing because TypeScript
  // narrows the union nicely this way.
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) {
    if (
      k !== "id" &&
      k !== "slug" &&
      k !== "type" &&
      k !== "category" &&
      k !== "name" &&
      k !== "moods" &&
      k !== "effort" &&
      k !== "isBatch" &&
      k !== "goodOnTheGo" &&
      k !== "nutrition"
    ) {
      rest[k] = v;
    }
  }
  return {
    id: item.id,
    slug: item.slug,
    type: item.type,
    category: item.category,
    name: item.name,
    moods: item.moods,
    effort: item.effort,
    is_batch: item.isBatch,
    good_on_the_go: item.goodOnTheGo,
    data: rest,
    nutrition: item.nutrition ?? null,
  };
}

// ── Cache ───────────────────────────────────────────────────────────────────

export function readRecipesCacheSync(): AnyRecipe[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? (JSON.parse(cached) as AnyRecipe[]) : null;
  } catch {
    return null;
  }
}

function writeRecipesCache(items: AnyRecipe[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    // non-fatal
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetches the unified recipe catalog from Supabase. On success refreshes the
 * localStorage cache. On failure / no config returns the cache (or `null` if
 * never cached).
 */
export async function loadRecipesFromSupabase(): Promise<AnyRecipe[] | null> {
  if (!supabase) return readRecipesCacheSync();
  try {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("name", { ascending: true });
    if (error || !data) return readRecipesCacheSync();
    const items = (data as RecipeRow[]).map(rowToAnyRecipe);
    writeRecipesCache(items);
    return items;
  } catch {
    return readRecipesCacheSync();
  }
}

/** Insert (or update) one item. RLS enforces allowlist auth. */
export async function upsertRecipe(item: AnyRecipe): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const row = anyRecipeToRow(item);
  const { error } = await supabase
    .from("recipes")
    .upsert(row, { onConflict: "id" });
  if (error) throw error;
}

/** Delete one item by id. */
export async function deleteRecipe(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw error;
}

/** True when the Supabase recipes table has zero rows. Used by the seed
 * migration to decide whether to seed. */
export async function recipesTableIsEmpty(): Promise<boolean> {
  if (!supabase) return false;
  const { count, error } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });
  if (error) return false;
  return (count ?? 0) === 0;
}

/** Bulk upsert (for the one-time seed migration). */
export async function bulkUpsertRecipes(items: AnyRecipe[]): Promise<void> {
  if (!supabase) return;
  const rows = items.map(anyRecipeToRow);
  // Supabase has a 1000-row insert cap; we're well below that with ~61 items.
  const { error } = await supabase
    .from("recipes")
    .upsert(rows, { onConflict: "id" });
  if (error) throw error;
}
