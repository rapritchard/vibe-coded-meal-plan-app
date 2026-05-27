import { Card } from "@/components/ui/card";
import { FLAVOUR_TOOLS } from "@/data/recipes";

export function FlavourToolsPanel() {
  return (
    <div>
      <h2 className="font-bold text-card-foreground text-lg mb-3">
        Flavour tools
      </h2>
      <div className="space-y-2">
        {FLAVOUR_TOOLS.map((f) => (
          <Card
            key={f.name}
            className="rounded-xl p-3 border-stone-100 flex gap-3"
          >
            <span className="text-lg">{f.icon}</span>
            <div>
              <span className="font-semibold text-card-foreground text-sm">
                {f.name} —{" "}
              </span>
              <span className="text-xs text-muted-foreground">{f.use}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
