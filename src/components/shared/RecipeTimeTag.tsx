import { Clock } from "lucide-react";

import { TIME_COLORS, TIME_KEY } from "@/data/recipes";

interface RecipeTimeTagProps {
  icon: string;
  leadTime: string | null;
}

export function RecipeTimeTag({ icon, leadTime }: RecipeTimeTagProps) {
  const timeColor =
    TIME_COLORS[icon as keyof typeof TIME_COLORS] ??
    "bg-muted text-muted-foreground";
  const timeLabel = TIME_KEY[icon as keyof typeof TIME_KEY];

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${timeColor}`}
      >
        {icon} {timeLabel}
      </span>
      {leadTime && (
        <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {leadTime}
        </span>
      )}
    </div>
  );
}
