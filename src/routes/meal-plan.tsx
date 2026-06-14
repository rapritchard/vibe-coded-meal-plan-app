import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { MealPlanPanel } from "@/features/dashboard/components/MealPlanPanel";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createFileRoute("/meal-plan")({
  component: MealPlanPage,
});

function MealPlanPage() {
  const { recipes, customWeek, customSaved, resetCustomWeek } = useAppData();
  const navigate = useNavigate();

  return (
    <MealPlanPanel
      recipes={recipes}
      customWeek={customWeek}
      customSaved={customSaved}
      onNavigateToCustomBuilder={() => navigate({ to: "/shopping" })}
      onResetCustomWeek={resetCustomWeek}
    />
  );
}
