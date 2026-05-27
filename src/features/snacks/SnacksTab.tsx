import { SNACKS_DATA } from "@/data/recipes";
import { InfoBanner } from "@/components/shared/InfoBanner";

import { SnackCard } from "./components/SnackCard";

export default function SnacksTab() {
  return (
    <div className="space-y-4">
      <InfoBanner>
        All Phase 1 safe. Banana daily. Mini oat pots for medication mornings.
      </InfoBanner>

      {SNACKS_DATA.map((snack) => (
        <SnackCard key={snack.name} snack={snack} />
      ))}
    </div>
  );
}
