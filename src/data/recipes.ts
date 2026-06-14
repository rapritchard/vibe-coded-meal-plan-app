// ─────────────────────────────────────────────────────────────────────────────
// src/data/recipes.ts
// Small static lookups (time/tag styling) + the kitchen-tools content.
// The recipe catalog itself lives in Supabase.
// ─────────────────────────────────────────────────────────────────────────────

import type { KitchenToolsMap, TimeKey } from "../types";

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
