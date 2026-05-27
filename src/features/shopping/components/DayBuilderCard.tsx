import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { MealType, Recipe } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { MealSelector } from "./MealSelector";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

interface DayBuilderCardProps {
  day: string;
  meals: { breakfast: string; lunch: string; dinner: string };
  recipes: Recipe[];
  onView: (recipe: Recipe) => void;
  onChange: (day: string, type: MealType, value: string) => void;
  onClear: (day: string) => void;
}

export function DayBuilderCard({
  day,
  meals,
  recipes,
  onView,
  onChange,
  onClear,
}: DayBuilderCardProps) {
  const [open, setOpen] = useState(true);
  const filled = MEAL_TYPES.filter((t) => meals[t]).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <Card className="rounded-2xl overflow-hidden p-0 border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-50">
          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
            <span className="font-serif font-bold text-card-foreground text-sm">
              {day}
            </span>
            {filled > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {filled}/3
              </span>
            )}
          </CollapsibleTrigger>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onClear(day)}
              className="text-xs text-muted-foreground hover:text-rose-500 transition-colors"
            >
              Clear
            </button>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-5 py-3 space-y-3">
            {MEAL_TYPES.map((type) => (
              <MealSelector
                key={type}
                day={day}
                type={type}
                value={meals[type]}
                recipes={recipes}
                onView={onView}
                onChange={onChange}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
