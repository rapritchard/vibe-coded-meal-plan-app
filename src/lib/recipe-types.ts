/**
 * Shared discriminator across per-recipe persistence stores (ratings, notes).
 * Keys in those stores are namespaced as `${RecipeType}:${id}`.
 */
export type RecipeType = "recipe" | "smoothie" | "dessert" | "phase2";
