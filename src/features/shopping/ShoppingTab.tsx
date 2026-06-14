import { useCallback, useState } from "react";

import type { CustomWeek, Recipe, ShoppingCategory } from "@/types";
import { saveCustomWeek } from "@/lib/shopping";
import { RecipeModal } from "@/features/recipes/components/RecipeModal";

import { CustomShoppingView } from "./components/CustomShoppingView";

export interface ShoppingTabProps {
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  customShoppingList: ShoppingCategory | null;
  onWeekChange: (week: CustomWeek) => void;
  onSave: (week: CustomWeek) => Promise<void>;
  onReset: () => Promise<void>;
}

export default function ShoppingTab({
  recipes,
  customWeek,
  customSaved,
  customShoppingList,
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
      <RecipeModal recipe={previewRecipe} onClose={() => setPreviewRecipe(null)} />

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
    </>
  );
}
