import { storage } from "./storage";
import type { RecipeType } from "./recipe-types";

export type NotesMap = Record<string, string>;

const STORAGE_KEY = "recipe-notes-v1";

export function noteKey(type: RecipeType, id: string): string {
  return `${type}:${id}`;
}

export async function loadNotes(): Promise<NotesMap> {
  const result = await storage.get(STORAGE_KEY);
  if (!result) return {};
  try {
    const parsed = JSON.parse(result.value);
    if (parsed && typeof parsed === "object") return parsed as NotesMap;
    return {};
  } catch {
    return {};
  }
}

export async function saveNotes(map: NotesMap): Promise<void> {
  await storage.set(STORAGE_KEY, JSON.stringify(map));
}
