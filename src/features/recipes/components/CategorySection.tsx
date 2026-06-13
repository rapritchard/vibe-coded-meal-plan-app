import type { AnyRecipe, Recipe, RecipeCategoryKind } from "@/types";
import { CATEGORY_LABELS } from "@/lib/taxonomy";

import { RecipeListItem } from "./RecipeListItem";

interface CategorySectionProps {
  category: RecipeCategoryKind;
  items: AnyRecipe[];
  onViewRecipe: (recipe: Recipe) => void;
}

export function CategorySection({
  category,
  items,
  onViewRecipe,
}: CategorySectionProps) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 mt-2">
        {CATEGORY_LABELS[category]}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <RecipeListItem
            key={`${item.type}:${item.id}`}
            item={item}
            onViewRecipe={onViewRecipe}
          />
        ))}
      </div>
    </div>
  );
}
