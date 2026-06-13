// ─────────────────────────────────────────────────────────────────────────────
// src/lib/migration.ts
// One-time per-device migration of pre-Supabase localStorage data into the
// shared Supabase tables. Runs idempotently on first authenticated sign-in.
//
// As of v1.5 the recipe catalog lives in Supabase directly — there is no
// per-device seed step. This file now only handles ratings/notes/app_state
// migration from older clients. The migration is gated by a sentinel flag
// so it only runs once per device.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";
import { readRatingsCacheSync } from "./ratings";
import { readNotesCacheSync } from "./notes";
import { storage } from "./storage";

// Bump this when the underlying schema or row shape changes, to force every
// device through a fresh migration pass.
const MIGRATION_FLAG_KEY = "supabase-migration-v2";

const CUSTOM_WEEK_KEY = "custom-week-d";
const PHASE2_UNLOCKED_KEY = "phase2-unlocked";

/**
 * Translates a local composite cache key into the (item_type, item_id) shape
 * Supabase expects. Pre-v1.4 keys used slugs; modern keys use UUIDs. We pass
 * UUIDs through untouched and skip anything else (orphaned slug references
 * would no longer match anything in Supabase since the catalog is auth-shared
 * and the source-of-truth is the cloud).
 */
function localKeyToRow(
  localKey: string,
): { item_type: string; item_id: string } | null {
  const i = localKey.indexOf(":");
  if (i < 0) return null;
  const type = localKey.slice(0, i);
  const ident = localKey.slice(i + 1);

  // Phase 2 keys historically used slugs; keep as-is.
  if (type === "phase2") return { item_type: type, item_id: ident };

  // Accept UUIDs (current shape) only.
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      ident,
    )
  ) {
    return { item_type: type, item_id: ident };
  }
  return null;
}

export async function migrateLocalToSupabaseIfNeeded(): Promise<void> {
  if (!supabase) return;
  if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;

  try {
    const ratingRows: {
      item_type: string;
      item_id: string;
      rating: number;
    }[] = [];
    for (const [localKey, rating] of Object.entries(readRatingsCacheSync())) {
      const row = localKeyToRow(localKey);
      if (row) ratingRows.push({ ...row, rating });
    }

    const noteRows: {
      item_type: string;
      item_id: string;
      content: string;
    }[] = [];
    for (const [localKey, content] of Object.entries(readNotesCacheSync())) {
      const row = localKeyToRow(localKey);
      if (row) noteRows.push({ ...row, content });
    }

    if (ratingRows.length > 0) {
      const { error } = await supabase
        .from("ratings")
        .upsert(ratingRows, { onConflict: "item_type,item_id" });
      if (error) {
        console.warn("[migration] ratings upsert failed", error.message);
        return;
      }
    }

    if (noteRows.length > 0) {
      const { error } = await supabase
        .from("notes")
        .upsert(noteRows, { onConflict: "item_type,item_id" });
      if (error) {
        console.warn("[migration] notes upsert failed", error.message);
        return;
      }
    }

    // Custom week + phase2 unlock flag — push from localStorage to app_state.
    const appStateRows: { key: string; value: unknown }[] = [];
    const customWeek = await storage.get(CUSTOM_WEEK_KEY);
    if (customWeek) {
      try {
        appStateRows.push({
          key: CUSTOM_WEEK_KEY,
          value: JSON.parse(customWeek.value),
        });
      } catch {
        // skip malformed
      }
    }
    const phase2 = await storage.get(PHASE2_UNLOCKED_KEY);
    if (phase2) {
      try {
        appStateRows.push({
          key: PHASE2_UNLOCKED_KEY,
          value: JSON.parse(phase2.value),
        });
      } catch {
        // skip malformed
      }
    }
    if (appStateRows.length > 0) {
      const { error } = await supabase
        .from("app_state")
        .upsert(appStateRows, { onConflict: "key" });
      if (error) {
        console.warn("[migration] app_state upsert failed", error.message);
        return;
      }
    }

    localStorage.setItem(MIGRATION_FLAG_KEY, new Date().toISOString());
  } catch (e) {
    console.warn("[migration] unexpected failure", e);
  }
}
