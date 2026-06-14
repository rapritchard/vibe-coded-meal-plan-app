import { Card } from "@/components/ui/card";
import { TIME_COLORS, TIME_KEY } from "@/data/recipes";

export function TimeKeyPanel() {
  return (
    <Card className="rounded-lg p-5 border-border">
      <div className="font-serif text-lg font-medium text-ink mb-3">Time key</div>
      <div className="space-y-2">
        {Object.entries(TIME_KEY).map(([icon, label]) => (
          <div key={icon} className="flex items-center gap-3">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                TIME_COLORS[icon as keyof typeof TIME_COLORS]
              }`}
            >
              {icon}
            </span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
            Lead time
          </span>
          <span className="text-sm text-muted-foreground">
            Action needed before you cook
          </span>
        </div>
      </div>
    </Card>
  );
}
