import type { CustomWeek, Recipe } from "@/types";

import { FlavourToolsPanel } from "./components/FlavourToolsPanel";
import { MealPlanPanel } from "./components/MealPlanPanel";
import { Phase1ExplainerPanel } from "./components/Phase1ExplainerPanel";
import { PrinciplesPanel } from "./components/PrinciplesPanel";
import { SafeFoodsPanel } from "./components/SafeFoodsPanel";
import { TimeKeyPanel } from "./components/TimeKeyPanel";

export type DashboardView = "Overview" | "Meal Plan";

export interface DashboardTabProps {
  view: DashboardView;
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  onNavigateToCustomBuilder: () => void;
  onResetCustomWeek: () => Promise<void>;
}

export default function DashboardTab({
  view,
  recipes,
  customWeek,
  customSaved,
  onNavigateToCustomBuilder,
  onResetCustomWeek,
}: DashboardTabProps) {
  if (view === "Overview") {
    return (
      <div className="space-y-6">
        <TimeKeyPanel />
        <SafeFoodsPanel />
        <Phase1ExplainerPanel />
        <PrinciplesPanel />
        <FlavourToolsPanel />
      </div>
    );
  }

  return (
    <MealPlanPanel
      recipes={recipes}
      customWeek={customWeek}
      customSaved={customSaved}
      onNavigateToCustomBuilder={onNavigateToCustomBuilder}
      onResetCustomWeek={onResetCustomWeek}
    />
  );
}
