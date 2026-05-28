import type { MealType, Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { RecipeTimeTag } from "@/components/shared/RecipeTimeTag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE_VALUE = "__none__";

interface MealSelectorProps {
  day: string;
  type: MealType;
  value: string;
  recipes: Recipe[];
  onView: (recipe: Recipe) => void;
  onChange: (day: string, type: MealType, value: string) => void;
}

export function MealSelector({
  day,
  type,
  value,
  recipes,
  onView,
  onChange,
}: MealSelectorProps) {
  const options = recipes
    .filter(
      (r) =>
        r.category === type || (type === "lunch" && r.category === "dinner"),
    )
    .map((r) => r.name);

  const selected = recipes.find((r) => r.name === value) ?? null;

  function handleValueChange(next: string) {
    onChange(day, type, next === NONE_VALUE ? "" : next);
  }

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        {type}
      </div>
      <div className="flex gap-2 items-center">
        <Select value={value || NONE_VALUE} onValueChange={handleValueChange}>
          <SelectTrigger className="flex-1 rounded-xl">
            <SelectValue placeholder="choose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>choose</SelectItem>
            {options.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <Button
            size="sm"
            onClick={() => onView(selected)}
            className="flex-shrink-0 rounded-full px-2 py-1.5 h-auto text-xs"
          >
            Recipe
          </Button>
        )}
      </div>
      {selected && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <RecipeTimeTag
            icon={selected.timeKey}
            leadTime={selected.leadTime}
          />
          {selected.isBatch && (
            <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
              Batch — suggests leftover next day
            </span>
          )}
        </div>
      )}
    </div>
  );
}
