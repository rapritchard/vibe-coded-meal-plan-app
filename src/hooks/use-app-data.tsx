// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/use-app-data.tsx
// App-wide data provider: the unified recipe catalog plus the shared custom-week
// meal-plan state. Lives in a context so route components (which can't receive
// props from a parent) can read it via the useAppData() / useCatalog() hooks.
//
// This absorbs the data-loading and meal-plan state that previously lived in
// App.tsx, consistent with the existing Auth/Ratings/Notes provider pattern.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { AnyRecipe, CustomWeek, Recipe, ShoppingCategory } from "@/types";
import {
  createEmptyWeek,
  generateShoppingList,
  loadCustomWeek,
  saveCustomWeek as persistCustomWeek,
} from "@/lib/shopping";
import {
  loadRecipesFromSupabase,
  readRecipesCacheSync,
} from "@/lib/recipes-supabase";
import { useAuth } from "@/hooks/use-auth";

// Fallback chain for the unified catalog. Supabase first, then localStorage
// cache. Supabase is the source of truth — no bundled static seed. A brand-new
// offline device sees an empty catalog until the next online visit caches it.
async function loadAllItemsWithFallback(): Promise<AnyRecipe[]> {
  const fromSupabase = await loadRecipesFromSupabase();
  if (fromSupabase && fromSupabase.length > 0) return fromSupabase;
  const cached = readRecipesCacheSync();
  return cached ?? [];
}

interface AppDataValue {
  ready: boolean;
  /** The full unified catalog (recipes + smoothies + snacks + desserts). */
  allItems: AnyRecipe[];
  /** Cooking-recipe entries only, for consumers that need ingredient data. */
  recipes: Recipe[];
  customWeek: CustomWeek;
  customSaved: boolean;
  customShoppingList: ShoppingCategory | null;
  setCustomWeek: (week: CustomWeek) => void;
  /** Recomputes + marks the custom shopping list as saved for `week`. */
  saveCustomWeek: (week: CustomWeek) => Promise<void>;
  /** Clears the custom week back to empty and persists it. */
  resetCustomWeek: () => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [ready, setReady] = useState(false);
  const [allItems, setAllItems] = useState<AnyRecipe[]>([]);
  const [customWeek, setCustomWeek] = useState<CustomWeek>(createEmptyWeek());
  const [customSaved, setCustomSaved] = useState(false);
  const [customShoppingList, setCustomShoppingList] =
    useState<ShoppingCategory | null>(null);

  // Cooking recipes are derived from the unified catalog.
  const recipes = allItems.filter((i): i is Recipe => i.type === "recipe");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [items, cw] = await Promise.all([
        loadAllItemsWithFallback(),
        loadCustomWeek(),
      ]);
      if (cancelled) return;

      setAllItems(items);
      setCustomWeek(cw);

      const recipeOnly = items.filter((i): i is Recipe => i.type === "recipe");
      const hasData = Object.values(cw).some((d) =>
        Object.values(d).some((v) => v),
      );
      if (hasData) {
        setCustomSaved(true);
        setCustomShoppingList(generateShoppingList(cw, recipeOnly));
      }

      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // Re-run when auth flips so a fresh sign-in pulls the partner's updates.
  }, [session?.user?.id]);

  const saveCustomWeek = useCallback(
    async (week: CustomWeek) => {
      setCustomShoppingList(generateShoppingList(week, recipes));
      setCustomSaved(true);
    },
    [recipes],
  );

  const resetCustomWeek = useCallback(async () => {
    const empty = createEmptyWeek();
    setCustomWeek(empty);
    setCustomSaved(false);
    setCustomShoppingList(null);
    await persistCustomWeek(empty);
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        ready,
        allItems,
        recipes,
        customWeek,
        customSaved,
        customShoppingList,
        setCustomWeek,
        saveCustomWeek,
        resetCustomWeek,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
