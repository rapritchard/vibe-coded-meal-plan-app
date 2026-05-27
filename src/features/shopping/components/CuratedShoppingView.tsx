import { SHOPPING_LISTS } from "@/data/shoppingLists";
import type { WeekName } from "@/data/shoppingLists";

import { ShoppingList } from "./ShoppingList";

interface CuratedShoppingViewProps {
  week: Exclude<WeekName, "Custom">;
}

export function CuratedShoppingView({ week }: CuratedShoppingViewProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground italic">
        All available on Ocado.
      </p>
      <ShoppingList key={week} items={SHOPPING_LISTS[week]} />
    </div>
  );
}
