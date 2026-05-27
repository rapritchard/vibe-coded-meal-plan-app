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
import { RecipeTip } from "@/components/shared/RecipeTip";
import { StepList } from "@/components/shared/StepList";
import { VariationList } from "@/components/shared/VariationList";
import { cn } from "@/lib/utils";

interface DessertCardProps {
  dessert: Dessert;
}

export function DessertCard({ dessert }: DessertCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <Card className="rounded-2xl overflow-hidden p-0 border-stone-100">
        <CollapsibleTrigger className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-muted/60 transition-colors">
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

        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            <StepList steps={dessert.steps} />
            {dessert.tip && <RecipeTip tip={dessert.tip} />}
            {dessert.variations?.length > 0 && (
              <VariationList variations={dessert.variations} />
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
