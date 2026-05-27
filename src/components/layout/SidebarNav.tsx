import { cn } from "@/lib/utils";

import { NAV_GROUPS, type TabId } from "./nav-config";

interface SidebarNavProps {
  active: TabId;
  onSelect: (tab: TabId) => void;
}

export function SidebarNav({ active, onSelect }: SidebarNavProps) {
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
          {group.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onSelect(tab)}
              className={cn(
                "w-full text-left px-4 py-2 text-sm transition-colors border-l-2",
                active === tab
                  ? "bg-secondary text-foreground font-medium border-foreground"
                  : "text-stone-600 hover:bg-muted/60 hover:text-foreground border-transparent",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}
