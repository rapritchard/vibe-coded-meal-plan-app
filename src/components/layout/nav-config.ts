export type TabId =
  | "Overview"
  | "Meal Plan"
  | "Recipes"
  | "Phase 2"
  | "Smoothies"
  | "Snacks"
  | "Desserts"
  | "Kitchen"
  | "Shopping";

export const DASHBOARD_TABS: ReadonlySet<TabId> = new Set([
  "Overview",
  "Meal Plan",
  "Phase 2",
]);

export interface NavGroup {
  label: string;
  tabs: TabId[];
}

export const NAV_GROUPS: NavGroup[] = [
  { label: "Planning", tabs: ["Overview", "Meal Plan", "Phase 2"] },
  { label: "Food", tabs: ["Recipes", "Smoothies", "Snacks", "Desserts"] },
  { label: "Resources", tabs: ["Kitchen", "Shopping"] },
];
