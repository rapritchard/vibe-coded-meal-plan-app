interface SnacksRowProps {
  snacks: string[];
}

export function SnacksRow({ snacks }: SnacksRowProps) {
  return (
    <div className="py-2.5 border-t border-border">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        Snacks
      </div>
      <div className="flex flex-wrap gap-1.5">
        {snacks.map((s, i) => (
          <span
            key={i}
            className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
