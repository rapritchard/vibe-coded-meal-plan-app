import { ALL_MOODS, EFFORT_LABELS } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EFFORT_ORDER, MEAL_OPTIONS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

import type { FilterControlsProps } from "./filter-types";

interface MobileFilterSheetProps extends FilterControlsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filteredCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

/** Mobile presentation: a bottom sheet of tappable filter pills. */
export function MobileFilterSheet(props: MobileFilterSheetProps) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
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
            <FilterPill
              label="Hormone support"
              active={props.hormoneSupportOnly}
              onClick={() =>
                props.onHormoneSupportToggle(!props.hormoneSupportOnly)
              }
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
            onClick={() => props.onOpenChange(false)}
            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Show {props.filteredCount}{" "}
            {props.filteredCount === 1 ? "recipe" : "recipes"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Mobile filter group + pill ───────────────────────────────────────────────

function MobileFilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm font-medium px-3 py-1.5 rounded-full border transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-border hover:border-ink/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
