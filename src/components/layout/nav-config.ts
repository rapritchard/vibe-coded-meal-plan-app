export type TabId =
  | "Overview"
  | "Meal Plan"
  | "Recipes"
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Smoothies"
  | "Snacks"
  | "Desserts"
  | "Kitchen"
  | "Shopping"
  | "Review";

export const DASHBOARD_TABS: ReadonlySet<TabId> = new Set([
  "Overview",
  "Meal Plan",
]);

/**
 * Sidebar entries that open the Recipes catalog with a meal-type filter
 * pre-applied. All other Food entries are quick-link shortcuts onto the
 * single unified Recipes view.
 */
export const RECIPE_QUICK_LINKS: ReadonlySet<TabId> = new Set([
  "Breakfast",
  "Lunch",
  "Dinner",
  "Smoothies",
  "Snacks",
  "Desserts",
]);

export interface NavGroup {
  label: string;
  tabs: TabId[];
}

export const NAV_GROUPS: NavGroup[] = [
  { label: "Planning", tabs: ["Overview", "Meal Plan"] },
  {
    label: "Food",
    tabs: [
      "Recipes",
      "Breakfast",
      "Lunch",
      "Dinner",
      "Smoothies",
      "Snacks",
      "Desserts",
    ],
  },
  { label: "Resources", tabs: ["Kitchen", "Shopping", "Review"] },
];
