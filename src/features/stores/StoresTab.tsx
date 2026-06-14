import { KITCHEN_TOOLS } from "@/data/recipes";

import { CategorySection } from "./components/CategorySection";

export default function StoresTab() {
  return (
    <div className="space-y-6">
      {Object.entries(KITCHEN_TOOLS).map(([category, tools]) => (
        <CategorySection
          key={category}
          category={category}
          tools={tools}
          defaultOpen={false}
        />
      ))}
    </div>
  );
}
