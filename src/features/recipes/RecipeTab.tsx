import { useCallback, useMemo, useState } from "react";

import type {
  AnyRecipe,
  EffortLevel,
  MealFilter,
  Mood,
  Recipe,
  RecipeCategoryKind,
} from "@/types";
import { Card } from "@/components/ui/card";

import { CategorySection } from "./components/CategorySection";
import { FilterBar } from "./components/FilterBar";
import { RecipeListItem } from "./components/RecipeListItem";
import { RecipeModal } from "./components/RecipeModal";

export interface RecipeTabProps {
  items: AnyRecipe[];
  activeMeal: MealFilter;
  onActiveMealChange: (m: MealFilter) => void;
}

const CATEGORY_ORDER: RecipeCategoryKind[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "smoothie",
  "dessert",
];

export default function RecipeTab({
  items,
  activeMeal,
  onActiveMealChange,
}: RecipeTabProps) {
  const [query, setQuery] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<ReadonlySet<Mood>>(
    () => new Set(),
  );
  const [selectedEffort, setSelectedEffort] = useState<
    ReadonlySet<EffortLevel>
  >(() => new Set());
  const [leftoversOnly, setLeftoversOnly] = useState(false);
  const [onTheGoOnly, setOnTheGoOnly] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const toggleMood = useCallback((mood: Mood) => {
    setSelectedMoods((prev) => {
      const next = new Set(prev);
      if (next.has(mood)) next.delete(mood);
      else next.add(mood);
      return next;
    });
  }, []);

  const toggleEffort = useCallback((effort: EffortLevel) => {
    setSelectedEffort((prev) => {
      const next = new Set(prev);
      if (next.has(effort)) next.delete(effort);
      else next.add(effort);
      return next;
    });
  }, []);

  const hasActiveFilters =
    activeMeal !== "all" ||
    selectedMoods.size > 0 ||
    selectedEffort.size > 0 ||
    leftoversOnly ||
    onTheGoOnly ||
    query.trim() !== "";

  const handleClearAll = useCallback(() => {
    onActiveMealChange("all");
    setSelectedMoods(new Set());
    setSelectedEffort(new Set());
    setLeftoversOnly(false);
    setOnTheGoOnly(false);
    setQuery("");
  }, [onActiveMealChange]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((r) => {
      if (activeMeal !== "all" && r.category !== activeMeal) return false;
      if (selectedMoods.size > 0) {
        const hit = r.moods.some((m) => selectedMoods.has(m));
        if (!hit) return false;
      }
      if (selectedEffort.size > 0 && !selectedEffort.has(r.effort))
        return false;
      if (leftoversOnly && !r.isBatch) return false;
      if (onTheGoOnly && !r.goodOnTheGo) return false;
      if (q) {
        const hay = [r.name, ...r.moods].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    items,
    activeMeal,
    selectedMoods,
    selectedEffort,
    leftoversOnly,
    onTheGoOnly,
    query,
  ]);

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

  const showSections = !hasActiveFilters;

  return (
    <>
      <RecipeModal
        recipe={activeRecipe}
        onClose={() => setActiveRecipe(null)}
      />

      <div className="space-y-4">
        <FilterBar
          query={query}
          onQueryChange={setQuery}
          activeMeal={activeMeal}
          onActiveMealChange={onActiveMealChange}
          selectedMoods={selectedMoods}
          onToggleMood={toggleMood}
          selectedEffort={selectedEffort}
          onToggleEffort={toggleEffort}
          leftoversOnly={leftoversOnly}
          onLeftoversToggle={setLeftoversOnly}
          onTheGoOnly={onTheGoOnly}
          onOnTheGoToggle={setOnTheGoOnly}
          totalCount={items.length}
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
              onViewRecipe={setActiveRecipe}
            />
          ))}

        {!showSections && (
          <div className="space-y-2">
            {filtered.map((item) => (
              <RecipeListItem
                key={`${item.type}:${item.id}`}
                item={item}
                onViewRecipe={setActiveRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
