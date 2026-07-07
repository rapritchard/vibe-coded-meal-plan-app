import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { ALL_MOODS, EFFORT_LABELS } from "@/types";
import { Input } from "@/components/ui/input";
import { EFFORT_ORDER, MEAL_OPTIONS } from "@/lib/taxonomy";

import { DesktopFilters } from "./filters/DesktopFilters";
import { MobileFilterSheet } from "./filters/MobileFilterSheet";
import type { Chip, FilterControlsProps } from "./filters/filter-types";

interface FilterBarProps extends FilterControlsProps {
  query: string;
  onQueryChange: (q: string) => void;
  totalCount: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function FilterBar(props: FilterBarProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Derive the active-filter chips once; the desktop dropdowns show them
  // per-dimension and the mobile strip shows them all together.
  const mealChips: Chip[] =
    props.activeMeal === "all"
      ? []
      : [
          {
            label:
              MEAL_OPTIONS.find((o) => o.value === props.activeMeal)?.label ??
              "",
            onRemove: () => props.onActiveMealChange("all"),
          },
        ];

  const moodChips: Chip[] = ALL_MOODS.filter((m) =>
    props.selectedMoods.has(m),
  ).map((m) => ({ label: m, onRemove: () => props.onToggleMood(m) }));

  const effortChips: Chip[] = EFFORT_ORDER.filter((e) =>
    props.selectedEffort.has(e),
  ).map((e) => ({
    label: EFFORT_LABELS[e],
    onRemove: () => props.onToggleEffort(e),
  }));

  const extrasChips: Chip[] = [
    ...(props.leftoversOnly
      ? [
          {
            label: "Makes leftovers",
            onRemove: () => props.onLeftoversToggle(false),
          },
        ]
      : []),
    ...(props.onTheGoOnly
      ? [
          {
            label: "Good for on the go",
            onRemove: () => props.onOnTheGoToggle(false),
          },
        ]
      : []),
    ...(props.hormoneSupportOnly
      ? [
          {
            label: "Hormone support",
            onRemove: () => props.onHormoneSupportToggle(false),
          },
        ]
      : []),
  ];

  const allChips = [...mealChips, ...moodChips, ...effortChips, ...extrasChips];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={props.query}
          onChange={(e) => props.onQueryChange(e.target.value)}
          placeholder="Search by name…"
          className="pl-9 pr-9 rounded-lg"
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

      <DesktopFilters
        {...props}
        mealChips={mealChips}
        moodChips={moodChips}
        effortChips={effortChips}
        extrasChips={extrasChips}
      />

      {/* Mobile: single Filters trigger + horizontal chip strip */}
      <div className="sm:hidden space-y-2">
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:border-ink/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </span>
          {allChips.length > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {allChips.length}
            </span>
          )}
        </button>

        {allChips.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {allChips.map((chip) => (
              <span
                key={chip.label}
                className="flex items-center gap-1 shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-primary text-primary-foreground"
              >
                {chip.label}
                <button
                  onClick={chip.onRemove}
                  aria-label={`Remove ${chip.label}`}
                  className="hover:opacity-70"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <MobileFilterSheet
        {...props}
        open={mobileSheetOpen}
        onOpenChange={setMobileSheetOpen}
      />

      {/* Result summary + clear all */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
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
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
