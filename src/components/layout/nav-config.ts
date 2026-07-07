import type { MealFilter } from "@/types";

/**
 * A single sidebar entry. Most map to a route path; the Food quick-links all
 * point at /recipes but pre-apply a meal filter via the `meal` search param,
 * so they are equivalent input methods to the in-page FilterBar.
 */
export interface NavItem {
  label: string;
  to: string;
  /** Only set for the /recipes meal quick-links. */
  meal?: MealFilter;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Planning",
    items: [
      { label: "Overview", to: "/" },
      { label: "Meal Plan", to: "/meal-plan" },
    ],
  },
  {
    label: "Food",
    items: [
      { label: "Recipes", to: "/recipes" },
      { label: "Breakfast", to: "/recipes", meal: "breakfast" },
      { label: "Lunch", to: "/recipes", meal: "lunch" },
      { label: "Dinner", to: "/recipes", meal: "dinner" },
      { label: "Bakes & snacks", to: "/recipes", meal: "protein-bakes" },
      { label: "Smoothies", to: "/recipes", meal: "smoothie" },
      { label: "Snacks", to: "/recipes", meal: "snack" },
      { label: "Desserts", to: "/recipes", meal: "dessert" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Kitchen", to: "/kitchen" },
      { label: "Shopping", to: "/shopping" },
      { label: "Review", to: "/review" },
    ],
  },
];

/**
 * Active-state logic for a sidebar item given the current location. Handles the
 * /recipes quick-links specially: "Recipes" is active on a plain /recipes view,
 * while "Breakfast" etc. are active only when their meal filter is applied.
 */
export function isNavItemActive(
  item: NavItem,
  pathname: string,
  mealParam: MealFilter | undefined,
): boolean {
  if (item.to === "/") return pathname === "/";

  if (item.to === "/recipes") {
    if (!pathname.startsWith("/recipes")) return false;
    const current = mealParam ?? "all";
    // The bare "Recipes" link (no meal) is active when no meal filter is set.
    return (item.meal ?? "all") === current;
  }

  return pathname === item.to || pathname.startsWith(item.to + "/");
}

/** Human label for the current location, used as the mobile top-bar title. */
export function currentNavTitle(
  pathname: string,
  mealParam: MealFilter | undefined,
): string {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isNavItemActive(item, pathname, mealParam)) return item.label;
    }
  }
  return "Overview";
}
