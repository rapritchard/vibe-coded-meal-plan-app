import { Search, X } from "lucide-react";

import {
  ALL_MOODS,
  EFFORT_LABELS,
  type EffortLevel,
  type MealFilter,
  type Mood,
} from "@/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MEAL_OPTIONS: { value: MealFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snacks" },
  { value: "smoothie", label: "Smoothies" },
  { value: "dessert", label: "Desserts" },
];

const EFFORT_ORDER: EffortLevel[] = [
  "ready",
  "make-ahead",
  "quick-cook",
  "set-forget",
  "cook-tend",
];

interface FilterBarProps {
  // search
  query: string;
  onQueryChange: (q: string) => void;

  // meal (single-select; controlled by App via activeTab)
  activeMeal: MealFilter;
  onActiveMealChange: (m: MealFilter) => void;

  // mouth-feel (multi-select, OR within group)
  selectedMoods: ReadonlySet<Mood>;
  onToggleMood: (m: Mood) => void;

  // effort (multi-select, OR within group)
  selectedEffort: ReadonlySet<EffortLevel>;
  onToggleEffort: (e: EffortLevel) => void;

  // extras
  leftoversOnly: boolean;
  onLeftoversToggle: (v: boolean) => void;
  onTheGoOnly: boolean;
  onOnTheGoToggle: (v: boolean) => void;

  // result count
  totalCount: number;
  filteredCount: number;

  // clear all
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function FilterBar(props: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={props.query}
          onChange={(e) => props.onQueryChange(e.target.value)}
          placeholder="Search by name…"
          className="pl-9 pr-9 rounded-xl"
        />
        {props.query && (
          <button
            onClick={() => props.onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Meal */}
      <FilterGroup label="Meal">
        {MEAL_OPTIONS.map(({ value, label }) => (
          <Pill
            key={value}
            label={label}
            active={props.activeMeal === value}
            onClick={() => props.onActiveMealChange(value)}
          />
        ))}
      </FilterGroup>

      {/* Mouth-feel */}
      <FilterGroup label="Mouth-feel">
        {ALL_MOODS.map((mood) => (
          <Pill
            key={mood}
            label={mood}
            active={props.selectedMoods.has(mood)}
            onClick={() => props.onToggleMood(mood)}
          />
        ))}
      </FilterGroup>

      {/* Effort */}
      <FilterGroup label="Effort">
        {EFFORT_ORDER.map((effort) => (
          <Pill
            key={effort}
            label={EFFORT_LABELS[effort]}
            active={props.selectedEffort.has(effort)}
            onClick={() => props.onToggleEffort(effort)}
          />
        ))}
      </FilterGroup>

      {/* Extras */}
      <FilterGroup label="Extras">
        <Pill
          label="Makes leftovers"
          active={props.leftoversOnly}
          onClick={() => props.onLeftoversToggle(!props.leftoversOnly)}
        />
        <Pill
          label="Good for on the go"
          active={props.onTheGoOnly}
          onClick={() => props.onOnTheGoToggle(!props.onTheGoOnly)}
        />
      </FilterGroup>

      {/* Result summary + clear all */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>
          {props.filteredCount === props.totalCount
            ? `${props.totalCount} recipes`
            : `${props.filteredCount} of ${props.totalCount} recipes`}
        </span>
        {props.hasActiveFilters && (
          <button
            onClick={props.onClearAll}
            className="text-xs font-semibold text-foreground hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Pill({ label, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:border-stone-300 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
