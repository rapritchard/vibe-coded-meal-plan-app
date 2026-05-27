import type { KitchenTool } from "@/types";
import { Card } from "@/components/ui/card";

interface ToolCardProps {
  tool: KitchenTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="rounded-xl p-4 border-stone-100">
      <div className="font-semibold text-card-foreground text-sm">
        {tool.name}
      </div>
      {tool.notes && (
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {tool.notes}
        </div>
      )}
    </Card>
  );
}
