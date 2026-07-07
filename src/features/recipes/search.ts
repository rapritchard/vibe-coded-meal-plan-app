// ─────────────────────────────────────────────────────────────────────────────
// src/features/recipes/search.ts
// Zod schema + helpers for the /recipes URL search params. Keeping this in one
// place means the route's validateSearch, the FilterBar handlers, and any
// <Link> that targets /recipes all agree on the shape.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

import { ALL_MOODS, type EffortLevel, type MealFilter, type Mood } from "@/types";

const EFFORT_VALUES = [
  "ready",
  "make-ahead",
  "quick-cook",
  "set-forget",
  "cook-tend",
] as const satisfies readonly EffortLevel[];

const MEAL_VALUES = [
  "all",
  "breakfast",
  "lunch",
  "dinner",
  "protein-bakes",
  "snack",
  "smoothie",
  "dessert",
] as const satisfies readonly MealFilter[];

export const recipeSearchSchema = z.object({
  meal: z.enum(MEAL_VALUES).optional().catch(undefined),
  moods: z
    .array(z.enum(ALL_MOODS as [Mood, ...Mood[]]))
    .optional()
    .catch(undefined),
  effort: z.array(z.enum(EFFORT_VALUES)).optional().catch(undefined),
  leftovers: z.boolean().optional().catch(undefined),
  onTheGo: z.boolean().optional().catch(undefined),
  hormoneSupport: z.boolean().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
});

export type RecipeSearch = z.infer<typeof recipeSearchSchema>;

/** Validator passed to the route. `.catch` on each field keeps a mangled URL
 * from throwing — unknown values simply fall back to "no filter". */
export function validateRecipeSearch(input: Record<string, unknown>): RecipeSearch {
  return recipeSearchSchema.parse(input);
}

// ── Convenience converters between URL arrays and the Sets the UI uses ────────

export function asMealFilter(search: RecipeSearch): MealFilter {
  return search.meal ?? "all";
}

export function moodSet(search: RecipeSearch): ReadonlySet<Mood> {
  return new Set(search.moods ?? []);
}

export function effortSet(search: RecipeSearch): ReadonlySet<EffortLevel> {
  return new Set(search.effort ?? []);
}

/** True when any filter narrows the catalog. */
export function hasActiveFilters(search: RecipeSearch): boolean {
  return (
    (search.meal != null && search.meal !== "all") ||
    (search.moods?.length ?? 0) > 0 ||
    (search.effort?.length ?? 0) > 0 ||
    Boolean(search.leftovers) ||
    Boolean(search.onTheGo) ||
    Boolean(search.hormoneSupport) ||
    (search.q?.trim() ?? "") !== ""
  );
}
