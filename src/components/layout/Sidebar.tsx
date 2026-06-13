import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { SidebarNav } from "./SidebarNav";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  return (
    <>
      <aside className="hidden md:block w-48 flex-shrink-0 sticky top-0 self-start h-screen overflow-y-auto border-r border-border bg-card">
        <SidebarNav />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="md:hidden w-64 sm:max-w-xs p-0 bg-card"
        >
          <SheetTitle className="px-4 py-4 text-sm font-semibold text-stone-700 border-b border-border">
            Navigation
          </SheetTitle>
          <SidebarNav onNavigate={() => onMobileOpenChange(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
