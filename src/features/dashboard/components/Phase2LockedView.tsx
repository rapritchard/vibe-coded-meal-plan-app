import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Phase2LockedViewProps {
  onUnlock: () => void;
}

export function Phase2LockedView({ onUnlock }: Phase2LockedViewProps) {
  return (
    <Card className="rounded-2xl border-stone-100 p-8 text-center space-y-4">
      <Lock className="h-10 w-10 mx-auto text-stone-400" />
      <div className="font-serif font-bold text-card-foreground text-lg">
        Phase 2 recipes
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        These recipes reintroduce higher fat, more complex proteins, nuts,
        seeds, tahini, chilli and richer sauces. Only unlock when your gut is
        settled — usually 2-4 weeks post-op.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 text-left leading-relaxed">
        <div className="font-bold mb-1">Before unlocking, check:</div>
        <div>+ No pain after Phase 1 meals</div>
        <div>+ Digestion is settling and regular</div>
        <div>+ You can tolerate a full Phase 1 meal without discomfort</div>
        <div>+ Ideally discuss with your GP or dietitian first</div>
      </div>
      <Button
        onClick={onUnlock}
        className="w-full rounded-xl py-3 h-auto font-bold text-sm"
      >
        I am ready — unlock Phase 2
      </Button>
    </Card>
  );
}
