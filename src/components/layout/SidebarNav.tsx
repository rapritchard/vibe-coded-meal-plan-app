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
    <nav className="py-6">
      {NAV_GROUPS.map((group, i) => (
        <div
          key={group.label}
          className={cn("px-4", i > 0 && "mt-6 pt-6 border-t border-border")}
        >
          <div className="kicker mb-2 flex items-center gap-2 text-muted-foreground">
            <span className="text-persimmon">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{group.label}</span>
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
                  "group flex items-center gap-2 w-full text-left -mx-1 px-1 py-1.5 text-[0.95rem] transition-colors",
                  active
                    ? "font-serif font-medium text-persimmon"
                    : "text-foreground/65 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rotate-45 transition-colors",
                    active
                      ? "bg-persimmon"
                      : "bg-transparent group-hover:bg-ink/30",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
