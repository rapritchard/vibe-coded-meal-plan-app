interface VariationListProps {
  variations: string[];
}

export function VariationList({ variations }: VariationListProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
        Variations
      </div>
      {variations.map((v, i) => (
        <div key={i} className="bg-muted rounded-xl p-3 flex gap-2">
          <span className="text-stone-400 flex-shrink-0">+</span>
          <p className="text-xs text-stone-700">{v}</p>
        </div>
      ))}
    </div>
  );
}
