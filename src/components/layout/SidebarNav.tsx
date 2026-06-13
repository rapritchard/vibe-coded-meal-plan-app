import { Link, useRouterState } from "@tanstack/react-router";

import type { MealFilter } from "@/types";
import { cn } from "@/lib/utils";

import { NAV_GROUPS, isNavItemActive } from "./nav-config";

interface SidebarNavProps {
  /** Called after a nav item is chosen — used to close the mobile sheet. */
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { location } = useRouterState();
  const mealParam = (location.search as { meal?: MealFilter }).meal;

  return (
    <nav className="py-4">
      {NAV_GROUPS.map((group, i) => (
        <div
          key={group.label}
          className={cn(i > 0 && "mt-1 pt-1 border-t border-stone-100")}
        >
          <div className="px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = isNavItemActive(item, location.pathname, mealParam);
            return (
              <Link
                key={item.label}
                to={item.to}
                search={item.to === "/recipes" ? { meal: item.meal } : undefined}
                onClick={onNavigate}
                className={cn(
                  "block w-full text-left px-4 py-2 text-sm transition-colors border-l-2",
                  active
                    ? "bg-secondary text-foreground font-medium border-foreground"
                    : "text-stone-600 hover:bg-muted/60 hover:text-foreground border-transparent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
