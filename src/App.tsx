import { useCallback, useEffect, useState } from "react";

import type { AnyRecipe, CustomWeek, Recipe, ShoppingCategory } from "@/types";
import {
  createEmptyWeek,
  generateShoppingList,
  loadCustomWeek,
  loadPhase2Unlocked,
  saveCustomWeek,
  savePhase2Unlocked,
} from "@/data/shoppingLists";
import type { WeekName } from "@/data/shoppingLists";
import {
  DESSERTS_DATA,
  SEED_RECIPES,
  SMOOTHIES_DATA,
  SNACKS_DATA,
} from "@/data/recipes";
import {
  loadRecipesFromSupabase,
  readRecipesCacheSync,
} from "@/lib/recipes-supabase";
import { useAuth } from "@/hooks/use-auth";

import { AppHeader } from "@/components/layout/AppHeader";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
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

// Fallback chain for the unified catalog. Supabase first, then local cache,
// then the bundled static seed (so the app works offline on a brand-new
// device that has never reached the cloud).
async function loadAllItemsWithFallback(): Promise<AnyRecipe[]> {
  const fromSupabase = await loadRecipesFromSupabase();
  if (fromSupabase && fromSupabase.length > 0) return fromSupabase;
  const cached = readRecipesCacheSync();
  if (cached && cached.length > 0) return cached;
  return [
    ...SEED_RECIPES,
    ...SMOOTHIES_DATA,
    ...SNACKS_DATA,
    ...DESSERTS_DATA,
  ];
}

export default function App() {
  const { session } = useAuth();
  const [ready, setReady] = useState(false);
  const [allItems, setAllItems] = useState<AnyRecipe[]>([]);
  const [phase2Unlocked, setPhase2Unlocked] = useState(false);
  const [customWeek, setCustomWeek] = useState<CustomWeek>(createEmptyWeek());
  const [customSaved, setCustomSaved] = useState(false);
  const [customShoppingList, setCustomShoppingList] =
    useState<ShoppingCategory | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("Overview");
  const [shoppingActiveWeek, setShoppingActiveWeek] =
    useState<WeekName>("Week A");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derive Recipe[] from the unified catalog for consumers that only care
  // about cooking-recipe entries (ShoppingTab, MealRow lookup, etc.).
  const recipes = allItems.filter(
    (i): i is Recipe => i.type === "recipe",
  );

  useEffect(() => {
    (async () => {
      const [items, cw, p2] = await Promise.all([
        loadAllItemsWithFallback(),
        loadCustomWeek(),
        loadPhase2Unlocked(),
      ]);
      setAllItems(items);
      setCustomWeek(cw);
      setPhase2Unlocked(p2);

      const recipeOnly = items.filter(
        (i): i is Recipe => i.type === "recipe",
      );
      const hasData = Object.values(cw).some((d) =>
        Object.values(d).some((v) => v),
      );
      if (hasData) {
        setCustomSaved(true);
        setCustomShoppingList(generateShoppingList(cw, recipeOnly));
      }

      setReady(true);
    })();
    // Re-run when auth state flips so a fresh sign-in pulls partner's
    // updates (and a fresh seed if the migration just populated Supabase).
  }, [session?.user?.id]);

  const handleSaveCustomWeek = useCallback(
    async (week: CustomWeek) => {
      setCustomShoppingList(generateShoppingList(week, recipes));
      setCustomSaved(true);
    },
    [recipes],
  );

  const handleResetCustomWeek = useCallback(async () => {
    const empty = createEmptyWeek();
    setCustomWeek(empty);
    setCustomSaved(false);
    setCustomShoppingList(null);
    await saveCustomWeek(empty);
  }, []);

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
      <MobileTopBar
        title={activeTab}
        onMenuOpen={() => setSidebarOpen(true)}
      />
      <AppHeader />

      <div className="flex">
        <Sidebar
          active={activeTab}
          onChange={setActiveTab}
          mobileOpen={sidebarOpen}
          onMobileOpenChange={setSidebarOpen}
        />

        <main className="flex-1 min-w-0 px-6 py-6 space-y-5 max-w-4xl mx-auto w-full">
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
              onResetCustomWeek={handleResetCustomWeek}
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
              onReset={handleResetCustomWeek}
            />
          )}

          {activeTab === "Kitchen" && <StoresTab />}
          {activeTab === "Review" && <ReviewTab items={allItems} />}
        </main>
      </div>
    </div>
  );
}
