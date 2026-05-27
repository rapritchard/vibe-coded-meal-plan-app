import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { SmoothieRecipe } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RecipeNotes } from "@/components/shared/RecipeNotes";
import { RecipeTip } from "@/components/shared/RecipeTip";
import { StarRating } from "@/components/shared/StarRating";
import { VariationList } from "@/components/shared/VariationList";
import { useRatings } from "@/hooks/use-ratings";
import { cn } from "@/lib/utils";

import { BlenderMethodTabs } from "./BlenderMethodTabs";
import { IngredientList } from "./IngredientList";

interface SmoothieCardProps {
  smoothie: SmoothieRecipe;
}

export function SmoothieCard({ smoothie }: SmoothieCardProps) {
  const [open, setOpen] = useState(false);
  const { getRating, setRating } = useRatings();
  const rating = getRating("smoothie", smoothie.id);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <Card className="rounded-2xl overflow-hidden p-0 border-stone-100">
        <div className="px-5 pt-4 pb-3">
          <CollapsibleTrigger className="w-full flex items-center justify-between text-left">
            <div>
              <div className="font-serif font-bold text-card-foreground text-sm">
                {smoothie.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {smoothie.desc}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0",
                open && "rotate-180",
              )}
            />
          </CollapsibleTrigger>
          <div className="mt-2">
            <StarRating
              value={rating}
              onChange={(next) => setRating("smoothie", smoothie.id, next)}
              size="sm"
            />
          </div>
        </div>

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            <BlenderMethodTabs
              bc151Steps={smoothie.bc151}
              duoSteps={smoothie.duo}
            />
            <IngredientList ingredients={smoothie.ingredients} />
            {smoothie.tip && <RecipeTip tip={smoothie.tip} />}
            {smoothie.variations?.length > 0 && (
              <VariationList variations={smoothie.variations} />
            )}
            <RecipeNotes type="smoothie" id={smoothie.id} />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
