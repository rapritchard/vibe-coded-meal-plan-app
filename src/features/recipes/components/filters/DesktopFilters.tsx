import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { ALL_MOODS, EFFORT_LABELS } from "@/types";
import { EFFORT_ORDER, MEAL_OPTIONS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

import type { Chip, FilterControlsProps } from "./filter-types";

interface DesktopFiltersProps extends FilterControlsProps {
  mealChips: Chip[];
  moodChips: Chip[];
  effortChips: Chip[];
  extrasChips: Chip[];
}

/** Desktop presentation: a grid of four chip-bearing dropdowns. */
export function DesktopFilters(props: DesktopFiltersProps) {
  return (
    <div className="hidden sm:grid grid-cols-4 gap-2 items-start">
      <MultiSelect label="Meal" chips={props.mealChips}>
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

      <MultiSelect label="Mouth-feel" chips={props.moodChips}>
        {ALL_MOODS.map((mood) => (
          <DropdownItem
            key={mood}
            label={mood}
            checked={props.selectedMoods.has(mood)}
            onToggle={() => props.onToggleMood(mood)}
          />
        ))}
      </MultiSelect>

      <MultiSelect label="Effort" chips={props.effortChips}>
        {EFFORT_ORDER.map((effort) => (
          <DropdownItem
            key={effort}
            label={EFFORT_LABELS[effort]}
            checked={props.selectedEffort.has(effort)}
            onToggle={() => props.onToggleEffort(effort)}
          />
        ))}
      </MultiSelect>

      <MultiSelect label="Extras" chips={props.extrasChips}>
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
        <DropdownItem
          label="Hormone support"
          checked={props.hormoneSupportOnly}
          onToggle={() => props.onHormoneSupportToggle(!props.hormoneSupportOnly)}
        />
      </MultiSelect>
    </div>
  );
}

// ── MultiSelect: bordered box with chips + click-away dropdown ────────────────

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
      <div
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-start gap-1 min-h-[34px] w-full px-2.5 py-1.5 border cursor-pointer transition-colors",
          open
            ? "rounded-t-lg border-foreground/40 border-b-transparent"
            : "rounded-lg border-border hover:border-ink/30",
        )}
      >
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
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-background border border-foreground/40 border-t-0 rounded-b-lg shadow-md py-1">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Dropdown item (checkbox row) ─────────────────────────────────────────────

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
