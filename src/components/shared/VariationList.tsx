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
        <div key={i} className="bg-muted rounded-lg p-3 flex gap-2 items-baseline">
          <span className="text-xs text-muted-foreground flex-shrink-0">+</span>
          <p className="text-xs text-foreground">{v}</p>
        </div>
      ))}
    </div>
  );
}
