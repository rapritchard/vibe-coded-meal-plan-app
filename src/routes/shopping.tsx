import { createFileRoute } from "@tanstack/react-router";

import ShoppingTab from "@/features/shopping/ShoppingTab";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createFileRoute("/shopping")({
  component: ShoppingPage,
});

function ShoppingPage() {
  const {
    recipes,
    customWeek,
    customSaved,
    customShoppingList,
    setCustomWeek,
    saveCustomWeek,
    resetCustomWeek,
  } = useAppData();

  return (
    <ShoppingTab
      recipes={recipes}
      customWeek={customWeek}
      customSaved={customSaved}
      customShoppingList={customShoppingList}
      onWeekChange={setCustomWeek}
      onSave={saveCustomWeek}
      onReset={resetCustomWeek}
    />
  );
}
