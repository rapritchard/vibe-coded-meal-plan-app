// ─────────────────────────────────────────────────────────────────────────────
// src/data/shoppingLists.ts
// Static shopping list data for the three curated weeks, the week-plan
// schedules, the custom-week generator utility, and all storage helpers.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ShoppingLists,
  ShoppingCategory,
  WeekPlans,
  CustomWeek,
  MealType,
  Recipe,
} from "../types";
import { SEED_VERSION, SEED_RECIPES } from "./recipes";
import { storage } from "../lib/storage";
import { loadAppState, saveAppState } from "../lib/app-state";

// ── Constants ─────────────────────────────────────────────────────────────────

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Day = (typeof DAYS)[number];

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const WEEKS = ["Week A", "Week B", "Week C", "Custom"] as const;
export type WeekName = (typeof WEEKS)[number];

// ── Week colour tokens (used by the tab selectors in ShoppingTab) ─────────────

export const WEEK_COLORS: Record<WeekName, string> = {
  "Week A": "bg-violet-600 text-white",
  "Week B": "bg-sky-600 text-white",
  "Week C": "bg-emerald-600 text-white",
  Custom: "bg-stone-900 text-white",
};

export const WEEK_BORDER: Record<WeekName, string> = {
  "Week A": "border-violet-600",
  "Week B": "border-sky-600",
  "Week C": "border-emerald-600",
  Custom: "border-stone-900",
};

// ── Curated week meal plans ───────────────────────────────────────────────────

export const WEEK_PLANS: WeekPlans = {
  "Week A": [
    {
      day: "Monday",
      meals: {
        breakfast: { name: "Porridge with berries & honey", prepNote: "FROM NINJA" },
        lunch: { name: "Vegetable & white bean soup", prepNote: "FROM PREP" },
        dinner: { name: "Lentil & carrot bolognese with pasta", prepNote: "LEFTOVERS" },
        snacks: ["Banana", "Rice cakes with Philly Lightest & cucumber", "Steamed edamame"],
      },
    },
    {
      day: "Tuesday",
      meals: {
        breakfast: { name: "Overnight oats with berries", prepNote: "FROM PREP" },
        lunch: { name: "Jacket potato with Philly Lightest & chives" },
        dinner: { name: "Vegan pho", note: "Start Ninja broth by 11am.", prepNote: "NINJA BROTH" },
        snacks: ["Banana", "0% Greek yoghurt with protein powder", "Batch egg"],
      },
    },
    {
      day: "Wednesday",
      meals: {
        breakfast: { name: "Soft scrambled eggs on sourdough" },
        lunch: { name: "Soft egg & cucumber open sandwich", note: "Use batch eggs.", prepNote: "FROM PREP" },
        dinner: { name: "Baked tofu with miso-glazed carrots, pak choi & rice", note: "Cook double.", prepNote: "COOK x 2" },
        snacks: ["Banana", "Quark pouch", "Rice cakes"],
      },
    },
    {
      day: "Thursday",
      meals: {
        breakfast: { name: "Overnight oats with berries", prepNote: "FROM PREP" },
        lunch: { name: "Steamed edamame & rice bowl with miso dressing" },
        dinner: { name: "Baked tofu with miso-glazed carrots, pak choi & rice", prepNote: "LEFTOVERS" },
        snacks: ["Banana", "Batch egg", "0% Greek yoghurt with protein powder"],
      },
    },
    {
      day: "Friday",
      meals: {
        breakfast: { name: "Crumpets with banana & cinnamon" },
        lunch: { name: "Rice cakes with Philly Lightest, cucumber & egg", note: "Use batch eggs.", prepNote: "FROM PREP" },
        dinner: { name: "Tomato & lentil dhal with rice", note: "Ninja slow cooker — start by 1pm.", prepNote: "NINJA SLOW COOK" },
        snacks: ["Banana", "Quark pouch", "Soft fruit"],
      },
    },
    {
      day: "Saturday",
      meals: {
        breakfast: { name: "0% Greek yoghurt with protein powder & honey" },
        lunch: { name: "Congee with ginger, spring onion & soft egg" },
        dinner: { name: "Baked eggs in gentle tomato & white bean sauce" },
        snacks: ["Banana", "Rice cakes", "Steamed edamame"],
      },
    },
    {
      day: "Sunday",
      meals: {
        breakfast: { name: "Rice porridge with ginger & honey", note: "Ninja overnight for Monday.", prepNote: "NINJA OVERNIGHT" },
        lunch: { name: "Miso broth with silken tofu, soba & spring onion" },
        dinner: { name: "Lentil & carrot bolognese with pasta", note: "Ninja pressure cook. Freeze half.", prepNote: "COOK x 2" },
        snacks: ["Batch boil 6 eggs", "Mini overnight oat pots x2", "Banana", "Quark pouch"],
      },
    },
  ],
  "Week B": [
    {
      day: "Monday",
      meals: {
        breakfast: { name: "Rice porridge with ginger & honey", prepNote: "FROM NINJA" },
        lunch: { name: "Jacket potato with baked beans & reduced fat cheddar" },
        dinner: { name: "Tomato & lentil dhal with rice", prepNote: "LEFTOVERS" },
        snacks: ["Banana", "Batch egg", "Rice cakes with Philly Lightest"],
      },
    },
    {
      day: "Tuesday",
      meals: {
        breakfast: { name: "Overnight oats with berries" },
        lunch: { name: "Soft rice paper rolls with tofu, carrot & cucumber" },
        dinner: { name: "Miso noodle broth with pak choi & egg", note: "Cook double.", prepNote: "COOK x 2" },
        snacks: ["Banana", "0% Greek yoghurt with protein powder", "Steamed edamame"],
      },
    },
    {
      day: "Wednesday",
      meals: {
        breakfast: { name: "Crumpets with banana & cinnamon" },
        lunch: { name: "Congee with ginger, spring onion & soft egg" },
        dinner: { name: "Miso noodle broth with pak choi & egg", prepNote: "LEFTOVERS" },
        snacks: ["Banana", "Quark pouch", "Batch egg"],
      },
    },
    {
      day: "Thursday",
      meals: {
        breakfast: { name: "Soft-boiled egg & Philly Lightest on sourdough", note: "Use batch eggs.", prepNote: "FROM PREP" },
        lunch: { name: "Steamed edamame & rice bowl with miso dressing" },
        dinner: { name: "Vegan pho", note: "Start Ninja broth by 11am.", prepNote: "NINJA BROTH" },
        snacks: ["Banana", "Rice cakes", "0% Greek yoghurt with protein powder"],
      },
    },
    {
      day: "Friday",
      meals: {
        breakfast: { name: "Banana & oat smoothie" },
        lunch: { name: "Vegetable & white bean soup" },
        dinner: { name: "Baked eggs in gentle tomato & white bean sauce" },
        snacks: ["Banana", "Quark pouch", "Soft fruit"],
      },
    },
    {
      day: "Saturday",
      meals: {
        breakfast: { name: "0% Greek yoghurt with protein powder & honey" },
        lunch: { name: "Soft egg & cucumber open sandwich" },
        dinner: { name: "Lentil & carrot bolognese with pasta" },
        snacks: ["Banana", "Steamed edamame", "Batch egg"],
      },
    },
    {
      day: "Sunday",
      meals: {
        breakfast: { name: "Rice porridge with ginger & honey", note: "Ninja overnight. Make double.", prepNote: "NINJA OVERNIGHT" },
        lunch: { name: "Miso broth with silken tofu, soba & spring onion" },
        dinner: { name: "Tomato & lentil dhal with rice", note: "Ninja slow cooker. Freeze half.", prepNote: "COOK x 2" },
        snacks: ["Batch boil 6 eggs", "Mini overnight oat pots x2", "Banana", "Quark pouch"],
      },
    },
  ],
  "Week C": [
    {
      day: "Monday",
      meals: {
        breakfast: { name: "Porridge with berries & honey", prepNote: "FROM NINJA" },
        lunch: { name: "Vegetable & white bean soup", prepNote: "FROM PREP" },
        dinner: { name: "Baked tofu with miso-glazed carrots, pak choi & rice", prepNote: "LEFTOVERS" },
        snacks: ["Banana", "Batch egg", "Rice cakes with Philly Lightest"],
      },
    },
    {
      day: "Tuesday",
      meals: {
        breakfast: { name: "Overnight oats with berries" },
        lunch: { name: "Jacket potato with Philly Lightest & chives" },
        dinner: { name: "Tomato & lentil dhal with rice", note: "Ninja slow cooker — start by 1pm.", prepNote: "NINJA SLOW COOK" },
        snacks: ["Banana", "0% Greek yoghurt with protein powder", "Steamed edamame"],
      },
    },
    {
      day: "Wednesday",
      meals: {
        breakfast: { name: "Soft scrambled eggs on sourdough" },
        lunch: { name: "Soft rice paper rolls with tofu, carrot & cucumber" },
        dinner: { name: "Miso noodle broth with pak choi & egg", note: "Cook double.", prepNote: "COOK x 2" },
        snacks: ["Banana", "Quark pouch", "Batch egg"],
      },
    },
    {
      day: "Thursday",
      meals: {
        breakfast: { name: "Rice porridge with ginger & honey", note: "Rice cooker delay start.", prepNote: "NINJA OVERNIGHT" },
        lunch: { name: "Congee with ginger, spring onion & soft egg" },
        dinner: { name: "Miso noodle broth with pak choi & egg", prepNote: "LEFTOVERS" },
        snacks: ["Banana", "Rice cakes", "Steamed edamame"],
      },
    },
    {
      day: "Friday",
      meals: {
        breakfast: { name: "Crumpets with banana & cinnamon" },
        lunch: { name: "Jacket potato with baked beans & reduced fat cheddar" },
        dinner: { name: "Vegan pho", note: "Start Ninja broth by 11am.", prepNote: "NINJA BROTH" },
        snacks: ["Banana", "Quark pouch", "0% Greek yoghurt with protein powder"],
      },
    },
    {
      day: "Saturday",
      meals: {
        breakfast: { name: "0% Greek yoghurt with protein powder & honey" },
        lunch: { name: "Steamed edamame & rice bowl with miso dressing" },
        dinner: { name: "Low fat full English" },
        snacks: ["Banana", "Batch egg", "Soft fruit"],
      },
    },
    {
      day: "Sunday",
      meals: {
        breakfast: { name: "Porridge with berries & honey", note: "Ninja overnight for Monday.", prepNote: "NINJA OVERNIGHT" },
        lunch: { name: "Vegetable & white bean soup", note: "Big batch.", prepNote: "COOK x 2" },
        dinner: { name: "Baked tofu with miso-glazed carrots, pak choi & rice", note: "Cook double.", prepNote: "COOK x 2" },
        snacks: ["Batch boil 6 eggs", "Mini overnight oat pots x2", "Banana", "Quark pouch"],
      },
    },
  ],
};

// ── Curated shopping lists ────────────────────────────────────────────────────

export const SHOPPING_LISTS: ShoppingLists = {
  "Week A": {
    "Fridge & Dairy": [
      "Firm tofu (2 packs)",
      "Silken tofu (1 pack)",
      "Philadelphia Lightest (large tub)",
      "0% Greek yoghurt (large)",
      "Quark pouches (4-6)",
      "Eggs (12)",
      "Reduced fat cheddar (small block)",
      "Pak choi (2 heads)",
      "Spring onions (bunch)",
      "Kefir (plain, 500ml)",
    ],
    "Dry & Ambient": [
      "Rolled oats (large bag)",
      "Ramen or soba noodles",
      "Rice noodles",
      "White basmati rice",
      "White pasta (500g)",
      "Green lentils (dried, 200g)",
      "Rice cakes (2 packs)",
      "Sourdough loaf",
      "Crumpets",
    ],
    "Tins & Jars": [
      "Chopped tomatoes (3 tins)",
      "White beans (2 tins)",
      "Baked beans (2 tins)",
      "Vegetable stock",
      "White miso paste",
      "Soy sauce or tamari",
    ],
    "Veg & Fruit": [
      "Bananas (bunch)",
      "Frozen berries (2 bags)",
      "Frozen mango chunks",
      "Cucumber (2)",
      "Carrots (bag)",
      "Baking potatoes (4)",
      "Chives",
      "Fresh ginger (large knob)",
      "Coriander (bunch)",
      "Soft fruit",
      "Strawberries (punnet)",
    ],
    Flavour: [
      "Garlic (bulb)",
      "Cinnamon",
      "Brown sugar",
      "Smoked paprika",
      "Cumin",
      "Turmeric",
      "Honey",
      "Lime (3-4)",
      "Star anise",
      "Cinnamon sticks",
      "Mushroom stock cubes",
      "Nutritional yeast",
    ],
    "Protein & Health": [
      "Protein powder",
      "Edamame (frozen, 500g)",
      "Dark chocolate 70%",
    ],
    Smoothie: [
      "Coconut water (plain, 1 litre)",
      "Barista oat milk",
      "Medjool dates (small pack)",
    ],
  },
  "Week B": {
    "Fridge & Dairy": [
      "Firm tofu (2 packs)",
      "Silken tofu (2 packs)",
      "Smoked tofu (1 pack)",
      "Philadelphia Lightest (large tub)",
      "0% Greek yoghurt (large)",
      "Quark pouches (4-6)",
      "Eggs (12)",
      "Pak choi (3 heads)",
      "Spring onions",
      "Kefir (plain, 500ml)",
    ],
    "Dry & Ambient": [
      "Rolled oats (large bag)",
      "White basmati rice",
      "Soba noodles",
      "Rice noodles",
      "Ramen noodles",
      "Rice paper sheets",
      "White pasta (500g)",
      "Red lentils (200g)",
      "Rice cakes",
      "Sourdough loaf",
      "Crumpets",
    ],
    "Tins & Jars": [
      "Chopped tomatoes (2 tins)",
      "White beans (3 tins)",
      "Baked beans (1 tin)",
      "Vegetable stock",
      "White miso paste",
      "Soy sauce or tamari",
    ],
    "Veg & Fruit": [
      "Bananas (bunch)",
      "Frozen berries (2 bags)",
      "Cucumber (2)",
      "Carrots (bag)",
      "Baking potatoes (2)",
      "Chives",
      "Fresh ginger",
      "Coriander",
      "Mushrooms (250g)",
      "Soft fruit",
    ],
    Flavour: [
      "Garlic",
      "Cinnamon",
      "Brown sugar",
      "Smoked paprika",
      "Cumin",
      "Honey",
      "Lime (3-4)",
      "Star anise",
      "Cinnamon sticks",
      "Mushroom stock cubes",
      "Nutritional yeast",
    ],
    "Protein & Health": [
      "Protein powder",
      "Edamame (frozen, 500g)",
      "Dark chocolate 70%",
    ],
    Smoothie: [
      "Coconut water (1 litre)",
      "Barista oat milk",
      "Medjool dates",
    ],
  },
  "Week C": {
    "Fridge & Dairy": [
      "Firm tofu (3 packs)",
      "Silken tofu (1 pack)",
      "Smoked tofu (1 pack)",
      "Philadelphia Lightest (large tub)",
      "0% Greek yoghurt (large)",
      "Quark pouches (4-6)",
      "Eggs (12)",
      "Pak choi (3 heads)",
      "Spring onions",
      "Kefir (plain, 500ml)",
    ],
    "Dry & Ambient": [
      "Rolled oats (large bag)",
      "White basmati rice",
      "Soba or ramen noodles",
      "Rice noodles",
      "Rice paper sheets",
      "White pasta (500g)",
      "Green lentils (200g)",
      "Rice cakes",
      "Sourdough loaf",
      "Crumpets",
    ],
    "Tins & Jars": [
      "Chopped tomatoes (2 tins)",
      "White beans (2 tins)",
      "Baked beans (2 tins)",
      "Vegetable stock",
      "White miso paste",
      "Soy sauce or tamari",
    ],
    "Veg & Fruit": [
      "Bananas (bunch)",
      "Frozen berries (2 bags)",
      "Cucumber (2)",
      "Carrots (bag)",
      "Baking potatoes (3)",
      "Chives",
      "Fresh ginger",
      "Coriander",
      "Tomatoes (4)",
      "Mushrooms (250g)",
      "Strawberries (punnet)",
      "Soft fruit",
    ],
    Flavour: [
      "Garlic",
      "Cinnamon",
      "Brown sugar",
      "Smoked paprika",
      "Cumin",
      "Turmeric",
      "Honey",
      "Lime (3-4)",
      "Star anise",
      "Cinnamon sticks",
      "Mushroom stock cubes",
      "Nutritional yeast",
    ],
    "Protein & Health": [
      "Protein powder",
      "Edamame (frozen, 500g)",
      "Dark chocolate 70%",
    ],
    Smoothie: [
      "Coconut water (1 litre)",
      "Barista oat milk",
      "Medjool dates",
    ],
  },
};

// ── Category keyword map (used by the custom-week generator) ──────────────────
// Each entry maps a display category name to the lowercase keywords used to
// classify an ingredient name into that category.

export const SHOPPING_CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Fridge & Dairy": [
    "tofu",
    "yoghurt",
    "quark",
    "philadelphia",
    "eggs",
    "cheddar",
    "pak choi",
    "spring onion",
    "kefir",
    "cheese",
    "parmesan",
  ],
  "Dry & Ambient": [
    "oats",
    "rice",
    "pasta",
    "noodles",
    "lentils",
    "rice cakes",
    "sourdough",
    "crumpets",
    "porcini",
    "flour",
    "seeds",
  ],
  "Tins & Jars": [
    "beans",
    "tomatoes",
    "stock",
    "miso",
    "soy",
    "tamari",
    "vinegar",
    "paste",
  ],
  "Veg & Fruit": [
    "banana",
    "berries",
    "mango",
    "cucumber",
    "carrot",
    "potato",
    "chives",
    "ginger",
    "coriander",
    "mushroom",
    "tomato",
    "lime",
    "onion",
    "pak choi",
    "edamame",
    "spinach",
    "pepper",
    "lemon",
    "strawberr",
  ],
  Flavour: [
    "honey",
    "cinnamon",
    "sugar",
    "paprika",
    "cumin",
    "turmeric",
    "garlic",
    "star anise",
    "oregano",
    "thyme",
    "sesame",
    "nutritional yeast",
    "yeast",
    "salt",
  ],
  "Smoothie & Drinks": ["oat milk", "coconut water", "dates", "kefir"],
};

// ── Custom week generator ─────────────────────────────────────────────────────

/**
 * Builds a deduplicated, categorised shopping list from a custom week's
 * meal selections. Ingredients are extracted from the matched Recipe objects
 * and bucketed using `SHOPPING_CATEGORY_KEYWORDS`.
 *
 * Returns a `ShoppingCategory` (category → string[]) suitable for rendering
 * in ShoppingTab alongside the curated week lists.
 */
export function generateShoppingList(
  customWeek: CustomWeek,
  recipes: Recipe[]
): ShoppingCategory {
  // 1. Collect unique ingredient names across all selected recipes
  const map: Record<string, string> = {};

  const addIngredient = (name: string): void => {
    const key = name.toLowerCase().trim();
    if (!map[key]) map[key] = name;
  };

  Object.values(customWeek).forEach((day) => {
    MEAL_TYPES.forEach((type) => {
      const recipeName = day[type];
      if (!recipeName) return;
      const recipe = recipes.find((r) => r.name === recipeName);
      if (recipe?.ingredients) {
        recipe.ingredients.forEach(([name]) => addIngredient(name));
      }
    });
  });

  // 2. Categorise using keyword matching
  const grouped: ShoppingCategory = {};
  const assigned = new Set<string>();

  Object.entries(SHOPPING_CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    const matches: string[] = [];

    Object.values(map).forEach((name) => {
      const key = name.toLowerCase();
      const alreadyAssigned = assigned.has(key);
      const matchesCategory = keywords.some(
        (kw) => key.includes(kw) || kw.includes(key)
      );
      if (!alreadyAssigned && matchesCategory) {
        matches.push(name);
        assigned.add(key);
      }
    });

    if (matches.length > 0) {
      grouped[category] = matches;
    }
  });

  // 3. Catch anything that didn't match a keyword category
  const uncategorised = Object.values(map).filter(
    (name) => !assigned.has(name.toLowerCase())
  );
  if (uncategorised.length > 0) {
    grouped["Other"] = uncategorised;
  }

  return grouped;
}

// ── Custom week factory ───────────────────────────────────────────────────────

/**
 * Returns a blank CustomWeek with every day initialised to empty strings.
 * Used as the default state for the custom week builder.
 */
export function createEmptyWeek(): CustomWeek {
  return DAYS.reduce<CustomWeek>(
    (acc, day) => ({
      ...acc,
      [day]: { breakfast: "", lunch: "", dinner: "" },
    }),
    {} as CustomWeek
  );
}

// ── Storage helpers ───────────────────────────────────────────────────────────
// These are thin async wrappers around the storage adapter (localStorage outside Claude,
// storage API). They are co-located here so every storage key is defined in
// one place and importable without reaching into component files.

/** Storage key constants — single source of truth */
export const STORAGE_KEYS = {
  recipesVersion: "recipes-version",
  recipesData: "recipes-data",
  customWeek: "custom-week-d",
  phase2Unlocked: "phase2-unlocked",
} as const;

/**
 * Loads recipes from persistent storage. If the stored seed version does not
 * match the current `SEED_VERSION`, the storage is re-seeded with fresh data.
 */
export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const v = await storage.get(STORAGE_KEYS.recipesVersion);
    if (!v || v.value !== SEED_VERSION) throw new Error("seed-stale");
    const r = await storage.get(STORAGE_KEYS.recipesData);
    return r ? (JSON.parse(r.value) as Recipe[]) : SEED_RECIPES;
  } catch {
    await storage.set(STORAGE_KEYS.recipesVersion, SEED_VERSION);
    await storage.set(
      STORAGE_KEYS.recipesData,
      JSON.stringify(SEED_RECIPES)
    );
    return SEED_RECIPES;
  }
}

/**
 * Loads the persisted custom week from shared app state (Supabase-backed,
 * localStorage-cached). Falls back to a blank week on any error.
 */
export async function loadCustomWeek(): Promise<CustomWeek> {
  return loadAppState<CustomWeek>(STORAGE_KEYS.customWeek, createEmptyWeek());
}

/** Persists the current custom week selection (shared household state). */
export async function saveCustomWeek(week: CustomWeek): Promise<void> {
  await saveAppState(STORAGE_KEYS.customWeek, week);
}

/**
 * Loads the Phase 2 unlock flag from shared app state. Returns `false` if
 * never set or on any error.
 */
export async function loadPhase2Unlocked(): Promise<boolean> {
  return loadAppState<boolean>(STORAGE_KEYS.phase2Unlocked, false);
}

/** Persists the Phase 2 unlock flag (shared household state). */
export async function savePhase2Unlocked(value: boolean): Promise<void> {
  await saveAppState(STORAGE_KEYS.phase2Unlocked, value);
}
