import { COSTCO_PHASE2_ITEMS } from "@/data/recipes";

export function CostcoPanel() {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
      <div className="font-bold text-indigo-900 mb-2 text-sm">
        Phase 2 — Costco in-store
      </div>
      <div className="text-xs text-indigo-700 space-y-1">
        {COSTCO_PHASE2_ITEMS.map((item) => (
          <div key={item}>+ {item}</div>
        ))}
      </div>
    </div>
  );
}
