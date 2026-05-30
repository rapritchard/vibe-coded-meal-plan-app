import { supabase } from "./supabase";
import type { RecipeType } from "./recipe-types";

export type RatingsMap = Record<string, number>;

const CACHE_KEY = "recipe-ratings-v1";

export function ratingKey(type: RecipeType, id: string): string {
  return `${type}:${id}`;
}

/** Synchronous cache read. Used as the initial value for the provider state
 * so the UI boots immediately with last-known data even before Supabase
 * responds (or while offline). */
export function readRatingsCacheSync(): RatingsMap {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    const parsed = JSON.parse(cached);
    return parsed && typeof parsed === "object" ? (parsed as RatingsMap) : {};
  } catch {
    return {};
  }
}

function writeRatingsCache(map: RatingsMap): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or unavailable — non-fatal, in-memory state still works.
  }
}

/** Fetches the canonical ratings from Supabase (public read). Falls back to
 * the cache when offline / not configured / on error. Always refreshes the
 * cache on a successful fetch. */
/** Splits a composite local cache key "type:id" into the two-column shape. */
function splitItemKey(itemKey: string): { item_type: string; item_id: string } {
  const i = itemKey.indexOf(":");
  return {
    item_type: itemKey.slice(0, i),
    item_id: itemKey.slice(i + 1),
  };
}

export async function loadRatings(): Promise<RatingsMap> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select("item_type, item_id, rating");
      if (!error && data) {
        const map: RatingsMap = {};
        for (const row of data) {
          const key = `${row.item_type}:${row.item_id}`;
          map[key] = row.rating as number;
        }
        writeRatingsCache(map);
        return map;
      }
    } catch {
      // Network / RLS / other — fall through to cache.
    }
  }
  return readRatingsCacheSync();
}

/** Upserts a single rating. Updates cache optimistically, then writes to
 * Supabase if configured + authenticated. */
export async function upsertRating(
  itemKey: string,
  rating: number,
): Promise<void> {
  const map = readRatingsCacheSync();
  map[itemKey] = rating;
  writeRatingsCache(map);

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("ratings")
      .upsert(
        { ...split, rating },
        { onConflict: "item_type,item_id" },
      );
  }
}

/** Removes a rating (used when the user clicks an active star to clear). */
export async function deleteRating(itemKey: string): Promise<void> {
  const map = readRatingsCacheSync();
  delete map[itemKey];
  writeRatingsCache(map);

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("ratings")
      .delete()
      .eq("item_type", split.item_type)
      .eq("item_id", split.item_id);
  }
}
