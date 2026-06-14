// ─────────────────────────────────────────────────────────────────────────────
// src/data/shoppingLists.ts
// Domain constants (days, meal types) + the keyword map used to classify
// ingredients into shopping categories. The custom-week logic + persistence
// live in src/lib/shopping.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { MealType } from "../types";

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

// Custom-week logic (generateShoppingList, createEmptyWeek) and persistence
// (loadCustomWeek, saveCustomWeek) now live in src/lib/shopping.ts. The keyword
// map above is consumed there.
