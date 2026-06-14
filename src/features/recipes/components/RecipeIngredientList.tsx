import type { Recipe } from "@/types";

interface RecipeIngredientListProps {
  ingredients: Recipe["ingredients"];
}

export function RecipeIngredientList({
  ingredients,
}: RecipeIngredientListProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        Ingredients
      </div>
      {ingredients.map(([name, qty, unit], i) => (
        <div key={i} className="flex gap-2 text-sm text-foreground">
          <span className="text-foreground/30">–</span>
          <span>
            {qty} {unit} {name}
          </span>
        </div>
      ))}
    </div>
  );
}
