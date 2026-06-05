import type { CustomWeek, Recipe, ShoppingCategory } from "@/types";

import { CustomWeekBuilder } from "./CustomWeekBuilder";
import { ShoppingList } from "./ShoppingList";

interface CustomShoppingViewProps {
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  customShoppingList: ShoppingCategory | null;
  onWeekChange: (week: CustomWeek) => void;
  onSave: () => Promise<void>;
  onReset: () => Promise<void>;
  onViewRecipe: (recipe: Recipe) => void;
}

export function CustomShoppingView({
  recipes,
  customWeek,
  customSaved,
  customShoppingList,
  onWeekChange,
  onSave,
  onReset,
  onViewRecipe,
}: CustomShoppingViewProps) {
  return (
    <div className="space-y-4">
      <CustomWeekBuilder
        recipes={recipes}
        customWeek={customWeek}
        saved={customSaved}
        onWeekChange={onWeekChange}
        onSave={onSave}
        onReset={onReset}
        onViewRecipe={onViewRecipe}
      />

      {customSaved && customShoppingList && (
        <div className="space-y-4 pt-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Generated Shopping List — Custom Week
          </div>
          <ShoppingList key="custom" items={customShoppingList} />
        </div>
      )}
    </div>
  );
}
