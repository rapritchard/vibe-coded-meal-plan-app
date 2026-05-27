import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type { KitchenTool } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import { ToolCard } from "./ToolCard";

interface CategorySectionProps {
  category: string;
  tools: KitchenTool[];
  defaultOpen?: boolean;
}

export function CategorySection({
  category,
  tools,
  defaultOpen = true,
}: CategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group w-full flex items-center justify-between mb-3">
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {category}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground",
            open && "rotate-180",
          )}
        />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-2">
          {tools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
