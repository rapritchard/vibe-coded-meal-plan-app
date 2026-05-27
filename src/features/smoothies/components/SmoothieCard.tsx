import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { SmoothieRecipe } from "@/types";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RecipeTip } from "@/components/shared/RecipeTip";
import { VariationList } from "@/components/shared/VariationList";
import { cn } from "@/lib/utils";

import { BlenderMethodTabs } from "./BlenderMethodTabs";
import { IngredientList } from "./IngredientList";

interface SmoothieCardProps {
  smoothie: SmoothieRecipe;
}

export function SmoothieCard({ smoothie }: SmoothieCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <Card className="rounded-2xl overflow-hidden p-0 border-stone-100">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/60 transition-colors">
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
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
