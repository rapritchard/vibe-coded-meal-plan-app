import { useState } from "react";
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";

import type { MealFilter } from "@/types";
import { AppHeader } from "@/components/layout/AppHeader";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { currentNavTitle } from "@/components/layout/nav-config";
import { useAppData } from "@/hooks/use-app-data";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { ready } = useAppData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { location } = useRouterState();
  const mealParam = (location.search as { meal?: MealFilter }).meal;

  if (!ready) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background">
      <MobileTopBar
        title={currentNavTitle(location.pathname, mealParam)}
        onMenuOpen={() => setSidebarOpen(true)}
      />
      <AppHeader />

      <div className="flex">
        <Sidebar mobileOpen={sidebarOpen} onMobileOpenChange={setSidebarOpen} />

        <main className="flex-1 min-w-0 px-6 py-6 space-y-5 max-w-4xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
