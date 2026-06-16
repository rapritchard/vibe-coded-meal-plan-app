// Resolve an ingredient name to a single food record: cache → (CoFID + OFF)
// candidates → optional LLM adjudication → deterministic fallback. Every
// successful resolution is cached so each unique ingredient is resolved once.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import type { Candidate, Resolution } from "./types";
import { aliasIngredient, normalizeName } from "./convert";
import { searchCofid } from "./cofid";
import { searchProduct } from "./off";
import { adjudicate, isLLMEnabled } from "./adjudicate";

const here = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = join(here, "cache.json");

// Score gates. A single candidate clearly above the pack is auto-accepted;
// anything resolved below REVIEW is flagged for manual review (still usable).
const STRONG = 0.75;
const MARGIN = 0.15; // gap to runner-up that counts as "unambiguous"

export type ResolveOutcome =
  | { ok: true; resolution: Resolution }
  | { ok: false; reason: string; candidates: Candidate[] };

type Cache = Record<string, Resolution>;

let cache: Cache | null = null;

function loadCache(): Cache {
  if (cache) return cache;
  cache = existsSync(CACHE_PATH)
    ? (JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache)
    : {};
  return cache;
}

export function saveCache(): void {
  if (!cache) return;
  const sorted: Cache = {};
  for (const k of Object.keys(cache).sort()) sorted[k] = cache[k];
  writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + "\n");
}

function toResolution(
  c: Candidate,
  confidence: number,
  reason: string,
  needsReview: boolean,
): Resolution {
  return {
    source: c.source,
    id: c.id,
    displayName: c.displayName,
    per100g: c.per100g,
    servingGrams: c.servingGrams,
    confidence: Math.round(confidence * 100) / 100,
    reason,
    needsReview,
  };
}

export interface ResolveOpts {
  quantity: number;
  unit: string;
  /** Skip the LLM step even when a key is present. */
  noLlm?: boolean;
  /** Ignore any cached resolution and resolve afresh. */
  refresh?: boolean;
}

export async function resolveIngredient(
  name: string,
  opts: ResolveOpts,
): Promise<ResolveOutcome> {
  const key = normalizeName(name);
  const c = loadCache();
  if (!opts.refresh && c[key]) return { ok: true, resolution: c[key] };

  // Search with the aliased term (US→UK etc.) but cache under the original name.
  const query = aliasIngredient(name);
  // CoFID is local (free); OFF is networked (throttled). When CoFID already has
  // a credible whole-food match, skip the OFF call entirely — it keeps re-runs
  // fast and avoids OFF snack products competing with a real food.
  const cofidRaw = searchCofid(query, 3);
  const off =
    (cofidRaw[0]?.score ?? 0) >= 0.6 ? [] : await searchProduct(query, 3);

  // Prefer the whole-food DB: when CoFID has a credible match (>=0.5) boost it so
  // a real food beats an OFF snack/juice that merely shares a word (e.g. fresh
  // ginger vs a "Greens & Ginger" juice). The gate leaves genuinely-branded
  // items — where CoFID scores ~0 — to Open Food Facts.
  const COFID_BOOST = 0.4;
  const boost = (cofidRaw[0]?.score ?? 0) >= 0.5 ? COFID_BOOST : 0;
  const cofid = cofidRaw.map((c) => ({
    ...c,
    score: Math.min(1, c.score + boost),
  }));
  // Sort by score; on a tie prefer CoFID — "whole foods → CoFID" (a tie only
  // happens when CoFID has a clean base match, which is what we want to win).
  const candidates = [...cofid, ...off].sort(
    (a, b) =>
      b.score - a.score ||
      (a.source === b.source ? 0 : a.source === "cofid" ? -1 : 1),
  );

  if (candidates.length === 0) {
    return { ok: false, reason: `no candidates for "${name}"`, candidates };
  }

  const [top, next] = candidates;
  const unambiguous =
    top.score >= STRONG && (!next || top.score - next.score >= MARGIN);

  let resolution: Resolution;

  if (unambiguous) {
    resolution = toResolution(
      top,
      Math.min(top.score, 0.95),
      "single strong match",
      false,
    );
  } else if (!opts.noLlm && isLLMEnabled()) {
    const adj = await adjudicate({
      ingredient: name,
      quantity: opts.quantity,
      unit: opts.unit,
      candidates,
    });
    if (adj && adj.choiceId) {
      const chosen = candidates.find((x) => x.id === adj.choiceId)!;
      resolution = toResolution(
        chosen,
        adj.confidence,
        `llm: ${adj.reason}`,
        adj.needsReview,
      );
    } else if (adj && adj.choiceId === null) {
      return { ok: false, reason: `llm: ${adj.reason}`, candidates };
    } else {
      // LLM unavailable/failed on an ambiguous match → unverified guess: always
      // flag for review (a high token-overlap score is not a quality signal —
      // "onion" scores 1.0 against "Sour Cream & Onion").
      resolution = toResolution(top, top.score, "top-scored (llm fallback)", true);
    }
  } else {
    // Ambiguous and no LLM to disambiguate → unverified guess, always review.
    resolution = toResolution(
      top,
      top.score,
      isLLMEnabled() ? "top-scored (--no-llm)" : "top-scored (no llm key)",
      true,
    );
  }

  // Only persist confident resolutions. Caching a low-confidence guess would
  // stop a later run (with CoFID present or the LLM enabled) from retrying it.
  if (!resolution.needsReview) c[key] = resolution;
  return { ok: true, resolution };
}
