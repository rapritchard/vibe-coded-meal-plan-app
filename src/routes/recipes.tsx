import { useMemo } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import type {
  AnyRecipe,
  EffortLevel,
  MealFilter,
  Mood,
  Recipe,
  RecipeCategoryKind,
} from "@/types";
import { Card } from "@/components/ui/card";
import { CategorySection } from "@/features/recipes/components/CategorySection";
import { FilterBar } from "@/features/recipes/components/FilterBar";
import { RecipeListItem } from "@/features/recipes/components/RecipeListItem";
import {
  asMealFilter,
  effortSet,
  hasActiveFilters as searchHasActiveFilters,
  moodSet,
  validateRecipeSearch,
} from "@/features/recipes/search";
import { CATEGORY_ORDER } from "@/lib/taxonomy";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createFileRoute("/recipes")({
  validateSearch: validateRecipeSearch,
  component: RecipesLayout,
});

function RecipesLayout() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { allItems } = useAppData();

  // Single helper to patch the URL search params. `replace` avoids spamming
  // browser history while the user toggles filters / types in the search box.
  const patchSearch = (
    patch: Partial<typeof search>,
    opts?: { replace?: boolean },
  ) =>
    navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: opts?.replace,
    });

  const activeMeal = asMealFilter(search);
  const selectedMoods = moodSet(search);
  const selectedEffort = effortSet(search);
  const hasActiveFilters = searchHasActiveFilters(search);

  const toggleMood = (mood: Mood) => {
    const next = new Set(selectedMoods);
    if (next.has(mood)) next.delete(mood);
    else next.add(mood);
    patchSearch({ moods: next.size ? [...next] : undefined });
  };

  const toggleEffort = (effort: EffortLevel) => {
    const next = new Set(selectedEffort);
    if (next.has(effort)) next.delete(effort);
    else next.add(effort);
    patchSearch({ effort: next.size ? [...next] : undefined });
  };

  const handleActiveMealChange = (meal: MealFilter) =>
    patchSearch({ meal: meal === "all" ? undefined : meal });

  const handleQueryChange = (q: string) =>
    patchSearch({ q: q.trim() === "" ? undefined : q }, { replace: true });

  const handleClearAll = () => navigate({ search: {} });

  const filtered = useMemo(() => {
    const q = (search.q ?? "").toLowerCase().trim();
    return allItems.filter((r) => {
      if (activeMeal !== "all" && r.category !== activeMeal) return false;
      if (selectedMoods.size > 0 && !r.moods.some((m) => selectedMoods.has(m)))
        return false;
      if (selectedEffort.size > 0 && !selectedEffort.has(r.effort)) return false;
      if (search.leftovers && !r.isBatch) return false;
      if (search.onTheGo && !r.goodOnTheGo) return false;
      if (q) {
        const hay = [r.name, ...r.moods].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // `search` is a stable reference from the router until params change.
  }, [allItems, search, activeMeal, selectedMoods, selectedEffort]);

  const byCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<RecipeCategoryKind, AnyRecipe[]>>(
        (acc, cat) => ({
          ...acc,
          [cat]: filtered.filter((r) => r.category === cat),
        }),
        {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: [],
          smoothie: [],
          dessert: [],
        },
      ),
    [filtered],
  );

  // Opening a recipe is a navigation to the deep-linkable modal route, which
  // preserves the current filters in the URL.
  const handleViewRecipe = (recipe: Recipe) =>
    navigate({
      to: "/recipes/$slug",
      params: { slug: recipe.slug },
      search: (prev) => prev,
    });

  const showSections = !hasActiveFilters;

  return (
    <>
      {/* The deep-linkable recipe modal renders through this outlet. */}
      <Outlet />

      <div className="space-y-4">
        <FilterBar
          query={search.q ?? ""}
          onQueryChange={handleQueryChange}
          activeMeal={activeMeal}
          onActiveMealChange={handleActiveMealChange}
          selectedMoods={selectedMoods}
          onToggleMood={toggleMood}
          selectedEffort={selectedEffort}
          onToggleEffort={toggleEffort}
          leftoversOnly={Boolean(search.leftovers)}
          onLeftoversToggle={(v) => patchSearch({ leftovers: v || undefined })}
          onTheGoOnly={Boolean(search.onTheGo)}
          onOnTheGoToggle={(v) => patchSearch({ onTheGo: v || undefined })}
          totalCount={allItems.length}
          filteredCount={filtered.length}
          hasActiveFilters={hasActiveFilters}
          onClearAll={handleClearAll}
        />

        {filtered.length === 0 && (
          <Card className="p-6 border-stone-100 text-center text-sm text-muted-foreground">
            No items match your filters.
          </Card>
        )}

        {showSections &&
          CATEGORY_ORDER.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              items={byCategory[cat]}
              onViewRecipe={handleViewRecipe}
            />
          ))}

        {!showSections && (
          <div className="space-y-2">
            {filtered.map((item) => (
              <RecipeListItem
                key={`${item.type}:${item.id}`}
                item={item}
                onViewRecipe={handleViewRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
