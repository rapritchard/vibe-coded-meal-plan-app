import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import {
  ALL_MOODS,
  EFFORT_LABELS,
  type EffortLevel,
  type MealFilter,
  type Mood,
  type RecipeCategoryKind,
} from "@/types";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const MEAL_OPTIONS: { value: RecipeCategoryKind; label: string }[] = [
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
  query: string;
  onQueryChange: (q: string) => void;

  activeMeal: MealFilter;
  onActiveMealChange: (m: MealFilter) => void;

  selectedMoods: ReadonlySet<Mood>;
  onToggleMood: (m: Mood) => void;

  selectedEffort: ReadonlySet<EffortLevel>;
  onToggleEffort: (e: EffortLevel) => void;

  leftoversOnly: boolean;
  onLeftoversToggle: (v: boolean) => void;
  onTheGoOnly: boolean;
  onOnTheGoToggle: (v: boolean) => void;

  totalCount: number;
  filteredCount: number;

  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function FilterBar(props: FilterBarProps) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const mealChips =
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

  const moodChips = ALL_MOODS.filter((m) => props.selectedMoods.has(m)).map(
    (m) => ({ label: m, onRemove: () => props.onToggleMood(m) }),
  );

  const effortChips = EFFORT_ORDER.filter((e) =>
    props.selectedEffort.has(e),
  ).map((e) => ({
    label: EFFORT_LABELS[e],
    onRemove: () => props.onToggleEffort(e),
  }));

  const extrasChips = [
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
  ];

  const allChips = [...mealChips, ...moodChips, ...effortChips, ...extrasChips];
  const totalChipCount = allChips.length;

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

      {/* Desktop: grid of four filter dropdowns */}
      <div className="hidden sm:grid grid-cols-4 gap-2 items-start">
        <MultiSelect label="Meal" chips={mealChips}>
          {MEAL_OPTIONS.map(({ value, label }) => (
            <DropdownItem
              key={value}
              label={label}
              checked={props.activeMeal === value}
              onToggle={() =>
                props.onActiveMealChange(
                  props.activeMeal === value ? "all" : value,
                )
              }
            />
          ))}
        </MultiSelect>

        <MultiSelect label="Mouth-feel" chips={moodChips}>
          {ALL_MOODS.map((mood) => (
            <DropdownItem
              key={mood}
              label={mood}
              checked={props.selectedMoods.has(mood)}
              onToggle={() => props.onToggleMood(mood)}
            />
          ))}
        </MultiSelect>

        <MultiSelect label="Effort" chips={effortChips}>
          {EFFORT_ORDER.map((effort) => (
            <DropdownItem
              key={effort}
              label={EFFORT_LABELS[effort]}
              checked={props.selectedEffort.has(effort)}
              onToggle={() => props.onToggleEffort(effort)}
            />
          ))}
        </MultiSelect>

        <MultiSelect label="Extras" chips={extrasChips}>
          <DropdownItem
            label="Makes leftovers"
            checked={props.leftoversOnly}
            onToggle={() => props.onLeftoversToggle(!props.leftoversOnly)}
          />
          <DropdownItem
            label="Good for on the go"
            checked={props.onTheGoOnly}
            onToggle={() => props.onOnTheGoToggle(!props.onTheGoOnly)}
          />
        </MultiSelect>
      </div>

      {/* Mobile: single Filters trigger + horizontal chip strip */}
      <div className="sm:hidden space-y-2">
        <button
          onClick={() => setMobileSheetOpen(true)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:border-stone-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </span>
          {totalChipCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {totalChipCount}
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

      {/* Mobile filter sheet */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex flex-col p-0 gap-0 max-h-[85vh] rounded-t-2xl"
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            <MobileFilterGroup label="Meal">
              {MEAL_OPTIONS.map(({ value, label }) => (
                <FilterPill
                  key={value}
                  label={label}
                  active={props.activeMeal === value}
                  onClick={() =>
                    props.onActiveMealChange(
                      props.activeMeal === value ? "all" : value,
                    )
                  }
                />
              ))}
            </MobileFilterGroup>

            <MobileFilterGroup label="Mouth-feel">
              {ALL_MOODS.map((mood) => (
                <FilterPill
                  key={mood}
                  label={mood}
                  active={props.selectedMoods.has(mood)}
                  onClick={() => props.onToggleMood(mood)}
                />
              ))}
            </MobileFilterGroup>

            <MobileFilterGroup label="Effort">
              {EFFORT_ORDER.map((effort) => (
                <FilterPill
                  key={effort}
                  label={EFFORT_LABELS[effort]}
                  active={props.selectedEffort.has(effort)}
                  onClick={() => props.onToggleEffort(effort)}
                />
              ))}
            </MobileFilterGroup>

            <MobileFilterGroup label="Extras">
              <FilterPill
                label="Makes leftovers"
                active={props.leftoversOnly}
                onClick={() => props.onLeftoversToggle(!props.leftoversOnly)}
              />
              <FilterPill
                label="Good for on the go"
                active={props.onTheGoOnly}
                onClick={() => props.onOnTheGoToggle(!props.onTheGoOnly)}
              />
            </MobileFilterGroup>
          </div>

          <div className="flex gap-2 px-5 py-3 border-t border-border bg-background">
            <button
              onClick={props.onClearAll}
              disabled={!props.hasActiveFilters}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              onClick={() => setMobileSheetOpen(false)}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Show {props.filteredCount}{" "}
              {props.filteredCount === 1 ? "recipe" : "recipes"}
            </button>
          </div>
        </SheetContent>
      </Sheet>

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

// ── MultiSelect: unified bordered box with chips + dropdown ───────────────────

interface Chip {
  label: string;
  onRemove: () => void;
}

interface MultiSelectProps {
  label: string;
  chips: Chip[];
  children: React.ReactNode;
}

function MultiSelect({ label, chips, children }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const hasChips = chips.length > 0;

  return (
    <div ref={ref} className="relative">
      {/* Box */}
      <div
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-start gap-1 min-h-[34px] w-full px-2.5 py-1.5 border cursor-pointer transition-colors",
          open
            ? "rounded-t-lg border-stone-400 border-b-transparent"
            : "rounded-lg border-border hover:border-stone-300",
        )}
      >
        {/* Chip area grows to fill available width */}
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {!hasChips && (
            <span className="text-xs font-medium text-muted-foreground leading-5">
              {label}
            </span>
          )}
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded bg-primary text-primary-foreground leading-4"
            >
              {chip.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  chip.onRemove();
                }}
                aria-label={`Remove ${chip.label}`}
                className="hover:opacity-70"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        {/* Chevron always pinned to the top-right */}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-background border border-stone-400 border-t-0 rounded-b-lg shadow-md py-1">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Mobile filter group + pill (for the bottom sheet) ────────────────────────

interface MobileFilterGroupProps {
  label: string;
  children: React.ReactNode;
}

function MobileFilterGroup({ label, children }: MobileFilterGroupProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm font-medium px-3 py-1.5 rounded-full border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:border-stone-300 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

// ── Dropdown item ─────────────────────────────────────────────────────────────

interface DropdownItemProps {
  label: string;
  checked: boolean;
  onToggle: () => void;
}

function DropdownItem({ label, checked, onToggle }: DropdownItemProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2.5 w-full px-3 py-1.5 text-xs font-medium text-left hover:bg-muted/60 transition-colors"
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 rounded-sm border items-center justify-center transition-colors",
          checked
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border bg-background",
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 10 10"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <polyline points="1.5,5 4,7.5 8.5,2" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}
