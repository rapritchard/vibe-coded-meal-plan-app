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

export type EffortLevel = "grab-and-go" | "easy" | "medium" | "hard";

/** Unicode emoji used as a time-complexity key */
export type TimeKey = "⚡" | "🕐" | "🕑" | "⏳" | "🌙";

export type MealCategory = "breakfast" | "lunch" | "dinner";

// ── Core Recipe ──────────────────────────────────────────────────────────────

export interface Recipe {
  id: string;
  name: string;
  phase: number;
  category: MealCategory;
  time: string;
  serves: string;
  timeKey: TimeKey;
  /** Number of items to wash up */
  tools: number;
  leadTime: string | null;
  isBatch: boolean;
  moods: string[];
  effort: EffortLevel;
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

// ── Phase 2 preview (teaser cards, no full recipe data yet) ──────────────────

export interface Phase2Recipe {
  id: string;
  name: string;
  moods: string[];
  effort: EffortLevel;
  time: string;
  serves: string;
  /** Explains why it is not Phase 1 safe and how to adapt */
  note: string;
}

// ── Smoothies ────────────────────────────────────────────────────────────────

export interface SmoothieRecipe {
  name: string;
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

export interface Snack {
  name: string;
  badge: string;
  desc: string;
}

// ── Desserts ─────────────────────────────────────────────────────────────────

export interface Dessert {
  name: string;
  time: string;
  serves: string;
  leadTime: string;
  steps: string[];
  tip: string;
  variations: string[];
}

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
