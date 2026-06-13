// ─────────────────────────────────────────────────────────────────────────────
// src/lib/shopping.ts
// Custom-week logic: shopping-list generation, the empty-week factory, and the
// shared (Supabase-backed) persistence for the custom week. The static curated
// data + constants live in src/data/shoppingLists.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { CustomWeek, Recipe, ShoppingCategory } from "@/types";
import { loadAppState, saveAppState } from "@/lib/app-state";
import {
  DAYS,
  MEAL_TYPES,
  SHOPPING_CATEGORY_KEYWORDS,
} from "@/data/shoppingLists";

/**
 * Builds a categorised shopping list from the recipes selected in a custom week.
 * Collects unique ingredient names across the selected recipes, then buckets
 * them using `SHOPPING_CATEGORY_KEYWORDS`; anything unmatched lands in "Other".
 */
export function generateShoppingList(
  customWeek: CustomWeek,
  recipes: Recipe[],
): ShoppingCategory {
  // 1. Collect unique ingredient names across all selected recipes.
  const map: Record<string, string> = {};

  const addIngredient = (name: string): void => {
    const key = name.toLowerCase().trim();
    if (!map[key]) map[key] = name;
  };

  Object.values(customWeek).forEach((day) => {
    MEAL_TYPES.forEach((type) => {
      const recipeName = day[type];
      if (!recipeName) return;
      const recipe = recipes.find((r) => r.name === recipeName);
      if (recipe?.ingredients) {
        recipe.ingredients.forEach(([name]) => addIngredient(name));
      }
    });
  });

  // 2. Categorise using keyword matching.
  const grouped: ShoppingCategory = {};
  const assigned = new Set<string>();

  Object.entries(SHOPPING_CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    const matches: string[] = [];

    Object.values(map).forEach((name) => {
      const key = name.toLowerCase();
      const alreadyAssigned = assigned.has(key);
      const matchesCategory = keywords.some(
        (kw) => key.includes(kw) || kw.includes(key),
      );
      if (!alreadyAssigned && matchesCategory) {
        matches.push(name);
        assigned.add(key);
      }
    });

    if (matches.length > 0) {
      grouped[category] = matches;
    }
  });

  // 3. Catch anything that didn't match a keyword category.
  const uncategorised = Object.values(map).filter(
    (name) => !assigned.has(name.toLowerCase()),
  );
  if (uncategorised.length > 0) {
    grouped["Other"] = uncategorised;
  }

  return grouped;
}

/**
 * Returns a blank CustomWeek with every day initialised to empty strings. Used
 * as the default state for the custom week builder.
 */
export function createEmptyWeek(): CustomWeek {
  return DAYS.reduce<CustomWeek>(
    (acc, day) => ({
      ...acc,
      [day]: { breakfast: "", lunch: "", dinner: "" },
    }),
    {} as CustomWeek,
  );
}

// ── Shared persistence (Supabase-backed app_state, localStorage-cached) ───────

/** Storage key constants — single source of truth. */
export const STORAGE_KEYS = {
  customWeek: "custom-week-d",
  phase2Unlocked: "phase2-unlocked",
} as const;

/**
 * Loads the persisted custom week from shared app state. Falls back to a blank
 * week on any error.
 */
export async function loadCustomWeek(): Promise<CustomWeek> {
  return loadAppState<CustomWeek>(STORAGE_KEYS.customWeek, createEmptyWeek());
}

/** Persists the current custom week selection (shared household state). */
export async function saveCustomWeek(week: CustomWeek): Promise<void> {
  await saveAppState(STORAGE_KEYS.customWeek, week);
}
