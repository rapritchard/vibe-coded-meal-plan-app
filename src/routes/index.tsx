import { createFileRoute } from "@tanstack/react-router";

import { FlavourToolsPanel } from "@/features/dashboard/components/FlavourToolsPanel";
import { PrinciplesPanel } from "@/features/dashboard/components/PrinciplesPanel";
import { SafeFoodsPanel } from "@/features/dashboard/components/SafeFoodsPanel";
import { TimeKeyPanel } from "@/features/dashboard/components/TimeKeyPanel";

export const Route = createFileRoute("/")({
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <div className="space-y-6">
      <TimeKeyPanel />
      <SafeFoodsPanel />
      <PrinciplesPanel />
      <FlavourToolsPanel />
    </div>
  );
}
