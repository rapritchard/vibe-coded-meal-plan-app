import { cn } from "@/lib/utils";

interface InteractiveVariationListProps {
  variations: string[];
  variationSteps: (string[] | null)[];
  activeVar: number | null;
  onSelect: (i: number) => void;
}

export function InteractiveVariationList({
  variations,
  variationSteps,
  activeVar,
  onSelect,
}: InteractiveVariationListProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Variations
      </div>
      {variations.map((v, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl p-3 flex gap-2 border transition-colors",
            activeVar === i
              ? "bg-indigo-50 border-indigo-200"
              : "bg-muted border-transparent",
          )}
        >
          <span className="flex-shrink-0 text-stone-400">+</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-stone-700">{v}</p>
            {variationSteps?.[i] && (
              <button
                onClick={() => onSelect(i)}
                className={cn(
                  "mt-2 text-xs px-3 py-1 rounded-full font-semibold transition-colors",
                  activeVar === i
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {activeVar === i ? "Showing variation" : "Try this version"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
