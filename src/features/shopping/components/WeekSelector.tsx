import { WEEKS, WEEK_BORDER, WEEK_COLORS } from "@/data/shoppingLists";
import type { WeekName } from "@/data/shoppingLists";
import { cn } from "@/lib/utils";

interface WeekSelectorProps {
  active: WeekName;
  onChange: (w: WeekName) => void;
}

export function WeekSelector({ active, onChange }: WeekSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {WEEKS.map((w) => (
        <button
          key={w}
          onClick={() => onChange(w)}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-bold border-2 min-w-0 transition-colors",
            active === w
              ? `${WEEK_COLORS[w]} ${WEEK_BORDER[w]}`
              : "bg-background text-muted-foreground border-border hover:border-stone-300",
          )}
        >
          {w}
        </button>
      ))}
    </div>
  );
}
