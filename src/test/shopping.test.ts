import { describe, expect, it } from "vitest";

import { createEmptyWeek, generateShoppingList } from "@/lib/shopping";
import type { CustomWeek, Recipe } from "@/types";

function makeRecipe(name: string, ingredients: string[]): Recipe {
  return {
    id: name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    type: "recipe",
    name,
    moods: [],
    effort: "quick-cook",
    isBatch: false,
    goodOnTheGo: false,
    nutrition: null,
    category: "dinner",
    time: "",
    serves: "",
    timeKey: "⚡",
    leadTime: null,
    ingredients: ingredients.map(
      (i) => [i, 1, "unit"] as [string, number, string],
    ),
    toolAlts: [],
    parallelTasks: [],
    steps: [],
    tip: "",
    variations: [],
    variationSteps: [],
  };
}

describe("createEmptyWeek", () => {
  it("creates a blank slot for every day and meal", () => {
    const week = createEmptyWeek();
    expect(Object.keys(week)).toHaveLength(7);
    for (const day of Object.values(week)) {
      expect(day).toEqual({ breakfast: "", lunch: "", dinner: "" });
    }
  });
});

describe("generateShoppingList", () => {
  const recipes = [
    makeRecipe("Carrot soup", ["Carrots", "Vegetable stock"]),
    makeRecipe("Tofu rice bowl", ["Tofu", "Rice"]),
    makeRecipe("Unused dish", ["Dragonfruit"]),
  ];

  function weekWith(meals: Partial<Record<string, string>>): CustomWeek {
    const week = createEmptyWeek();
    week.Monday = {
      breakfast: meals.breakfast ?? "",
      lunch: meals.lunch ?? "",
      dinner: meals.dinner ?? "",
    };
    return week;
  }

  it("includes ingredients only from selected recipes", () => {
    const list = generateShoppingList(
      weekWith({ lunch: "Carrot soup", dinner: "Tofu rice bowl" }),
      recipes,
    );
    const allItems = Object.values(list).flat();
    expect(allItems).toEqual(
      expect.arrayContaining(["Carrots", "Vegetable stock", "Tofu", "Rice"]),
    );
    // An unselected recipe's ingredients must not appear.
    expect(allItems).not.toContain("Dragonfruit");
  });

  it("returns an empty object for an empty week", () => {
    expect(generateShoppingList(createEmptyWeek(), recipes)).toEqual({});
  });

  it("deduplicates an ingredient shared by two selected recipes", () => {
    const overlap = [
      makeRecipe("Dish A", ["Rice", "Carrots"]),
      makeRecipe("Dish B", ["Rice", "Tofu"]),
    ];
    const list = generateShoppingList(
      weekWith({ lunch: "Dish A", dinner: "Dish B" }),
      overlap,
    );
    const allItems = Object.values(list).flat();
    expect(allItems.filter((i) => i === "Rice")).toHaveLength(1);
  });
});
