import type { EffortLevel, MealFilter, Mood } from "@/types";

/** The filter values + their toggle handlers, shared by the desktop dropdowns
 * and the mobile bottom-sheet (two presentations of the same controls). */
export interface FilterControlsProps {
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
  hormoneSupportOnly: boolean;
  onHormoneSupportToggle: (v: boolean) => void;
}

/** A removable filter chip. */
export interface Chip {
  label: string;
  onRemove: () => void;
}
