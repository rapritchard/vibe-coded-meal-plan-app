import { supabase } from "./supabase";
import type { RecipeType } from "./recipe-types";

export type NotesMap = Record<string, string>;

const CACHE_KEY = "recipe-notes-v1";

export function noteKey(type: RecipeType, id: string): string {
  return `${type}:${id}`;
}

/** Synchronous cache read for provider bootstrap. */
export function readNotesCacheSync(): NotesMap {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    const parsed = JSON.parse(cached);
    return parsed && typeof parsed === "object" ? (parsed as NotesMap) : {};
  } catch {
    return {};
  }
}

function writeNotesCache(map: NotesMap): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // non-fatal
  }
}

/** Fetch canonical notes from Supabase (public read). Cache on success;
 * fall back to cache on failure / offline / not-configured. */
function splitItemKey(itemKey: string): { item_type: string; item_id: string } {
  const i = itemKey.indexOf(":");
  return {
    item_type: itemKey.slice(0, i),
    item_id: itemKey.slice(i + 1),
  };
}

export async function loadNotes(): Promise<NotesMap> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("item_type, item_id, content");
      if (!error && data) {
        const map: NotesMap = {};
        for (const row of data) {
          const key = `${row.item_type}:${row.item_id}`;
          map[key] = row.content as string;
        }
        writeNotesCache(map);
        return map;
      }
    } catch {
      // fall through
    }
  }
  return readNotesCacheSync();
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

  const map = readNotesCacheSync();
  map[itemKey] = content;
  writeNotesCache(map);

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("notes")
      .upsert(
        { ...split, content },
        { onConflict: "item_type,item_id" },
      );
  }
}

export async function deleteNote(itemKey: string): Promise<void> {
  const map = readNotesCacheSync();
  delete map[itemKey];
  writeNotesCache(map);

  if (supabase) {
    const split = splitItemKey(itemKey);
    await supabase
      .from("notes")
      .delete()
      .eq("item_type", split.item_type)
      .eq("item_id", split.item_id);
  }
}
