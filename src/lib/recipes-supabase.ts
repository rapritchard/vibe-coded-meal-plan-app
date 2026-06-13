// ─────────────────────────────────────────────────────────────────────────────
// src/lib/recipes-supabase.ts
// Maps between the unified Supabase `recipes` table (structured cols + jsonb
// data) and the discriminated AnyRecipe union. Read-through localStorage cache
// keeps the app responsive offline and on first paint.
//
// The per-type jsonb `data` payloads are validated with zod (each field has a
// `.catch` fallback) so a malformed row degrades to sensible defaults instead of
// crashing the catalog load — and so the expected shape is documented in code
// rather than scattered `as` casts.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

import { supabase } from "./supabase";
import { loadCached, readCache } from "./cached-store";
import { ALL_MOODS } from "@/types";
import type {
  AnyRecipe,
  Dessert,
  RecipeNutrition,
  EffortLevel,
  MealCategory,
  Mood,
  Recipe,
  SmoothieRecipe,
  Snack,
} from "@/types";

export interface RecipeRow {
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

// ── jsonb `data` schemas (one per discriminated type) ────────────────────────

const timeKeyEnum = z.enum(["⚡", "🕐", "🕑", "⏳", "🌙"]);
const ingredientTuple = z.tuple([z.string(), z.number(), z.string()]);
const toolAlt = z.object({ tool: z.string(), note: z.string() });

const recipeData = z.object({
  phase: z.number().catch(1),
  time: z.string().catch(""),
  serves: z.string().catch(""),
  timeKey: timeKeyEnum.catch("⚡"),
  leadTime: z.string().nullable().catch(null),
  ingredients: z.array(ingredientTuple).catch([]),
  toolAlts: z.array(toolAlt).catch([]),
  parallelTasks: z.array(z.string()).catch([]),
  steps: z.array(z.string()).catch([]),
  tip: z.string().catch(""),
  variations: z.array(z.string()).catch([]),
  variationSteps: z.array(z.array(z.string()).nullable()).catch([]),
});

const smoothieData = z.object({
  desc: z.string().catch(""),
  ingredients: z.array(z.string()).catch([]),
  bc151: z.array(z.string()).catch([]),
  duo: z.array(z.string()).catch([]),
  tip: z.string().catch(""),
  variations: z.array(z.string()).catch([]),
});

const snackData = z.object({
  badge: z.string().catch(""),
  desc: z.string().catch(""),
});

const dessertData = z.object({
  time: z.string().catch(""),
  serves: z.string().catch(""),
  leadTime: z.string().catch(""),
  steps: z.array(z.string()).catch([]),
  tip: z.string().catch(""),
  variations: z.array(z.string()).catch([]),
});

// ── Row ↔ AnyRecipe mapping ─────────────────────────────────────────────────

export function rowToAnyRecipe(row: RecipeRow): AnyRecipe {
  const base = {
    id: row.id,
    slug: row.slug,
    name: row.name,
    moods: (row.moods ?? []).filter((m): m is Mood =>
      (ALL_MOODS as string[]).includes(m),
    ),
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
        ...recipeData.parse(d),
      } satisfies Recipe;

    case "smoothie":
      return {
        ...base,
        type: "smoothie",
        category: "smoothie",
        ...smoothieData.parse(d),
      } satisfies SmoothieRecipe;

    case "snack":
      return {
        ...base,
        type: "snack",
        category: "snack",
        ...snackData.parse(d),
      } satisfies Snack;

    case "dessert":
      return {
        ...base,
        type: "dessert",
        category: "dessert",
        ...dessertData.parse(d),
      } satisfies Dessert;
  }
}

export function anyRecipeToRow(item: AnyRecipe): RecipeRow {
  // Pull out columns that are denormalised on the table; everything else is
  // jsonb data. We re-list the column keys because TypeScript narrows the union
  // nicely this way.
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
  return readCache<AnyRecipe[] | null>(CACHE_KEY, null);
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetches the unified recipe catalog from Supabase. On success refreshes the
 * localStorage cache. On failure / no config returns the cache (or `null` if
 * never cached).
 */
export async function loadRecipesFromSupabase(): Promise<AnyRecipe[] | null> {
  return loadCached<AnyRecipe[] | null>(CACHE_KEY, null, async () => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("name", { ascending: true });
    if (error || !data) return null;
    return (data as RecipeRow[]).map(rowToAnyRecipe);
  });
}
