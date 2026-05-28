import { useCallback, useEffect, useState } from "react";

import type { AnyRecipe, CustomWeek, Recipe, ShoppingCategory } from "@/types";
import {
  createEmptyWeek,
  generateShoppingList,
  loadCustomWeek,
  loadPhase2Unlocked,
  loadRecipes,
  savePhase2Unlocked,
} from "@/data/shoppingLists";
import type { WeekName } from "@/data/shoppingLists";
import {
  DESSERTS_DATA,
  SMOOTHIES_DATA,
  SNACKS_DATA,
} from "@/data/recipes";

import { AppHeader } from "@/components/layout/AppHeader";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  DASHBOARD_TABS,
  RECIPE_QUICK_LINKS,
  type TabId,
} from "@/components/layout/nav-config";
import type { MealFilter } from "@/types";

import DashboardTab, {
  type DashboardView,
} from "@/features/dashboard/DashboardTab";
import RecipeTab from "@/features/recipes/RecipeTab";
import ReviewTab from "@/features/review/ReviewTab";
import ShoppingTab from "@/features/shopping/ShoppingTab";
import StoresTab from "@/features/stores/StoresTab";

export default function App() {
  const [ready, setReady] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [customWeek, setCustomWeek] = useState<CustomWeek>(createEmptyWeek());
  const [customSaved, setCustomSaved] = useState(false);
  const [customShoppingList, setCustomShoppingList] =
    useState<ShoppingCategory | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("Overview");
  const [shoppingActiveWeek, setShoppingActiveWeek] =
    useState<WeekName>("Week A");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [r, cw, p2] = await Promise.all([
        loadRecipes(),
        loadCustomWeek(),
        loadPhase2Unlocked(),
      ]);
      setRecipes(r);
      setCustomWeek(cw);
      setPhase2Unlocked(p2);

      const hasData = Object.values(cw).some((d) =>
        Object.values(d).some((v) => v),
      );
      if (hasData) {
        setCustomSaved(true);
        setCustomShoppingList(generateShoppingList(cw, r));
      }

      setReady(true);
    })();
  }, []);

  const handleSaveCustomWeek = useCallback(
    async (week: CustomWeek) => {
      setCustomShoppingList(generateShoppingList(week, recipes));
      setCustomSaved(true);
    },
    [recipes],
  );

  const handleUnlockPhase2 = useCallback(async () => {
    await savePhase2Unlocked(true);
    setPhase2Unlocked(true);
  }, []);

  const handleLockPhase2 = useCallback(async () => {
    await savePhase2Unlocked(false);
    setPhase2Unlocked(false);
  }, []);

  const handleNavigateToCustomBuilder = useCallback(() => {
    setShoppingActiveWeek("Custom");
    setActiveTab("Shopping");
  }, []);

  if (!ready) return <LoadingScreen />;

  const isDashboardTab = DASHBOARD_TABS.has(activeTab);
  const isRecipeMode =
    activeTab === "Recipes" || RECIPE_QUICK_LINKS.has(activeTab);

  // Combined unified catalog. Recipe[] + smoothies + snacks + desserts.
  const allItems: AnyRecipe[] = [
    ...recipes,
    ...SMOOTHIES_DATA,
    ...SNACKS_DATA,
    ...DESSERTS_DATA,
  ];

  // Map activeTab ↔ meal filter so the sidebar and the FilterBar meal pills
  // are equivalent input methods to the same state.
  const activeMeal: MealFilter =
    activeTab === "Breakfast"
      ? "breakfast"
      : activeTab === "Lunch"
        ? "lunch"
        : activeTab === "Dinner"
          ? "dinner"
          : activeTab === "Smoothies"
            ? "smoothie"
            : activeTab === "Snacks"
              ? "snack"
              : activeTab === "Desserts"
                ? "dessert"
                : "all";

  const handleActiveMealChange = (next: MealFilter) => {
    if (next === "breakfast") setActiveTab("Breakfast");
    else if (next === "lunch") setActiveTab("Lunch");
    else if (next === "dinner") setActiveTab("Dinner");
    else if (next === "smoothie") setActiveTab("Smoothies");
    else if (next === "snack") setActiveTab("Snacks");
    else if (next === "dessert") setActiveTab("Desserts");
    else setActiveTab("Recipes");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onMenuOpen={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          active={activeTab}
          onChange={setActiveTab}
          mobileOpen={sidebarOpen}
          onMobileOpenChange={setSidebarOpen}
        />

        <main className="flex-1 min-w-0 px-6 py-6 space-y-5 max-w-2xl mx-auto w-full">
          {isDashboardTab && (
            <DashboardTab
              view={activeTab as DashboardView}
              recipes={recipes}
              customWeek={customWeek}
              customSaved={customSaved}
              phase2Unlocked={phase2Unlocked}
              onUnlockPhase2={handleUnlockPhase2}
              onLockPhase2={handleLockPhase2}
              onNavigateToCustomBuilder={handleNavigateToCustomBuilder}
            />
          )}

          {isRecipeMode && (
            <RecipeTab
              items={allItems}
              activeMeal={activeMeal}
              onActiveMealChange={handleActiveMealChange}
            />
          )}

          {activeTab === "Shopping" && (
            <ShoppingTab
              recipes={recipes}
              customWeek={customWeek}
              customSaved={customSaved}
              customShoppingList={customShoppingList}
              activeWeek={shoppingActiveWeek}
              onActiveWeekChange={setShoppingActiveWeek}
              onWeekChange={setCustomWeek}
              onSave={handleSaveCustomWeek}
            />
          )}

          {activeTab === "Kitchen" && <StoresTab />}
          {activeTab === "Review" && <ReviewTab items={allItems} />}
        </main>
      </div>
    </div>
  );
}
