import { KITCHEN_TOOLS } from "@/data/recipes";

import { CategorySection } from "./components/CategorySection";
import { CostcoPanel } from "./components/CostcoPanel";

export default function StoresTab() {
  return (
    <div className="space-y-6">
      {Object.entries(KITCHEN_TOOLS).map(([category, tools], index) => (
        <CategorySection
          key={category}
          category={category}
          tools={tools}
          defaultOpen={index < 2}
        />
      ))}

      <CostcoPanel />
    </div>
  );
}
