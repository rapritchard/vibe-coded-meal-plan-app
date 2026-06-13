// supabase/functions/enrich-nutrition/index.ts
// Server-side nutrition enrichment for a single recipe, using the USDA
// FoodData Central API. Runs as an authenticated Edge Function so the API key
// never reaches the client bundle.
//
// Secrets (set with `supabase secrets set` — NOT .env.local, which the deployed
// function can't read):
//   USDA_API_KEY — a free key from https://fdc.nal.usda.gov/api-key-signup.html
//                  (falls back to "DEMO_KEY", which is heavily rate-limited).
// SUPABASE_URL and SUPABASE_ANON_KEY are injected by the runtime. All DB access
// runs as the caller (user-scoped client) so RLS enforces the write allowlist —
// the service-role key is deliberately not used.
//
// Unit handling: mass/volume units (g, kg, mg, ml, l) convert directly. Other
// units (counts like "2 crumpets", or "slice"/"clove"/"tbsp"/"pinch") are
// resolved via the matched food's USDA foodPortions, then a generic volume
// table. Anything still unresolved is reported back in `skipped`.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const USDA_API_KEY = Deno.env.get("USDA_API_KEY") ?? "DEMO_KEY";
const FDC_BASE = "https://api.nal.usda.gov/fdc/v1";

// USDA nutrient numbers (values are per 100g of the food).
const NUTRIENT = {
  calories: "208",
  protein_g: "203",
  fat_g: "204",
  carbs_g: "205",
  fibre_g: "291",
  sugar_g: "269",
  sodium_mg: "307",
  saturatedFat_g: "606",
} as const;

type IngredientTuple = [name: string, quantity: number, unit: string];

interface FdcNutrient {
  nutrientNumber?: string;
  value?: number;
}
interface FdcPortion {
  amount?: number;
  gramWeight?: number;
  modifier?: string;
  portionDescription?: string;
  measureUnit?: { name?: string };
}
interface FdcFood {
  fdcId: number;
  foodNutrients?: FdcNutrient[];
  foodPortions?: FdcPortion[];
}

// Generic volume → grams (approx; assumes water-like density). Used only when a
// food has no matching USDA portion for the unit.
const VOLUME_UNITS: Record<string, number> = {
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  cup: 240,
  cups: 240,
  pinch: 0.36,
  dash: 0.6,
};

// Units that denote a count of whole items ("2 bananas", blank unit, etc.).
const COUNT_UNITS = new Set([
  "",
  "whole",
  "each",
  "piece",
  "pieces",
  "unit",
  "units",
  "x",
  "medium",
  "large",
  "small",
]);

/** Direct mass/volume conversion to grams, or null if not such a unit. */
function massGrams(quantity: number, u: string): number | null {
  switch (u) {
    case "g":
    case "gram":
    case "grams":
      return quantity;
    case "kg":
      return quantity * 1000;
    case "mg":
      return quantity / 1000;
    case "ml":
    case "milliliter":
    case "millilitre":
      return quantity;
    case "l":
    case "litre":
    case "liter":
      return quantity * 1000;
    default:
      return null;
  }
}

function nutrientValue(food: FdcFood, number: string): number {
  const hit = food.foodNutrients?.find((n) => n.nutrientNumber === number);
  return hit?.value ?? 0;
}

/** Grams for a single portion (normalising USDA's amount, e.g. "2 slices = 56g"
 * -> 28g per slice). */
function portionGrams(p: FdcPortion): number | null {
  if (!p.gramWeight) return null;
  const amount = p.amount && p.amount > 0 ? p.amount : 1;
  return p.gramWeight / amount;
}

/** Resolve grams for one whole "unit" of the food using its USDA portions. */
function gramsFromPortions(unit: string, portions: FdcPortion[]): number | null {
  if (portions.length === 0) return null;
  const text = (p: FdcPortion) =>
    `${p.modifier ?? ""} ${p.portionDescription ?? ""} ${p.measureUnit?.name ?? ""}`.toLowerCase();

  if (COUNT_UNITS.has(unit)) {
    // Prefer a "medium"/"whole"/"each" portion; otherwise take the first.
    const preferred = portions.find((p) => /medium|whole|each/.test(text(p)));
    return portionGrams(preferred ?? portions[0]);
  }
  // Match the unit word against the portion's measure/description.
  const hit = portions.find(
    (p) =>
      p.measureUnit?.name?.toLowerCase() === unit ||
      text(p).includes(unit),
  );
  return hit ? portionGrams(hit) : null;
}

async function fetchJson(url: URL): Promise<Record<string, unknown> | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  // A throttled / error response can be HTML; guard the JSON parse.
  if (!(res.headers.get("content-type") ?? "").includes("application/json")) {
    return null;
  }
  return await res.json();
}

async function searchFood(name: string, dataType?: string): Promise<FdcFood | null> {
  const url = new URL(`${FDC_BASE}/foods/search`);
  url.searchParams.set("api_key", USDA_API_KEY);
  url.searchParams.set("query", name);
  url.searchParams.set("pageSize", "1");
  if (dataType) url.searchParams.set("dataType", dataType);
  const json = await fetchJson(url);
  const food = (json?.foods as FdcFood[] | undefined)?.[0];
  return food ?? null;
}

/** Find the best-matching USDA food: prefer clean whole-food datasets, then
 * fall back to an unfiltered search (branded/survey) for wider coverage. */
async function lookupFood(name: string): Promise<FdcFood | null> {
  return (
    (await searchFood(name, "Foundation,SR Legacy")) ?? (await searchFood(name))
  );
}

/** USDA portions live on the food-detail endpoint, not in search results. */
async function fetchPortions(fdcId: number): Promise<FdcPortion[]> {
  const url = new URL(`${FDC_BASE}/food/${fdcId}`);
  url.searchParams.set("api_key", USDA_API_KEY);
  const json = await fetchJson(url);
  const portions = json?.foodPortions as FdcPortion[] | undefined;
  return Array.isArray(portions) ? portions : [];
}

/** Convert one ingredient to grams, or null if it can't be resolved. */
async function ingredientGrams(
  quantity: number,
  unit: string,
  food: FdcFood,
): Promise<number | null> {
  const u = unit.toLowerCase().trim();

  const mass = massGrams(quantity, u);
  if (mass !== null) return mass;

  // Item-specific units (slice, clove, "1 banana") — use USDA portions.
  const portions = await fetchPortions(food.fdcId);
  const perUnit = gramsFromPortions(u, portions);
  if (perUnit !== null) return quantity * perUnit;

  // Generic volume fallback when the food had no matching portion.
  if (u in VOLUME_UNITS) return quantity * VOLUME_UNITS[u];

  return null;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { id } = await req.json();
    if (!id) return json({ error: "Missing recipe id" }, 400);

    // User-scoped client (forwards the caller's JWT) so every DB access runs
    // under RLS — including the "allowlist writes recipes" policy. We must NOT
    // use the service-role key here: bypassing RLS would let any authenticated
    // user, not just allowlisted household members, write to the shared catalog.
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);

    const { data: row, error } = await supabase
      .from("recipes")
      .select("id, type, data")
      .eq("id", id)
      .single();
    if (error || !row) return json({ error: "Recipe not found" }, 404);

    const data = (row.data ?? {}) as {
      ingredients?: IngredientTuple[];
      serves?: string;
    };
    const ingredients = Array.isArray(data.ingredients) ? data.ingredients : [];
    if (ingredients.length === 0) {
      return json({ error: "Recipe has no structured ingredients" }, 422);
    }

    const total = {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fibre_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
      saturatedFat_g: 0,
    };
    const skipped: string[] = [];

    for (const [name, quantity, unit] of ingredients) {
      const food = await lookupFood(name);
      if (!food) {
        skipped.push(`${name} (no USDA match)`);
        continue;
      }
      const grams = await ingredientGrams(quantity, unit, food);
      if (grams === null) {
        skipped.push(`${name} (couldn't convert "${quantity} ${unit}")`);
        continue;
      }
      const factor = grams / 100;
      total.calories += nutrientValue(food, NUTRIENT.calories) * factor;
      total.protein_g += nutrientValue(food, NUTRIENT.protein_g) * factor;
      total.carbs_g += nutrientValue(food, NUTRIENT.carbs_g) * factor;
      total.fat_g += nutrientValue(food, NUTRIENT.fat_g) * factor;
      total.fibre_g += nutrientValue(food, NUTRIENT.fibre_g) * factor;
      total.sugar_g += nutrientValue(food, NUTRIENT.sugar_g) * factor;
      total.sodium_mg += nutrientValue(food, NUTRIENT.sodium_mg) * factor;
      total.saturatedFat_g +=
        nutrientValue(food, NUTRIENT.saturatedFat_g) * factor;
    }

    // Round to one decimal to avoid noisy floats.
    for (const k of Object.keys(total) as (keyof typeof total)[]) {
      total[k] = Math.round(total[k] * 10) / 10;
    }

    const nutrition = {
      yieldServings: Number.parseInt(data.serves ?? "", 10) || 1,
      total,
      source: "usda" as const,
      fetchedAt: new Date().toISOString(),
    };

    // The "allowlist writes recipes" RLS policy enforces who may write. A
    // blocked write updates zero rows, so .select() comes back empty -> 403.
    const { data: updated, error: upsertError } = await supabase
      .from("recipes")
      .update({ nutrition })
      .eq("id", id)
      .select("id");
    if (upsertError) return json({ error: upsertError.message }, 500);
    if (!updated || updated.length === 0) {
      return json({ error: "Not authorized to edit recipes" }, 403);
    }

    return json({ nutrition, skipped });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
