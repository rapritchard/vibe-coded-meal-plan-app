import { useCallback } from "react";

import type { CustomWeek, MealType, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DAYS } from "@/data/shoppingLists";

import { DayBuilderCard } from "./DayBuilderCard";

interface CustomWeekBuilderProps {
  recipes: Recipe[];
  customWeek: CustomWeek;
  saved: boolean;
  onWeekChange: (week: CustomWeek) => void;
  onSave: () => Promise<void>;
  onReset: () => Promise<void>;
  onViewRecipe: (recipe: Recipe) => void;
}

export function CustomWeekBuilder({
  recipes,
  customWeek,
  saved,
  onWeekChange,
  onSave,
  onReset,
  onViewRecipe,
}: CustomWeekBuilderProps) {
  const handleChange = useCallback(
    (day: string, type: MealType, value: string) => {
      const updated: CustomWeek = {
        ...customWeek,
        [day]: { ...customWeek[day], [type]: value },
      };

      // Batch-cook auto-suggest: a batch dinner pre-fills the next day's lunch
      // if it isn't already set.
      const recipe = recipes.find((r) => r.name === value);
      if (type === "dinner" && recipe?.isBatch) {
        const dayIndex = DAYS.indexOf(day as (typeof DAYS)[number]);
        const nextDay = DAYS[dayIndex + 1];
        if (nextDay && !updated[nextDay]?.lunch) {
          updated[nextDay] = { ...updated[nextDay], lunch: value };
        }
      }

      onWeekChange(updated);
    },
    [customWeek, recipes, onWeekChange],
  );

  const handleClear = useCallback(
    (day: string) => {
      onWeekChange({
        ...customWeek,
        [day]: { breakfast: "", lunch: "", dinner: "" },
      });
    },
    [customWeek, onWeekChange],
  );

  const handleClearAll = useCallback(() => {
    const confirmed = window.confirm(
      "Reset the custom week? All selections, the saved week, and the generated shopping list will be cleared.",
    );
    if (!confirmed) return;
    void onReset();
  }, [onReset]);

  return (
    <div className="space-y-4">
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-xs text-green-700 font-semibold">
          Saved — shopping list updated below.
        </div>
      )}

      <Card className="p-4 text-xs text-muted-foreground leading-relaxed border-border bg-muted">
        Build your week. Dinner recipes also appear as lunch options — batch
        cooks will auto-suggest leftovers for the next day.
      </Card>

      {DAYS.map((day) => (
        <DayBuilderCard
          key={day}
          day={day}
          meals={customWeek[day] ?? { breakfast: "", lunch: "", dinner: "" }}
          recipes={recipes}
          onView={onViewRecipe}
          onChange={handleChange}
          onClear={handleClear}
        />
      ))}

      <div className="flex gap-3 pt-1">
        <Button
          onClick={onSave}
          className="flex-1 rounded-lg py-3 h-auto font-bold text-sm"
        >
          Save &amp; Generate Shopping List
        </Button>
        <Button
          variant="outline"
          onClick={handleClearAll}
          className="rounded-lg px-4 py-3 h-auto border-2 border-border text-muted-foreground text-sm font-semibold hover:border-ink/30"
        >
          Reset week
        </Button>
      </div>
    </div>
  );
}
