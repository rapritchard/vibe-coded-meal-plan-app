import { Card } from "@/components/ui/card";
import { TIME_COLORS, TIME_KEY } from "@/data/recipes";

export function TimeKeyPanel() {
  return (
    <Card className="rounded-2xl p-5 border-stone-100">
      <div className="font-bold text-card-foreground mb-3">Time key</div>
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
            <span className="text-sm text-stone-600">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
            xN to wash
          </span>
          <span className="text-sm text-stone-600">
            Number of things to wash up
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
            Lead time
          </span>
          <span className="text-sm text-stone-600">
            Action needed before you cook
          </span>
        </div>
      </div>
    </Card>
  );
}
