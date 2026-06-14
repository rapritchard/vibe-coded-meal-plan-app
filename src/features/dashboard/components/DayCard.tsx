import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { DayPlan, Recipe } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { MealRow } from "./MealRow";
import { SnacksRow } from "./SnacksRow";

interface DayCardProps {
  day: DayPlan;
  recipes: Recipe[];
}

export function DayCard({ day, recipes }: DayCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <Card className="rounded-lg overflow-hidden p-0 border-border">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/60 transition-colors">
          <span className="font-serif font-bold text-card-foreground">
            {day.day}
          </span>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 pb-4">
            <MealRow
              label="Breakfast"
              meal={day.meals.breakfast}
              recipes={recipes}
            />
            <MealRow label="Lunch" meal={day.meals.lunch} recipes={recipes} />
            <MealRow label="Dinner" meal={day.meals.dinner} recipes={recipes} />
            <SnacksRow snacks={day.meals.snacks} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
