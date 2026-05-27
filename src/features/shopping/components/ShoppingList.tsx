import { useCallback, useState } from "react";

import type { ShoppingCategory } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ShoppingListProps {
  items: ShoppingCategory;
}

export function ShoppingList({ items }: ShoppingListProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = useCallback((key: string) => {
    setChecked((c) => ({ ...c, [key]: !c[key] }));
  }, []);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = Object.values(items).flat().length;
  const progressValue = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-5">
      {totalCount > 0 && (
        <div className="flex items-center gap-3">
          <Progress value={progressValue} className="flex-1" />
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {checkedCount}/{totalCount}
          </span>
        </div>
      )}

      {Object.entries(items).map(([cat, list]) => (
        <div key={cat}>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
            {cat}
          </div>
          <div className="space-y-1.5">
            {list.map((item) => {
              const key = `${cat}:${item}`;
              const isChecked = !!checked[key];
              return (
                <label
                  key={item}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggle(key)}
                  />
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      isChecked
                        ? "line-through text-stone-300"
                        : "text-stone-700",
                    )}
                  >
                    {item}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
