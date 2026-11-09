import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "../data/products";
import { summarizeUpdate } from "./updateSummary";

const product = SEED_PRODUCTS[0]!;

describe("summarizeUpdate", () => {
  it("uses the team's note as the headline", () => {
    expect(summarizeUpdate(product, {}, "added a pilot site").headline).toBe("Added a pilot site");
  });

  it("names what changed and caps the list at three", () => {
    const out = summarizeUpdate(
      product,
      {
        name: "Renamed",
        tagline: "New tagline",
        pitchProblem: "Another problem",
        pitchSolution: "Another solution",
        next: [...product.next, "A brand new step"],
      },
      "big rewrite",
    );
    expect(out.points).toHaveLength(3);
    expect(out.points[0]).toBe("Renamed to Renamed");
  });

  it("counts added next steps", () => {
    const out = summarizeUpdate(product, { next: [...product.next, "One more", "And another"] }, "x");
    expect(out.points).toContain("Added 2 next steps");
  });

  it("falls back when nothing visible changed", () => {
    expect(summarizeUpdate(product, {}, "").points).toEqual(["Small wording changes"]);
  });
});
