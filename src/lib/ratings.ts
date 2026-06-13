import { supabase } from "./supabase";
import { loadCached, mutateCachedMap, readCache } from "./cached-store";
import type { RecipeType } from "./recipe-types";

export type RatingsMap = Record<string, number>;

const CACHE_KEY = "recipe-ratings-v1";

export function ratingKey(type: RecipeType, id: string): string {
  return `${type}:${id}`;
}

/** Synchronous cache read. Used as the initial value for the provider state so
 * the UI boots immediately with last-known data (or `{}` on a fresh device). */
export function readRatingsCacheSync(): RatingsMap {
  return readCache<RatingsMap>(CACHE_KEY, {});
}

/** Splits a composite local cache key "type:id" into the two-column shape. */
function splitItemKey(itemKey: string): { item_type: string; item_id: string } {
  const i = itemKey.indexOf(":");
  return {
    item_type: itemKey.slice(0, i),
    item_id: itemKey.slice(i + 1),
  };
}

/** Fetches the canonical ratings from Supabase (public read). Falls back to the
 * cache when offline / not configured / on error; refreshes it on success. */
export async function loadRatings(): Promise<RatingsMap> {
  return loadCached<RatingsMap>(CACHE_KEY, {}, async () => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("ratings")
      .select("item_type, item_id, rating");
    if (error || !data) return null;
    const map: RatingsMap = {};
    for (const row of data) {
      map[`${row.item_type}:${row.item_id}`] = row.rating as number;
    }
    return map;
  });
}

/** Upserts a single rating. Updates cache optimistically, then writes to
 * Supabase if configured + authenticated. */
export async function upsertRating(
  itemKey: string,
  rating: number,
): Promise<void> {
  mutateCachedMap<number>(CACHE_KEY, (map) => {
    map[itemKey] = rating;
  });

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("ratings")
      .upsert({ ...split, rating }, { onConflict: "item_type,item_id" });
  }
}

/** Removes a rating (used when the user clicks an active star to clear). */
export async function deleteRating(itemKey: string): Promise<void> {
  mutateCachedMap<number>(CACHE_KEY, (map) => {
    delete map[itemKey];
  });

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("ratings")
      .delete()
      .eq("item_type", split.item_type)
      .eq("item_id", split.item_id);
  }
}
