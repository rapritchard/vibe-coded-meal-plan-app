import { useState } from "react";

import type { PlannedMeal, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { RecipeTimeTag } from "@/components/shared/RecipeTimeTag";
import { TAG_STYLES } from "@/data/recipes";
import { RecipeModal } from "@/features/recipes/components/RecipeModal";
import { cn } from "@/lib/utils";

interface MealRowProps {
  label: string;
  meal: PlannedMeal;
  recipes: Recipe[];
}

export function MealRow({ label, meal, recipes }: MealRowProps) {
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const recipe = recipes.find((r) => r.name === meal.name) ?? null;

  return (
    <>
      <RecipeModal
        recipe={activeRecipe}
        onClose={() => setActiveRecipe(null)}
      />

      <div className="py-2.5 border-t border-stone-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {label}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm font-medium text-card-foreground">
                {meal.name}
              </span>
              {recipe && (
                <Button
                  size="sm"
                  onClick={() => setActiveRecipe(recipe)}
                  className="rounded-full px-2 py-0.5 h-auto text-xs font-normal"
                >
                  Recipe
                </Button>
              )}
            </div>
            {recipe && (
              <div className="mt-1">
                <RecipeTimeTag
                  icon={recipe.timeKey}
                  leadTime={recipe.leadTime}
                />
              </div>
            )}
            {meal.note && (
              <div className="text-xs text-muted-foreground mt-0.5 italic">
                {meal.note}
              </div>
            )}
          </div>
          {meal.prepNote && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0",
                TAG_STYLES[meal.prepNote] ?? "bg-gray-100 text-gray-600",
              )}
            >
              {meal.prepNote}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
