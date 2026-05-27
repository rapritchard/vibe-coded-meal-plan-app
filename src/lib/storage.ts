// ─────────────────────────────────────────────────────────────────────────────
// src/lib/storage.ts
// Platform-agnostic storage adapter.
//
// Inside the Claude artifact sandbox, `window.storage` is available and is
// used automatically. Outside (Vercel / Netlify / local dev), the adapter
// falls back to localStorage with the same async interface so no other file
// needs to change.
// ─────────────────────────────────────────────────────────────────────────────

interface StorageResult {
  key: string;
  value: string;
  shared: boolean;
}

interface StorageAdapter {
  get(key: string, shared?: boolean): Promise<StorageResult | null>;
  set(key: string, value: string, shared?: boolean): Promise<StorageResult | null>;
  delete(key: string, shared?: boolean): Promise<{ key: string; deleted: boolean; shared: boolean } | null>;
  list(prefix?: string, shared?: boolean): Promise<{ keys: string[]; prefix?: string; shared: boolean } | null>;
}

// ── Detect which environment we are in ───────────────────────────────────────

function isClaudeArtifact(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as unknown as Record<string, unknown>).storage === "object" &&
    (window as unknown as Record<string, unknown>).storage !== null
  );
}

// ── localStorage adapter ──────────────────────────────────────────────────────

const localAdapter: StorageAdapter = {
  async get(key) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      return { key, value, shared: false };
    } catch {
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return { key, value, shared: false };
    } catch {
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    } catch {
      return null;
    }
  },

  async list(prefix) {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        prefix ? k.startsWith(prefix) : true
      );
      return { keys, prefix, shared: false };
    } catch {
      return null;
    }
  },
};

// ── Claude artifact adapter (thin proxy onto window.storage) ─────────────────

function makeClaudeAdapter(): StorageAdapter {
  // window.storage is only present at runtime inside the artifact sandbox.
  // We cast through unknown to avoid TypeScript errors in the build.
  const ws = (window as unknown as { storage: StorageAdapter }).storage;
  return {
    get: (key, shared) => ws.get(key, shared),
    set: (key, value, shared) => ws.set(key, value, shared),
    delete: (key, shared) => ws.delete(key, shared),
    list: (prefix, shared) => ws.list(prefix, shared),
  };
}

// ── Exported singleton ────────────────────────────────────────────────────────

export const storage: StorageAdapter = isClaudeArtifact()
  ? makeClaudeAdapter()
  : localAdapter;
