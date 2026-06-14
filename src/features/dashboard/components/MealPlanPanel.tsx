import type { CustomWeek, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { InfoBanner } from "@/components/shared/InfoBanner";
import { DAYS } from "@/data/shoppingLists";

import { DayCard } from "./DayCard";

interface MealPlanPanelProps {
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  onNavigateToCustomBuilder: () => void;
  onResetCustomWeek: () => Promise<void>;
}

const CUSTOM_SNACKS = [
  "Banana",
  "Batch boiled egg",
  "Rice cakes with Philly Lightest",
];

export function MealPlanPanel({
  recipes,
  customWeek,
  customSaved,
  onNavigateToCustomBuilder,
  onResetCustomWeek,
}: MealPlanPanelProps) {
  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset the custom week? All selections, the saved week, and the generated shopping list will be cleared.",
    );
    if (!confirmed) return;
    void onResetCustomWeek();
  };

  if (!customSaved) {
    return (
      <div className="space-y-4">
        <InfoBanner>
          No week built yet — head to Shopping to choose meals and generate your
          list. It’ll show here once saved.
        </InfoBanner>
        <Button
          onClick={onNavigateToCustomBuilder}
          className="w-full py-3 h-auto font-semibold text-sm"
        >
          Build your week
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {DAYS.map((day) => (
        <DayCard
          key={day}
          day={{
            day,
            meals: {
              breakfast: { name: customWeek[day]?.breakfast || "not set" },
              lunch: { name: customWeek[day]?.lunch || "not set" },
              dinner: { name: customWeek[day]?.dinner || "not set" },
              snacks: CUSTOM_SNACKS,
            },
          }}
          recipes={recipes}
        />
      ))}

      <div className="flex gap-3 pt-1">
        <Button
          onClick={onNavigateToCustomBuilder}
          className="flex-1 py-3 h-auto font-semibold text-sm"
        >
          Edit in Shopping
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="px-4 py-3 h-auto border-2 border-border text-muted-foreground text-sm font-semibold hover:border-ink/30"
        >
          Reset week
        </Button>
      </div>
    </div>
  );
}
