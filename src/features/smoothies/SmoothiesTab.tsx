import { SMOOTHIES_DATA } from "@/data/recipes";
import { InfoBanner } from "@/components/shared/InfoBanner";

import { SmoothieCard } from "./components/SmoothieCard";

export default function SmoothiesTab() {
  return (
    <div className="space-y-4">
      <InfoBanner>
        Tap any smoothie to view. Toggle between BC151 and Auto-iQ Duo inside.
      </InfoBanner>

      {SMOOTHIES_DATA.map((smoothie) => (
        <SmoothieCard key={smoothie.name} smoothie={smoothie} />
      ))}
    </div>
  );
}
