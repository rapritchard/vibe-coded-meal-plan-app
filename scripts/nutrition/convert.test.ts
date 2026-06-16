import { describe, expect, it } from "vitest";

import { aliasIngredient, convertToGrams, normalizeName } from "./convert";

describe("aliasIngredient", () => {
  it("maps US names to UK search terms", () => {
    expect(aliasIngredient("Cilantro")).toBe("fresh coriander leaves");
    expect(aliasIngredient("All-purpose flour")).toBe("plain flour");
    expect(aliasIngredient("Sea salt")).toBe("salt");
    expect(aliasIngredient("Bok choy")).toBe("pak choi");
  });
  it("passes through unknown names (normalised)", () => {
    expect(aliasIngredient("Onion")).toBe("onion");
  });
});

describe("normalizeName", () => {
  it("strips comma suffixes, parentheticals, and case", () => {
    expect(normalizeName("Black beans, drained (400g tin)")).toBe("black beans");
    expect(normalizeName("Garlic cloves, finely minced")).toBe("garlic cloves");
    expect(normalizeName("  Crumpets  ")).toBe("crumpets");
  });
});

describe("convertToGrams", () => {
  it("converts mass units directly", () => {
    expect(convertToGrams(200, "g", "tofu").grams).toBe(200);
    expect(convertToGrams(1, "kg", "flour").grams).toBe(1000);
    expect(convertToGrams(250, "ml", "milk").grams).toBe(250);
  });

  it("uses the per-item table for count units", () => {
    expect(convertToGrams(2, "", "Crumpets").grams).toBe(120);
    expect(convertToGrams(1, "", "Banana").grams).toBe(118);
    expect(convertToGrams(3, "", "garlic cloves").grams).toBe(9);
  });

  it("resolves '<name> <unit>' count keys (cloves, sticks)", () => {
    expect(convertToGrams(2, "cloves", "Garlic").grams).toBe(6);
    expect(convertToGrams(1, "clove", "Garlic").grams).toBe(3);
    expect(convertToGrams(1, "stick", "Celery").grams).toBe(40);
  });

  it("uses volume table for spoons/pinches", () => {
    expect(convertToGrams(1, "tbsp", "oil").grams).toBe(15);
    expect(convertToGrams(1, "pinch", "cinnamon").grams).toBeCloseTo(0.36, 2);
  });

  it("uses nominal sizes for container units (tin/can/jar)", () => {
    expect(convertToGrams(1, "tin", "white beans").grams).toBe(400);
    expect(convertToGrams(2, "cans", "chopped tomatoes").grams).toBe(800);
    expect(convertToGrams(1, "jar", "passata").grams).toBe(340);
  });

  it("uses generic weights for handful/sprig and per-name for cucumber", () => {
    expect(convertToGrams(1, "handful", "Raspberries").grams).toBe(30);
    expect(convertToGrams(0.25, "", "Cucumber").grams).toBe(75);
  });

  it("falls back to a record serving size for unknown counts", () => {
    const r = convertToGrams(2, "", "exotic fruit", { servingGrams: 80 });
    expect(r.grams).toBe(160);
  });

  it("returns null with a reason when nothing applies", () => {
    const r = convertToGrams(1, "knob", "butter");
    expect(r.grams).toBeNull();
    expect(r.reason).toContain("butter");
  });
});
