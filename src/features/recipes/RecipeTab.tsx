import { useMemo, useState } from "react";

import type { MealCategory, Recipe } from "@/types";
import { Card } from "@/components/ui/card";

import { CategorySection } from "./components/CategorySection";
import { FilterBar, type FilterCategory } from "./components/FilterBar";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeModal } from "./components/RecipeModal";

export interface RecipeTabProps {
  recipes: Recipe[];
}

const CATEGORIES: MealCategory[] = ["breakfast", "lunch", "dinner"];

export default function RecipeTab({ recipes }: RecipeTabProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [query, setQuery] = useState("");
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return recipes.filter((r) => {
      const categoryMatch =
        activeCategory === "all" || r.category === activeCategory;
      const queryMatch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.moods?.some((m) => m.toLowerCase().includes(q)) ||
        r.effort.toLowerCase().includes(q);
      return categoryMatch && queryMatch;
    });
  }, [recipes, activeCategory, query]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.reduce<Record<MealCategory, Recipe[]>>(
        (acc, cat) => ({
          ...acc,
          [cat]: filtered.filter((r) => r.category === cat),
        }),
        { breakfast: [], lunch: [], dinner: [] },
      ),
    [filtered],
  );

  const showSections = activeCategory === "all";

  return (
    <>
      <RecipeModal
        recipe={activeRecipe}
        onClose={() => setActiveRecipe(null)}
      />

      <div className="space-y-4">
        <FilterBar
          active={activeCategory}
          query={query}
          onCategoryChange={setActiveCategory}
          onQueryChange={setQuery}
          totalCount={recipes.length}
          filteredCount={filtered.length}
        />

        {filtered.length === 0 && (
          <Card className="p-6 border-stone-100 text-center text-sm text-muted-foreground">
            No recipes match that search.
          </Card>
        )}

        {showSections &&
          CATEGORIES.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              recipes={byCategory[cat]}
              onView={setActiveRecipe}
            />
          ))}

        {!showSections && (
          <div className="space-y-2">
            {filtered.map((r) => (
              <RecipeCard key={r.id} recipe={r} onView={setActiveRecipe} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
