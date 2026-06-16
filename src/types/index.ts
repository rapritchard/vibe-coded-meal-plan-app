// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts
// Global type definitions for the meal plan app.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ────────────────────────────────────────────────────────

/** Raw ingredient tuple: [name, quantity, unit] */
export type IngredientTuple = [name: string, quantity: number, unit: string];

/** A single tool alternative suggestion on a recipe */
export interface ToolAlt {
  tool: string;
  note: string;
}

// ── Recipe effort / timing ───────────────────────────────────────────────────

/**
 * What kind of cooking experience to expect.
 * - ready: already prepared, open/grab from fridge (under 1 min)
 * - make-ahead: today's meal needed yesterday's prep (overnight, chill, freeze)
 * - quick-cook: ~15 min total, active throughout
 * - set-forget: ~30 min total but only ~5 min hands-on; simmer/bake walks away
 * - cook-tend: 25+ min sustained, attentive kitchen work
 */
export type EffortLevel =
  | "ready"
  | "make-ahead"
  | "quick-cook"
  | "set-forget"
  | "cook-tend";

/** Display label for each EffortLevel bucket. */
export const EFFORT_LABELS: Record<EffortLevel, string> = {
  ready: "Ready to eat",
  "make-ahead": "Make-ahead",
  "quick-cook": "Quick cook",
  "set-forget": "Set & forget",
  "cook-tend": "Cook & tend",
};

/**
 * Mouth-feel / cravings vocabulary. Recipes carry 1-3 of these so users can
 * filter by what they're actually in the mood for.
 */
export type Mood =
  | "Creamy"
  | "Salty & savoury"
  | "Brothy"
  | "Rich & deep"
  | "Bright & fresh"
  | "Spiced & warming"
  | "Sweet";

export const ALL_MOODS: Mood[] = [
  "Creamy",
  "Salty & savoury",
  "Brothy",
  "Rich & deep",
  "Bright & fresh",
  "Spiced & warming",
  "Sweet",
];

/** Unicode emoji used as a time-complexity key */
export type TimeKey = "⚡" | "🕐" | "🕑" | "⏳" | "🌙";

export type MealCategory = "breakfast" | "lunch" | "dinner";

/**
 * The full set of categories an item can have once snacks/smoothies/desserts
 * are unified into one catalog.
 */
export type RecipeCategoryKind =
  | MealCategory
  | "snack"
  | "smoothie"
  | "dessert";

/** Recipe meal filter value: category or "all". */
export type MealFilter = RecipeCategoryKind | "all";

// ── Shared base across the four ratable/notable item types ──────────────────

/**
 * Fields every browsable food item shares once the catalog is unified.
 * The full set of moods/effort/leftovers/on-the-go is what FilterBar reads.
 */
export interface RecipeBase {
  /** Opaque UUID (Postgres-generated for new entries; deterministic for seed). */
  id: string;
  /** Human-readable kebab-case identifier. Unique. Used for URLs/logs. */
  slug: string;
  name: string;
  moods: Mood[];
  effort: EffortLevel;
  isBatch: boolean;
  /** Whether this item survives a Tupperware / eats well cold or reheated. */
  goodOnTheGo: boolean;
  /**
   * Normalised nutrition data, or null when unknown. Stored as jsonb so the
   * schema doesn't change if we add fields later. Raw provider response is
   * kept inside under `raw` in case we ever want to extract extra fields.
   */
  nutrition?: RecipeNutrition | null;
}

/**
 * Normalised nutrition record. Provider-independent so we can swap the
 * upstream API (API Ninjas, Edamam, USDA, manual entry…) without touching
 * the UI. All totals are for the whole recipe; divide by `yieldServings` to
 * get per-serving values.
 */
export interface RecipeNutrition {
  /** Servings the totals were computed for. */
  yieldServings: number;
  /** Totals across the entire recipe. */
  total: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fibre_g: number;
    /** Optional fields — some providers don't supply these on free tier. */
    sugar_g?: number;
    sodium_mg?: number;
    saturatedFat_g?: number;
  };
  /** Where the data came from. */
  source:
    | "api-ninjas"
    | "edamam"
    | "usda"
    | "openfoodfacts"
    | "cofid"
    | "manual"
    | "llm";
  /** ISO timestamp of when it was last fetched / edited. */
  fetchedAt?: string;
  /** Raw provider response, preserved for future field extraction. */
  raw?: unknown;
}

// ── Core Recipe ──────────────────────────────────────────────────────────────

export interface Recipe extends RecipeBase {
  type: "recipe";
  category: MealCategory;
  time: string;
  serves: string;
  timeKey: TimeKey;
  leadTime: string | null;
  ingredients: IngredientTuple[];
  toolAlts: ToolAlt[];
  /** Tasks that can be run simultaneously — shown in a "Do these together" block */
  parallelTasks: string[];
  steps: string[];
  tip: string;
  variations: string[];
  /**
   * Parallel array to `variations`. Each entry is either `null` (no alternate
   * step list) or a string array of replacement steps for that variation.
   */
  variationSteps: (string[] | null)[];
}

// ── Smoothies ────────────────────────────────────────────────────────────────

export interface SmoothieRecipe extends RecipeBase {
  type: "smoothie";
  category: "smoothie";
  /** Short descriptor shown on the card (e.g. "Protein - Electrolytes - Mood-lifting") */
  desc: string;
  /** Plain-text ingredient list (already formatted for display) */
  ingredients: string[];
  /** Steps for the Ninja BC151 personal cup blender */
  bc151: string[];
  /** Steps for the Ninja Auto-iQ Duo full-jug blender */
  duo: string[];
  tip: string;
  variations: string[];
}

// ── Snacks ───────────────────────────────────────────────────────────────────

export interface Snack extends RecipeBase {
  type: "snack";
  category: "snack";
  /** "When to reach for it" label, e.g. "Medication buffer", "High protein". */
  badge: string;
  desc: string;
}

// ── Desserts ─────────────────────────────────────────────────────────────────

export interface Dessert extends RecipeBase {
  type: "dessert";
  category: "dessert";
  time: string;
  serves: string;
  leadTime: string;
  steps: string[];
  tip: string;
  variations: string[];
}

// ── Unified catalog ──────────────────────────────────────────────────────────

/**
 * Any browsable item in the recipe catalog. Discriminated by `type`, so a
 * dispatcher can render the correct card style for each kind.
 */
export type AnyRecipe = Recipe | SmoothieRecipe | Snack | Dessert;

// ── Kitchen tools ────────────────────────────────────────────────────────────

export interface KitchenTool {
  name: string;
  notes: string;
}

/** Category name → list of tools */
export type KitchenToolsMap = Record<string, KitchenTool[]>;

// ── Recovery principles & flavour tools ─────────────────────────────────────

export interface Principle {
  icon: string;
  title: string;
  detail: string;
}

export interface FlavourTool {
  icon: string;
  name: string;
  use: string;
}

// ── Meal planning ────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner";

export interface PlannedMeal {
  name: string;
  prepNote?: string;
  note?: string;
}

export interface DayPlan {
  day: string;
  meals: {
    breakfast: PlannedMeal;
    lunch: PlannedMeal;
    dinner: PlannedMeal;
    snacks: string[];
  };
}

/** Week name → array of day plans */
export type WeekPlans = Record<string, DayPlan[]>;

// ── Custom week builder ──────────────────────────────────────────────────────

export interface CustomDayMeals {
  breakfast: string;
  lunch: string;
  dinner: string;
}

/** Day name → meal selections */
export type CustomWeek = Record<string, CustomDayMeals>;

// ── Shopping lists ───────────────────────────────────────────────────────────

/** Category name → list of item strings */
export type ShoppingCategory = Record<string, string[]>;

/** Week name → shopping category map */
export type ShoppingLists = Record<string, ShoppingCategory>;

// ── Stores ───────────────────────────────────────────────────────────────────

export interface StoreAisle {
  name: string;
  items: string[];
}

export interface Store {
  name: string;
  emoji: string;
  note: string;
  aisles: StoreAisle[];
}

// ── Seed versioning ──────────────────────────────────────────────────────────

export interface SeedMeta {
  version: string;
}
