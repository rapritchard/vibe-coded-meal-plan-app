import { useCallback, useState } from "react";

import type { CustomWeek, Recipe, ShoppingCategory } from "@/types";
import { saveCustomWeek } from "@/lib/shopping";
import type { WeekName } from "@/data/shoppingLists";
import { RecipeModal } from "@/features/recipes/components/RecipeModal";

import { CuratedShoppingView } from "./components/CuratedShoppingView";
import { CustomShoppingView } from "./components/CustomShoppingView";
import { WeekSelector } from "./components/WeekSelector";

export interface ShoppingTabProps {
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  customShoppingList: ShoppingCategory | null;
  activeWeek: WeekName;
  onActiveWeekChange: (week: WeekName) => void;
  onWeekChange: (week: CustomWeek) => void;
  onSave: (week: CustomWeek) => Promise<void>;
  onReset: () => Promise<void>;
}

export default function ShoppingTab({
  recipes,
  customWeek,
  customSaved,
  customShoppingList,
  activeWeek,
  onActiveWeekChange,
  onWeekChange,
  onSave,
  onReset,
}: ShoppingTabProps) {
  const [previewRecipe, setPreviewRecipe] = useState<Recipe | null>(null);

  const handleSave = useCallback(async () => {
    await saveCustomWeek(customWeek);
    await onSave(customWeek);
  }, [customWeek, onSave]);

  return (
    <>
      <RecipeModal
        recipe={previewRecipe}
        onClose={() => setPreviewRecipe(null)}
      />

      <div className="space-y-4">
        <WeekSelector active={activeWeek} onChange={onActiveWeekChange} />

        {activeWeek === "Custom" ? (
          <CustomShoppingView
            recipes={recipes}
            customWeek={customWeek}
            customSaved={customSaved}
            customShoppingList={customShoppingList}
            onWeekChange={onWeekChange}
            onSave={handleSave}
            onReset={onReset}
            onViewRecipe={setPreviewRecipe}
          />
        ) : (
          <CuratedShoppingView week={activeWeek} />
        )}
      </div>
    </>
  );
}
