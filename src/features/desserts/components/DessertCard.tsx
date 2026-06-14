import { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";

import type { Dessert } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NutritionSection } from "@/components/shared/NutritionSection";
import { RecipeNotes } from "@/components/shared/RecipeNotes";
import { RecipeTip } from "@/components/shared/RecipeTip";
import { StarRating } from "@/components/shared/StarRating";
import { StepList } from "@/components/shared/StepList";
import { VariationList } from "@/components/shared/VariationList";
import { useRatings } from "@/hooks/use-ratings";
import { cn } from "@/lib/utils";

interface DessertCardProps {
  dessert: Dessert;
}

export function DessertCard({ dessert }: DessertCardProps) {
  const [open, setOpen] = useState(false);
  const { getRating, setRating } = useRatings();
  const rating = getRating("dessert", dessert.id);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <Card className="rounded-lg overflow-hidden p-0 border-border">
        <div className="px-5 pt-4 pb-3">
          <CollapsibleTrigger className="w-full flex items-start justify-between text-left">
            <div>
              <div className="font-serif font-bold text-card-foreground text-sm">
                {dessert.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Time: {dessert.time} · Serves {dessert.serves}
              </div>
              {dessert.leadTime && (
                <Badge
                  variant="outline"
                  className="mt-1 bg-rose-50 text-rose-700 border-rose-200 font-normal gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {dessert.leadTime}
                </Badge>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ml-3 mt-0.5",
                open && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <div className="mt-2">
            <StarRating
              value={rating}
              onChange={(next) => setRating("dessert", dessert.id, next)}
              size="sm"
            />
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            <StepList steps={dessert.steps} />
            {dessert.tip && <RecipeTip tip={dessert.tip} />}
            {dessert.variations?.length > 0 && (
              <VariationList variations={dessert.variations} />
            )}
            <NutritionSection recipeId={dessert.id} nutrition={dessert.nutrition} />
            <RecipeNotes type="dessert" id={dessert.id} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
