import { DESSERTS_DATA } from "@/data/recipes";
import { InfoBanner } from "@/components/shared/InfoBanner";

import { DessertCard } from "./components/DessertCard";

export default function DessertsTab() {
  return (
    <div className="space-y-4">
      <InfoBanner>
        Keep the rest of the day clean fat-wise when having dessert.
      </InfoBanner>

      {DESSERTS_DATA.map((dessert) => (
        <DessertCard key={dessert.name} dessert={dessert} />
      ))}
    </div>
  );
}
