import type { Snack } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SnackCardProps {
  snack: Snack;
}

export function SnackCard({ snack }: SnackCardProps) {
  return (
    <Card className="rounded-2xl p-4 border-stone-100">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="font-serif font-bold text-card-foreground text-sm">
          {snack.name}
        </div>
        <Badge variant="secondary" className="flex-shrink-0 font-normal">
          {snack.badge}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {snack.desc}
      </p>
    </Card>
  );
}
