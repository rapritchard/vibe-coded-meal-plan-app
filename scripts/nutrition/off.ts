// Open Food Facts client — throttled, with the mandatory User-Agent and 503
// backoff. OFF rate limits: 10 req/min for search, 15 req/min for product reads
// (per IP). We stay well under by spacing calls and caching upstream.

import type { Candidate, FoodRecord, Per100g } from "./types";
import { normalizeName } from "./convert";
import { saltToSodiumMg } from "./aggregate";

const BASE = "https://world.openfoodfacts.org";
const CONTACT = process.env.OFF_CONTACT_EMAIL ?? "meal-planner@example.com";
const USER_AGENT = `MealPlanner/1.0 (${CONTACT})`;

// Conservative spacing: search ≤10/min → 1 per 6.5s; reads ≤15/min → 1 per 4.5s.
const SEARCH_INTERVAL_MS = 6_500;
const READ_INTERVAL_MS = 4_500;

const lastCall: Record<"search" | "read", number> = { search: 0, read: 0 };

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function throttle(bucket: "search" | "read"): Promise<void> {
  const interval = bucket === "search" ? SEARCH_INTERVAL_MS : READ_INTERVAL_MS;
  const wait = lastCall[bucket] + interval - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall[bucket] = Date.now();
}

interface OffNutriments {
  "energy-kcal_100g"?: number;
  energy_100g?: number;
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  salt_100g?: number;
  sodium_100g?: number;
  "saturated-fat_100g"?: number;
}

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  serving_quantity?: number | string;
  nutriments?: OffNutriments;
}

const FIELDS =
  "code,product_name,brands,serving_quantity,nutriments";

async function offFetch(
  url: string,
  bucket: "search" | "read",
): Promise<unknown | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    await throttle(bucket);
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (res.status === 503 || res.status === 429) {
      await sleep(5_000 * (attempt + 1)); // back off on rate-limit
      continue;
    }
    if (!res.ok) return null;
    if (!(res.headers.get("content-type") ?? "").includes("application/json")) {
      return null;
    }
    return res.json();
  }
  return null;
}

function num(v: number | string | undefined): number | undefined {
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

/** Map OFF nutriments (per 100g) → our Per100g, or null if it lacks energy. */
function toPer100g(n: OffNutriments | undefined): Per100g | null {
  if (!n) return null;
  const kcal =
    num(n["energy-kcal_100g"]) ??
    (num(n.energy_100g) !== undefined ? num(n.energy_100g)! / 4.184 : undefined);
  if (kcal === undefined) return null;
  const sodiumMg =
    num(n.sodium_100g) !== undefined
      ? num(n.sodium_100g)! * 1000
      : num(n.salt_100g) !== undefined
        ? saltToSodiumMg(num(n.salt_100g)!)
        : undefined;
  return {
    calories: Math.round(kcal),
    protein_g: num(n.proteins_100g) ?? 0,
    carbs_g: num(n.carbohydrates_100g) ?? 0,
    fat_g: num(n.fat_100g) ?? 0,
    fibre_g: num(n.fiber_100g) ?? 0,
    sugar_g: num(n.sugars_100g),
    sodium_mg: sodiumMg,
    saturatedFat_g: num(n["saturated-fat_100g"]),
  };
}

function productToRecord(p: OffProduct): FoodRecord | null {
  if (!p.code) return null;
  const per100g = toPer100g(p.nutriments);
  if (!per100g) return null;
  const name = [p.brands, p.product_name].filter(Boolean).join(" ").trim();
  return {
    source: "openfoodfacts",
    id: p.code,
    displayName: name || p.product_name || p.code,
    per100g,
    servingGrams: num(p.serving_quantity),
  };
}

/** Token-overlap score between the query and a candidate's display name. */
function scoreCandidate(query: string, rec: FoodRecord): number {
  const q = new Set(normalizeName(query).split(" ").filter(Boolean));
  const cand = new Set(
    normalizeName(rec.displayName).split(" ").filter(Boolean),
  );
  let hits = 0;
  for (const t of q) if (cand.has(t)) hits++;
  return q.size ? hits / q.size : 0;
}

/** Exact-barcode lookup — the gold path, zero ambiguity. */
export async function getByBarcode(code: string): Promise<FoodRecord | null> {
  const url = `${BASE}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`;
  const json = (await offFetch(url, "read")) as
    | { status?: number; product?: OffProduct }
    | null;
  if (!json || json.status !== 1 || !json.product) return null;
  return productToRecord(json.product);
}

/** Free-text product search → up to `limit` scored candidates (best first). */
export async function searchProduct(
  query: string,
  limit = 5,
): Promise<Candidate[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: String(limit),
    fields: FIELDS,
  });
  const url = `${BASE}/cgi/search.pl?${params.toString()}`;
  const json = (await offFetch(url, "search")) as
    | { products?: OffProduct[] }
    | null;
  if (!json?.products) return [];
  return json.products
    .map(productToRecord)
    .filter((r): r is FoodRecord => r !== null)
    .map((r) => ({ ...r, score: scoreCandidate(query, r) }))
    .sort((a, b) => b.score - a.score);
}
