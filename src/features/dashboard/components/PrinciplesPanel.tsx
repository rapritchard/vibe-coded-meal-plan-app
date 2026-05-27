import { Card } from "@/components/ui/card";
import { PRINCIPLES } from "@/data/recipes";

export function PrinciplesPanel() {
  return (
    <div>
      <h2 className="font-bold text-card-foreground text-lg mb-3">The rules</h2>
      <div className="space-y-3">
        {PRINCIPLES.map((p) => (
          <Card
            key={p.title}
            className="rounded-xl p-4 border-stone-100 flex gap-3"
          >
            <span className="text-xl flex-shrink-0">{p.icon}</span>
            <div>
              <div className="font-semibold text-card-foreground text-sm">
                {p.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {p.detail}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
