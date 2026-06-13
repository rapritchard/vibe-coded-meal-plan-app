import { describe, expect, it } from "vitest";

import { anyRecipeToRow, rowToAnyRecipe } from "./recipes-supabase";
import type { Recipe, Snack } from "@/types";

// These two functions are the boundary between the Supabase row shape
// (structured columns + jsonb `data`) and the discriminated AnyRecipe union.
// A round-trip is the cheapest way to catch a field that was added to a type
// but forgotten in one of the two mappers.

const sampleRecipe: Recipe = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "test-porridge",
  type: "recipe",
  name: "Test porridge",
  moods: ["Creamy", "Sweet"],
  effort: "quick-cook",
  isBatch: false,
  goodOnTheGo: false,
  nutrition: null,
  phase: 1,
  category: "breakfast",
  time: "10 min",
  serves: "1",
  timeKey: "⚡",
  leadTime: null,
  ingredients: [["Rolled oats", 50, "g"]],
  toolAlts: [{ tool: "Hob", note: "Stir often" }],
  parallelTasks: [],
  steps: ["Cook oats", "Top with berries"],
  tip: "Use frozen berries",
  variations: ["Add banana"],
  variationSteps: [null],
};

const sampleSnack: Snack = {
  id: "22222222-2222-2222-2222-222222222222",
  slug: "test-banana",
  type: "snack",
  name: "Banana",
  moods: ["Sweet"],
  effort: "ready",
  isBatch: false,
  goodOnTheGo: true,
  nutrition: null,
  category: "snack",
  badge: "Medication buffer",
  desc: "Grab and go",
};

describe("recipe row mapping", () => {
  it("round-trips a full Recipe through row form unchanged", () => {
    const round = rowToAnyRecipe(anyRecipeToRow(sampleRecipe));
    expect(round).toEqual(sampleRecipe);
  });

  it("round-trips a Snack through row form unchanged", () => {
    const round = rowToAnyRecipe(anyRecipeToRow(sampleSnack));
    expect(round).toEqual(sampleSnack);
  });

  it("lifts denormalised columns out of the jsonb data blob", () => {
    const row = anyRecipeToRow(sampleRecipe);
    expect(row.is_batch).toBe(false);
    expect(row.good_on_the_go).toBe(false);
    // Structured columns must not be duplicated inside the jsonb payload.
    expect(row.data).not.toHaveProperty("isBatch");
    expect(row.data).not.toHaveProperty("name");
    // Recipe-specific fields belong in the jsonb payload.
    expect(row.data).toHaveProperty("steps");
  });

  it("degrades a malformed jsonb data blob to safe defaults", () => {
    // A row whose data has wrong types / missing fields must not throw — each
    // field falls back to its zod `.catch` default (this is the whole point of
    // hardening the mapper).
    const row = {
      id: "33333333-3333-3333-3333-333333333333",
      slug: "broken",
      type: "recipe" as const,
      category: "lunch",
      name: "Broken recipe",
      moods: ["Creamy", "NotARealMood"] as never,
      effort: "quick-cook" as const,
      is_batch: false,
      good_on_the_go: false,
      data: { steps: "not-an-array", ingredients: 42, timeKey: "🤷" },
      nutrition: null,
    };

    const result = rowToAnyRecipe(row);
    expect(result.type).toBe("recipe");
    if (result.type !== "recipe") return;
    expect(result.steps).toEqual([]);
    expect(result.ingredients).toEqual([]);
    expect(result.timeKey).toBe("⚡");
    // Unknown moods are filtered out of the column array.
    expect(result.moods).toEqual(["Creamy"]);
  });
});
