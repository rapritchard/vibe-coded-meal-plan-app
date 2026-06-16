import { describe, expect, it } from "vitest";

import {
  aggregate,
  parseServes,
  perServing,
  saltToSodiumMg,
} from "./aggregate";
import type { Per100g } from "./types";

const banana: Per100g = {
  calories: 89,
  protein_g: 1.1,
  carbs_g: 23,
  fat_g: 0.3,
  fibre_g: 2.6,
  sugar_g: 12,
};

describe("parseServes", () => {
  it("extracts the first integer, defaulting to 1", () => {
    expect(parseServes("2")).toBe(2);
    expect(parseServes("Serves 4")).toBe(4);
    expect(parseServes("1-2")).toBe(1);
    expect(parseServes(undefined)).toBe(1);
    expect(parseServes("lots")).toBe(1);
  });
});

describe("saltToSodiumMg", () => {
  it("converts grams of salt to mg of sodium", () => {
    expect(saltToSodiumMg(1)).toBe(400);
    expect(saltToSodiumMg(0.5)).toBe(200);
  });
});

describe("aggregate + perServing", () => {
  it("scales per-100g by grams and sums", () => {
    const total = aggregate([{ name: "banana", grams: 118, per100g: banana }]);
    expect(total.calories).toBe(105); // 89 * 1.18
    expect(total.carbs_g).toBeCloseTo(27.1, 1);
    expect(total.sugar_g).toBeCloseTo(14.2, 1);
  });

  it("divides totals by servings and stores yieldServings:1", () => {
    const total = aggregate([{ name: "banana", grams: 236, per100g: banana }]);
    const { yieldServings, total: ps } = perServing(total, "2");
    expect(yieldServings).toBe(1);
    expect(ps.calories).toBe(105); // 2 bananas / 2 servings
  });
});
