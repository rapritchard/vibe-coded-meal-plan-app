import { describe, expect, it } from "vitest";

import { scoreCofidName } from "./cofid";

describe("scoreCofidName", () => {
  it("ranks the plain base food above a composite dish", () => {
    // Plural query/candidate must still match (stemming), and "Bananas, raw"
    // must beat "Banana bread" despite the latter's shorter name.
    const raw = scoreCofidName("banana", "Bananas, raw, flesh only");
    const bread = scoreCofidName("banana", "Banana bread, homemade");
    expect(raw).toBeGreaterThan(bread);
  });

  it("matches across singular/plural", () => {
    expect(scoreCofidName("banana", "Bananas, raw")).toBeGreaterThan(0.8);
    expect(scoreCofidName("tomato", "Tomatoes, raw")).toBeGreaterThan(0.8);
    expect(scoreCofidName("garlic", "Garlic, raw")).toBeGreaterThan(0.8);
  });

  it("credits post-comma qualifiers (red lentils)", () => {
    const red = scoreCofidName("red lentils", "Lentils, red, split, dried");
    const green = scoreCofidName(
      "red lentils",
      "Lentils, green and brown, whole, dried",
    );
    expect(red).toBeGreaterThan(green);
  });

  it("scores an unrelated food near zero", () => {
    expect(scoreCofidName("banana", "Beef, mince, stewed")).toBe(0);
  });
});
