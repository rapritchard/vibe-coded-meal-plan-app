// ─────────────────────────────────────────────────────────────────────────────
// src/lib/migration.ts
// One-time per-device migration of pre-Supabase localStorage data into the
// shared Supabase tables. Runs idempotently on first authenticated sign-in.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";
import { readRatingsCacheSync } from "./ratings";
import { readNotesCacheSync } from "./notes";
import { storage } from "./storage";
import {
  bulkUpsertRecipes,
  recipesTableIsEmpty,
} from "./recipes-supabase";
import type { AnyRecipe } from "@/types";
import {
  DESSERTS_DATA,
  SEED_RECIPES,
  SMOOTHIES_DATA,
  SNACKS_DATA,
} from "@/data/recipes";

// Bump these whenever the underlying schema or row shape changes, to force
// every device through a fresh migration pass.
const MIGRATION_FLAG_KEY = "supabase-migration-v2";
const RECIPES_SEED_FLAG_KEY = "supabase-recipes-seeded-v2";

const CUSTOM_WEEK_KEY = "custom-week-d";
const PHASE2_UNLOCKED_KEY = "phase2-unlocked";

// ── slug → uuid lookup ─────────────────────────────────────────────────────

/**
 * Builds a `${type}:${slug}` → `uuid` map from the static seed. Local rating
 * and note cache keys used to be `${type}:${slug}`; the new Supabase shape
 * uses uuid for item_id (except phase2 which stays slug-based).
 */
function buildSlugToUuidMap(): Map<string, string> {
  const out = new Map<string, string>();
  const all: AnyRecipe[] = [
    ...SEED_RECIPES,
    ...SMOOTHIES_DATA,
    ...SNACKS_DATA,
    ...DESSERTS_DATA,
  ];
  for (const item of all) {
    out.set(`${item.type}:${item.slug}`, item.id);
  }
  return out;
}

/**
 * Translates a local composite key (which used slugs as the identifier) to
 * the new `(item_type, item_id)` shape Supabase expects.
 *
 * For phase2 keys we keep the slug as item_id since Phase 2 recipes aren't
 * in the recipes table.
 */
function localKeyToRow(
  localKey: string,
  slugMap: Map<string, string>,
): { item_type: string; item_id: string } | null {
  const i = localKey.indexOf(":");
  if (i < 0) return null;
  const type = localKey.slice(0, i);
  const ident = localKey.slice(i + 1);

  if (type === "phase2") {
    return { item_type: type, item_id: ident };
  }

  // ident is likely a slug in the pre-UUID local cache. Translate.
  const uuid = slugMap.get(`${type}:${ident}`);
  if (uuid) return { item_type: type, item_id: uuid };

  // If ident already looks like a UUID (8-4-4-4-12 hex), assume it's
  // already the new format and pass through.
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      ident,
    )
  ) {
    return { item_type: type, item_id: ident };
  }

  // Unrecognised — orphaned reference. Skip.
  return null;
}

// ── Ratings + notes + app_state migration ──────────────────────────────────

export async function migrateLocalToSupabaseIfNeeded(): Promise<void> {
  if (!supabase) return;
  if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;

  try {
    const slugMap = buildSlugToUuidMap();

    const ratingRows: {
      item_type: string;
      item_id: string;
      rating: number;
    }[] = [];
    for (const [localKey, rating] of Object.entries(readRatingsCacheSync())) {
      const row = localKeyToRow(localKey, slugMap);
      if (row) ratingRows.push({ ...row, rating });
    }

    const noteRows: {
      item_type: string;
      item_id: string;
      content: string;
    }[] = [];
    for (const [localKey, content] of Object.entries(readNotesCacheSync())) {
      const row = localKeyToRow(localKey, slugMap);
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

// ── Recipes seed ───────────────────────────────────────────────────────────

export async function seedRecipesIfEmpty(): Promise<void> {
  if (!supabase) return;
  if (localStorage.getItem(RECIPES_SEED_FLAG_KEY)) return;

  try {
    const empty = await recipesTableIsEmpty();
    if (!empty) {
      localStorage.setItem(RECIPES_SEED_FLAG_KEY, new Date().toISOString());
      return;
    }

    const items: AnyRecipe[] = [
      ...SEED_RECIPES,
      ...SMOOTHIES_DATA,
      ...SNACKS_DATA,
      ...DESSERTS_DATA,
    ];

    await bulkUpsertRecipes(items);
    localStorage.setItem(RECIPES_SEED_FLAG_KEY, new Date().toISOString());
  } catch (e) {
    console.warn("[migration] recipes seed failed", e);
  }
}
