import type { CustomWeek, Recipe } from "@/types";
import { savePhase2Unlocked } from "@/data/shoppingLists";

import { FlavourToolsPanel } from "./components/FlavourToolsPanel";
import { MealPlanPanel } from "./components/MealPlanPanel";
import { Phase1ExplainerPanel } from "./components/Phase1ExplainerPanel";
import { Phase2Panel } from "./components/Phase2Panel";
import { PrinciplesPanel } from "./components/PrinciplesPanel";
import { SafeFoodsPanel } from "./components/SafeFoodsPanel";
import { TimeKeyPanel } from "./components/TimeKeyPanel";

export type DashboardView = "Overview" | "Meal Plan" | "Phase 2";

export interface DashboardTabProps {
  view: DashboardView;
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  phase2Unlocked: boolean;
  onUnlockPhase2: () => Promise<void>;
  onLockPhase2: () => Promise<void>;
  onNavigateToCustomBuilder: () => void;
  onResetCustomWeek: () => Promise<void>;
}

export default function DashboardTab({
  view,
  recipes,
  customWeek,
  customSaved,
  phase2Unlocked,
  onUnlockPhase2,
  onLockPhase2,
  onNavigateToCustomBuilder,
  onResetCustomWeek,
}: DashboardTabProps) {
  const handleUnlock = async () => {
    await savePhase2Unlocked(true);
    await onUnlockPhase2();
  };

  const handleLock = async () => {
    await savePhase2Unlocked(false);
    await onLockPhase2();
  };

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

  if (view === "Phase 2") {
    return (
      <Phase2Panel
        phase2Unlocked={phase2Unlocked}
        onUnlock={handleUnlock}
        onLock={handleLock}
      />
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
