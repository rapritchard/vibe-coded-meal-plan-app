// ─────────────────────────────────────────────────────────────────────────────
// src/lib/app-state.ts
// Shared household key-value state — customWeek, etc.
// Backed by the Supabase `app_state` table with a localStorage cache so the
// app boots instantly and works offline.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";
import { storage } from "./storage";

/**
 * Reads a piece of shared app state.
 *
 * 1. If Supabase is configured, fetch from there first and refresh the
 *    localStorage cache on success.
 * 2. Otherwise (or on network/RLS failure), return the locally cached value.
 * 3. If neither has data, return `fallback`.
 */
export async function loadAppState<T>(key: string, fallback: T): Promise<T> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("app_state")
        .select("value")
        .eq("key", key)
        .maybeSingle();
      if (!error && data?.value !== undefined && data?.value !== null) {
        const parsed = data.value as T;
        // Mirror to the local cache so a subsequent offline load is fast.
        await storage.set(key, JSON.stringify(parsed));
        return parsed;
      }
    } catch {
      // fall through to local cache
    }
  }
  try {
    const r = await storage.get(key);
    return r ? (JSON.parse(r.value) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Persists a piece of shared app state. Optimistically writes the cache first,
 * then upserts to Supabase if configured.
 */
export async function saveAppState<T>(key: string, value: T): Promise<void> {
  try {
    await storage.set(key, JSON.stringify(value));
  } catch {
    // non-fatal
  }
  if (supabase) {
    await supabase
      .from("app_state")
      .upsert({ key, value }, { onConflict: "key" });
  }
}
