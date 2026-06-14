interface IngredientListProps {
  ingredients: string[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <div>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
        Ingredients
      </div>
      <ul className="space-y-1">
        {ingredients.map((ing, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground">
            <span className="text-foreground/30 flex-shrink-0">–</span>
            <span>{ing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
