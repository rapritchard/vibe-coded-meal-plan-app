import type { MealCategory, Recipe } from "@/types";

import { RecipeCard } from "./RecipeCard";

interface CategorySectionProps {
  category: MealCategory;
  recipes: Recipe[];
  onView: (recipe: Recipe) => void;
}

export function CategorySection({
  category,
  recipes,
  onView,
}: CategorySectionProps) {
  if (recipes.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 mt-2">
        {category}
      </div>
      <div className="space-y-2">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} onView={onView} />
        ))}
      </div>
    </div>
  );
}
