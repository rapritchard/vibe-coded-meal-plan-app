import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { SidebarNav } from "./SidebarNav";
import type { TabId } from "./nav-config";

interface SidebarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({
  active,
  onChange,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  function handleSelect(tab: TabId) {
    onChange(tab);
    onMobileOpenChange(false);
  }

  return (
    <>
      <aside className="hidden md:block w-48 flex-shrink-0 sticky top-0 self-start h-screen overflow-y-auto border-r border-border bg-card">
        <SidebarNav active={active} onSelect={handleSelect} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="md:hidden w-64 sm:max-w-xs p-0 bg-card"
        >
          <SheetTitle className="px-4 py-4 text-sm font-semibold text-stone-700 border-b border-border">
            Navigation
          </SheetTitle>
          <SidebarNav active={active} onSelect={handleSelect} />
        </SheetContent>
      </Sheet>
    </>
  );
}
