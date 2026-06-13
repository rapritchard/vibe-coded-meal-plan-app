import { beforeEach, describe, expect, it } from "vitest";

import {
  loadCached,
  mutateCachedMap,
  readCache,
  writeCache,
} from "@/lib/cached-store";

beforeEach(() => {
  localStorage.clear();
});

describe("readCache / writeCache", () => {
  it("round-trips a JSON value", () => {
    writeCache("k", { a: 1 });
    expect(readCache("k", null)).toEqual({ a: 1 });
  });

  it("returns the fallback on a miss", () => {
    expect(readCache("missing", "fallback")).toBe("fallback");
  });

  it("returns the fallback on corrupt JSON", () => {
    localStorage.setItem("bad", "{not json");
    expect(readCache("bad", [])).toEqual([]);
  });
});

describe("loadCached", () => {
  it("returns fresh data and refreshes the cache when the fetcher succeeds", async () => {
    const result = await loadCached("k", [], async () => [1, 2, 3]);
    expect(result).toEqual([1, 2, 3]);
    expect(readCache("k", [])).toEqual([1, 2, 3]);
  });

  it("falls back to the cache when the fetcher returns null", async () => {
    writeCache("k", ["cached"]);
    const result = await loadCached<string[]>("k", [], async () => null);
    expect(result).toEqual(["cached"]);
  });

  it("falls back to the cache when the fetcher throws", async () => {
    writeCache("k", ["cached"]);
    const result = await loadCached<string[]>("k", [], async () => {
      throw new Error("network");
    });
    expect(result).toEqual(["cached"]);
  });
});

describe("mutateCachedMap", () => {
  it("applies a mutation and persists it", () => {
    mutateCachedMap<number>("m", (map) => {
      map.a = 1;
    });
    mutateCachedMap<number>("m", (map) => {
      map.b = 2;
    });
    expect(readCache("m", {})).toEqual({ a: 1, b: 2 });
  });
});
