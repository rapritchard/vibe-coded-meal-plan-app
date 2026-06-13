// ─────────────────────────────────────────────────────────────────────────────
// src/lib/cached-store.ts
// Small helpers for the cache-first pattern shared by the localStorage-backed
// stores (ratings, notes, recipes). Supabase is the source of truth; these keep
// a synchronous localStorage mirror so the UI boots instantly and survives
// offline. (app-state.ts uses the async `storage` adapter instead and so does
// not share these helpers.)
// ─────────────────────────────────────────────────────────────────────────────

/** Synchronous JSON read from localStorage. Returns `fallback` on miss/parse
 * error so callers can use it as initial React state. */
export function readCache<T>(key: string, fallback: T): T {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return fallback;
    return JSON.parse(cached) as T;
  } catch {
    return fallback;
  }
}

/** JSON write to localStorage. Storage full / unavailable is non-fatal — the
 * in-memory state still works. */
export function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // non-fatal
  }
}

/**
 * Cache-first load. Runs `fetcher` (typically a Supabase query); on a non-null
 * result, refreshes the cache and returns it. On null / throw / offline, returns
 * the cached value (or `fallback`). Never throws.
 */
export async function loadCached<T>(
  key: string,
  fallback: T,
  fetcher: () => Promise<T | null>,
): Promise<T> {
  try {
    const fresh = await fetcher();
    if (fresh != null) {
      writeCache(key, fresh);
      return fresh;
    }
  } catch {
    // fall through to cache
  }
  return readCache(key, fallback);
}

/**
 * Optimistically mutate a cached `Record<string, V>` map: read it, apply
 * `mutate`, write it back. Used for the per-item ratings/notes stores before the
 * fire-and-forget Supabase write.
 */
export function mutateCachedMap<V>(
  key: string,
  mutate: (map: Record<string, V>) => void,
): void {
  const map = readCache<Record<string, V>>(key, {});
  mutate(map);
  writeCache(key, map);
}
