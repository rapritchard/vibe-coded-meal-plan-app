import { useState } from "react";

import type { CustomWeek, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { InfoBanner } from "@/components/shared/InfoBanner";
import {
  DAYS,
  WEEK_BORDER,
  WEEK_COLORS,
  WEEK_PLANS,
  WEEKS,
} from "@/data/shoppingLists";
import type { WeekName } from "@/data/shoppingLists";
import { cn } from "@/lib/utils";

import { DayCard } from "./DayCard";

interface MealPlanPanelProps {
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  onNavigateToCustomBuilder: () => void;
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
}: MealPlanPanelProps) {
  const [week, setWeek] = useState<WeekName>("Week A");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {WEEKS.map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-bold border-2 min-w-0 transition-colors",
              week === w
                ? `${WEEK_COLORS[w]} ${WEEK_BORDER[w]}`
                : "bg-background text-muted-foreground border-border hover:border-stone-300",
            )}
          >
            {w}
          </button>
        ))}
      </div>

      {week === "Custom" ? (
        <div className="space-y-4">
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-800">
            {customSaved
              ? "Your saved custom week is shown below."
              : "Custom week not built yet — go to Shopping then Custom to build it."}
          </div>
          {customSaved &&
            DAYS.map((day) => (
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
          {!customSaved && (
            <Button
              onClick={onNavigateToCustomBuilder}
              className="w-full rounded-xl py-3 h-auto font-bold text-sm bg-violet-700 hover:bg-violet-800"
            >
              Build Custom Week
            </Button>
          )}
        </div>
      ) : (
        <>
          <InfoBanner>
            Tap a day to expand. Tap Recipe for full instructions.
          </InfoBanner>
          {WEEK_PLANS[week]?.map((day) => (
            <DayCard key={day.day} day={day} recipes={recipes} />
          ))}
        </>
      )}
    </div>
  );
}
