import type { Phase2Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { SEED_PHASE2 } from "@/data/recipes";

import { Phase2LockedView } from "./Phase2LockedView";
import { Phase2RecipeCard } from "./Phase2RecipeCard";

interface Phase2PanelProps {
  phase2Unlocked: boolean;
  onUnlock: () => void;
  onLock: () => void;
}

export function Phase2Panel({
  phase2Unlocked,
  onUnlock,
  onLock,
}: Phase2PanelProps) {
  if (!phase2Unlocked) {
    return <Phase2LockedView onUnlock={onUnlock} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
        Phase 2 unlocked. Introduce these one at a time — wait 2-3 days between
        new recipes to identify anything that does not agree with you.
      </div>
      {SEED_PHASE2.map((r: Phase2Recipe) => (
        <Phase2RecipeCard key={r.id} recipe={r} />
      ))}
      <Button
        variant="outline"
        onClick={onLock}
        className="w-full rounded-xl py-2.5 h-auto border-2 border-border text-muted-foreground text-sm font-semibold hover:border-stone-300"
      >
        Lock Phase 2 again
      </Button>
    </div>
  );
}
