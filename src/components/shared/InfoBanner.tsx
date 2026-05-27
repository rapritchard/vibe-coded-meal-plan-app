import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

interface InfoBannerProps {
  children: ReactNode;
}

export function InfoBanner({ children }: InfoBannerProps) {
  return (
    <Card className="p-4 text-sm text-muted-foreground border-stone-100">
      {children}
    </Card>
  );
}
