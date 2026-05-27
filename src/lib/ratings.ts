import { storage } from "./storage";
import type { RecipeType } from "./recipe-types";

export type RatingsMap = Record<string, number>;

const STORAGE_KEY = "recipe-ratings-v1";

export function ratingKey(type: RecipeType, id: string): string {
  return `${type}:${id}`;
}

export async function loadRatings(): Promise<RatingsMap> {
  const result = await storage.get(STORAGE_KEY);
  if (!result) return {};
  try {
    const parsed = JSON.parse(result.value);
    if (parsed && typeof parsed === "object") return parsed as RatingsMap;
    return {};
  } catch {
    return {};
  }
}

export async function saveRatings(map: RatingsMap): Promise<void> {
  await storage.set(STORAGE_KEY, JSON.stringify(map));
}
