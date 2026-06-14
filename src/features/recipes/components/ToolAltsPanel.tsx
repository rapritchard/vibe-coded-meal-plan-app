import type { ToolAlt } from "@/types";

interface ToolAltsPanelProps {
  alts: ToolAlt[];
}

export function ToolAltsPanel({ alts }: ToolAltsPanelProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Try it differently
      </div>
      {alts.map((t, i) => (
        <div
          key={i}
          className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2"
        >
          <span className="text-xs font-bold text-amber-800 flex-shrink-0">
            {t.tool}
          </span>
          <span className="text-xs text-amber-700">— {t.note}</span>
        </div>
      ))}
    </div>
  );
}
