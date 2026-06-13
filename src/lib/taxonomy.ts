// ─────────────────────────────────────────────────────────────────────────────
// src/lib/taxonomy.ts
// Single source of truth for how catalog categories and effort levels are
// ordered and labelled in the UI. Previously these were copy-pasted across
// RecipeTab, ReviewTab, FilterBar, and CategorySection — adding a category meant
// editing several files. Import from here instead.
// ─────────────────────────────────────────────────────────────────────────────

import type { EffortLevel, RecipeCategoryKind } from "@/types";

/** Display order for catalog categories (sections, filter dropdowns, review). */
export const CATEGORY_ORDER: RecipeCategoryKind[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "smoothie",
  "dessert",
];

/** Human label for each category. */
export const CATEGORY_LABELS: Record<RecipeCategoryKind, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
  smoothie: "Smoothies",
  dessert: "Desserts",
};

/** Display order for effort levels (filter dropdowns, review buckets). */
export const EFFORT_ORDER: EffortLevel[] = [
  "ready",
  "make-ahead",
  "quick-cook",
  "set-forget",
  "cook-tend",
];

/** {value,label} pairs for the meal filter control, derived from the order +
 * labels above so there is nothing to keep in sync. */
export const MEAL_OPTIONS: { value: RecipeCategoryKind; label: string }[] =
  CATEGORY_ORDER.map((value) => ({ value, label: CATEGORY_LABELS[value] }));
