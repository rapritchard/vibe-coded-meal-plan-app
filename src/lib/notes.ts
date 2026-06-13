import { supabase } from "./supabase";
import { loadCached, mutateCachedMap, readCache } from "./cached-store";
import type { RecipeType } from "./recipe-types";

export type NotesMap = Record<string, string>;

const CACHE_KEY = "recipe-notes-v1";

export function noteKey(type: RecipeType, id: string): string {
  return `${type}:${id}`;
}

/** Synchronous cache read for provider bootstrap. */
export function readNotesCacheSync(): NotesMap {
  return readCache<NotesMap>(CACHE_KEY, {});
}

function splitItemKey(itemKey: string): { item_type: string; item_id: string } {
  const i = itemKey.indexOf(":");
  return {
    item_type: itemKey.slice(0, i),
    item_id: itemKey.slice(i + 1),
  };
}

/** Fetch canonical notes from Supabase (public read). Cache on success; fall
 * back to cache on failure / offline / not-configured. */
export async function loadNotes(): Promise<NotesMap> {
  return loadCached<NotesMap>(CACHE_KEY, {}, async () => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("notes")
      .select("item_type, item_id, content");
    if (error || !data) return null;
    const map: NotesMap = {};
    for (const row of data) {
      map[`${row.item_type}:${row.item_id}`] = row.content as string;
    }
    return map;
  });
}

/** Upsert one note. Empty/whitespace content deletes the note instead. */
export async function upsertNote(
  itemKey: string,
  content: string,
): Promise<void> {
  if (content.trim() === "") {
    await deleteNote(itemKey);
    return;
  }

  mutateCachedMap<string>(CACHE_KEY, (map) => {
    map[itemKey] = content;
  });

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("notes")
      .upsert({ ...split, content }, { onConflict: "item_type,item_id" });
  }
}

export async function deleteNote(itemKey: string): Promise<void> {
  mutateCachedMap<string>(CACHE_KEY, (map) => {
    delete map[itemKey];
  });

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("notes")
      .delete()
      .eq("item_type", split.item_type)
      .eq("item_id", split.item_id);
  }
}
