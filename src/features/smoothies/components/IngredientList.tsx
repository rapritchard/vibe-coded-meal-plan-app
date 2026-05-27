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
          <li key={i} className="flex gap-2 text-sm text-stone-700">
            <span className="text-stone-300 flex-shrink-0">–</span>
            <span>{ing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
