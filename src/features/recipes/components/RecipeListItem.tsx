import type { AnyRecipe, Recipe } from "@/types";

import { RecipeCard } from "./RecipeCard";
import { SmoothieCard } from "@/features/smoothies/components/SmoothieCard";
import { DessertCard } from "@/features/desserts/components/DessertCard";
import { SnackCard } from "@/features/snacks/components/SnackCard";

interface RecipeListItemProps {
  item: AnyRecipe;
  onViewRecipe: (recipe: Recipe) => void;
}

/**
 * Type-discriminated card dispatcher. Picks the right per-kind card so the
 * unified Recipes catalog can render mixed item types in one list.
 */
export function RecipeListItem({ item, onViewRecipe }: RecipeListItemProps) {
  switch (item.type) {
    case "recipe":
      return <RecipeCard recipe={item} onView={onViewRecipe} />;
    case "smoothie":
      return <SmoothieCard smoothie={item} />;
    case "snack":
      return <SnackCard snack={item} />;
    case "dessert":
      return <DessertCard dessert={item} />;
  }
}
