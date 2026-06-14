import { createFileRoute } from "@tanstack/react-router";

import { TimeKeyPanel } from "@/features/dashboard/components/TimeKeyPanel";

export const Route = createFileRoute("/")({
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <div className="space-y-6">
      <TimeKeyPanel />
    </div>
  );
}
