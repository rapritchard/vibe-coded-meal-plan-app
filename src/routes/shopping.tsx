import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import ShoppingTab from "@/features/shopping/ShoppingTab";
import { WEEKS } from "@/data/shoppingLists";
import { useAppData } from "@/hooks/use-app-data";

const shoppingSearchSchema = z.object({
  week: z.enum(WEEKS).optional().catch(undefined),
});

export const Route = createFileRoute("/shopping")({
  validateSearch: (search) => shoppingSearchSchema.parse(search),
  component: ShoppingPage,
});

function ShoppingPage() {
  const { week } = Route.useSearch();
  const navigate = useNavigate();
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
      activeWeek={week ?? "Week A"}
      onActiveWeekChange={(w) =>
        navigate({ to: "/shopping", search: { week: w } })
      }
      onWeekChange={setCustomWeek}
      onSave={saveCustomWeek}
      onReset={resetCustomWeek}
    />
  );
}
