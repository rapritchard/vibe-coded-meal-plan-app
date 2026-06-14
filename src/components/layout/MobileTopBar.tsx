import { Menu } from "lucide-react";

import { AuthButton } from "./AuthButton";

interface MobileTopBarProps {
  title: string;
  onMenuOpen: () => void;
}

export function MobileTopBar({ title, onMenuOpen }: MobileTopBarProps) {
  return (
    <div className="md:hidden sticky top-0 z-40 flex items-center gap-3 h-14 px-4 bg-background/95 backdrop-blur border-b border-border">
      <button
        onClick={onMenuOpen}
        className="p-1.5 -ml-1.5 text-foreground hover:text-muted-foreground transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>
      <h2 className="font-semibold text-sm text-foreground truncate flex-1">
        {title}
      </h2>
      <AuthButton variant="light" />
    </div>
  );
}
