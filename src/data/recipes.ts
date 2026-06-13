// ─────────────────────────────────────────────────────────────────────────────
// src/data/recipes.ts
// Small static lookups (time/tag styling) + non-recipe content (principles,
// flavour tools, kitchen tools, Costco lists).
//
// As of v1.5 the recipe catalog lives in Supabase — see scripts/seed-recipes.sql
// for a one-time backup that can re-create the table from source. The bulk
// arrays that used to live here are gone.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Principle,
  FlavourTool,
  KitchenToolsMap,
  TimeKey,
} from "../types";

// ── Time / tag lookup maps ────────────────────────────────────────────────────

export const TIME_KEY: Record<TimeKey, string> = {
  "⚡": "Under 15 mins",
  "🕐": "15-30 mins",
  "🕑": "30-60 mins",
  "⏳": "60+ mins / needs lead time",
  "🌙": "Overnight — set before bed",
};

export const TIME_COLORS: Record<TimeKey, string> = {
  "⚡": "bg-green-50 text-green-700",
  "🕐": "bg-sky-50 text-sky-700",
  "🕑": "bg-amber-50 text-amber-700",
  "⏳": "bg-orange-50 text-orange-700",
  "🌙": "bg-indigo-50 text-indigo-700",
};

export const TAG_STYLES: Record<string, string> = {
  "NINJA OVERNIGHT": "bg-indigo-100 text-indigo-800",
  "NINJA BROTH": "bg-indigo-100 text-indigo-800",
  "NINJA SLOW COOK": "bg-indigo-100 text-indigo-800",
  "FROM NINJA": "bg-green-100 text-green-700",
  "FROM PREP": "bg-green-100 text-green-700",
  LEFTOVERS: "bg-blue-100 text-blue-700",
  "COOK x 2": "bg-rose-100 text-rose-700",
};


// (Bulk recipe data lives in Supabase as of v1.5 — see scripts/seed-recipes.sql for one-time backup.)

export const PRINCIPLES: Principle[] = [
  { icon: "🫒", title: "Fat strictly low", detail: "Max 3g fat per meal initially. No olive oil drizzles, no full-fat cheese, no nuts." },
  { icon: "🧄", title: "Garlic & onion cooked only", detail: "Finely minced, softened fully before adding anything else. Never raw." },
  { icon: "🍽️", title: "Small & frequent", detail: "Smaller amounts more often. Your gut is managing bile solo now." },
  { icon: "🥣", title: "Soft textures", detail: "Well-cooked, easy to digest. Avoid anything fibrous or chewy in the first week." },
  { icon: "⚠️", title: "Bloat stacking rule", detail: "Never combine more than one gas-producing ingredient per meal." },
  { icon: "🍅", title: "Tomato cap", detail: "Max one tomato-based dish per day." },
  { icon: "🫘", title: "Legume rule", detail: "Baked beans and lentil dishes never on the same day." },
  { icon: "🍋", title: "Lime sparingly", detail: "A small squeeze to finish, not a main flavour." },
];

// ── Flavour tools ─────────────────────────────────────────────────────────────

export const FLAVOUR_TOOLS: FlavourTool[] = [
  { icon: "🫙", name: "White miso", use: "Stir into broths, dressings, glazes." },
  { icon: "🥢", name: "Soy sauce / tamari", use: "Marinades, broths, rice bowls." },
  { icon: "🍯", name: "Honey", use: "Small amounts round off sharp flavours." },
  { icon: "🟫", name: "Brown sugar & cinnamon", use: "Warming sweetness for oats, porridge, crumpets." },
  { icon: "🫚", name: "Smoked paprika", use: "Adds richness without fat." },
  { icon: "🌿", name: "Fresh ginger", use: "Warmth and depth. Goes in almost everything savoury." },
  { icon: "🌱", name: "Spring onion & chives", use: "Safe raw as a topping." },
  { icon: "🌿", name: "Fresh coriander", use: "Brightens everything." },
  { icon: "🟢", name: "Lime (small squeeze)", use: "Lifts flat flavours. Use sparingly." },
];

// ── Kitchen tools ─────────────────────────────────────────────────────────────

export const KITCHEN_TOOLS: KitchenToolsMap = {
  "Ninja Ecosystem": [
    { name: "Ninja 9-in-1 Multi-Cooker (7.5L)", notes: "Pressure Cook, Air Fry, Slow Cook, Steam, Bake/Roast, Sear/Saute, Grill, Yoghurt, Dehydrate. TenderCrisp lid. Feeds up to 6." },
    { name: "Ninja Auto-iQ Duo Blender", notes: "Full jug blender. Handles raw carrot, frozen fruit, soups." },
    { name: "Ninja BC151 Personal Cup Blender", notes: "Single-serve. Blend and drink from the same cup. Zero washing up." },
    { name: "Ninja Juicer", notes: "Cold press juicing." },
  ],
  "Tefal Ecosystem": [
    { name: "Tefal Snack Collection Machine", notes: "Waffles, pancakes, wafers, triangular toasted sandwiches, biscuits, french toast plates." },
    { name: "Tefal Ingenio Pots & Pans (inc. wok)", notes: "Detachable handles. Note: largest pan slightly too wide for hobs — use medium pans." },
    { name: "Masterclass Smart Stack / Smart Space Stacking Pots & Pans", notes: "Space-saving stacking set." },
    { name: "VonChef XXL Teppanyaki Grill", notes: "Large flat griddle. Cook tofu, veg, eggs simultaneously." },
    { name: "Fondue Maker", notes: "Occasional use." },
  ],
  Lakeland: [
    { name: "1L Rice & Porridge Cooker", notes: "Delay start functionality — set before bed or before leaving the house." },
  ],
  Basics: [
    { name: "Zanussi Standard Oven", notes: "" },
    { name: "Standard Hob (4 rings)", notes: "Largest Ingenio pan slightly too wide — use medium pans." },
    { name: "Microwave", notes: "Jacket potatoes, reheating, defrosting, steaming veg in a covered bowl." },
    { name: "1.5L Kettle", notes: "" },
    { name: "4-Slice Toaster", notes: "" },
    { name: "Hand Blender", notes: "Blend soup directly in the pan." },
  ],
  "Prep Tools": [
    { name: "MIU Stainless Steel Mixing Bowl Set (8pc)", notes: "3 grater attachments + lids." },
    { name: "Handheld Chopper", notes: "Quick onion/herb chopping." },
    { name: "Garlic Grinder", notes: "" },
    { name: "Apple Corer/Cutter", notes: "" },
    { name: "Potato Ricer", notes: "Smooth mash without fat." },
    { name: "Lemon Juicer", notes: "" },
    { name: "Instant Read Thermometer", notes: "Tofu internal temp, egg doneness." },
    { name: "Silicone Egg Rings", notes: "Shaped eggs on teppanyaki or hob." },
  ],
  "Moulds & Holders": [
    { name: "Egg Cups", notes: "" },
    { name: "Taco Holders", notes: "Occasional use." },
    { name: "Popsicle Holders", notes: "Smoothie popsicles — pour any smoothie in and freeze." },
    { name: "Ice Maker", notes: "" },
  ],
  "When Ready": [
    { name: "Small Food Processor / Mandoline", notes: "Not yet decided. Check Wirecutter or Which? independently — both ad-free." },
  ],
};

// ── Costco staples ────────────────────────────────────────────────────────────

export const COSTCO_ITEMS: string[] = [
  "Rolled oats (large bags)",
  "White basmati rice",
  "Soy sauce / tamari",
  "Protein powder",
  "Frozen edamame",
  "Coconut water (cases)",
  "Olive oil",
  "Greek yoghurt (large tubs)",
  "Medjool dates",
];
