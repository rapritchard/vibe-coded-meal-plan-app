import { Search, X } from "lucide-react";

import type { MealCategory } from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type FilterCategory = MealCategory | "all";

const FILTER_OPTIONS: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

interface FilterBarProps {
  active: FilterCategory;
  query: string;
  onCategoryChange: (c: FilterCategory) => void;
  onQueryChange: (q: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({
  active,
  query,
  onCategoryChange,
  onQueryChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onCategoryChange(value)}
            className={cn(
              "flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-colors",
              active === value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-stone-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name or mood…"
          className="pl-9 pr-9 rounded-xl"
        />
        {query && (
          <button
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        {filteredCount === totalCount
          ? `${totalCount} recipes`
          : `${filteredCount} of ${totalCount} recipes`}
      </div>
    </div>
  );
}
