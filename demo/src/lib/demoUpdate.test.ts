import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "../data/products";
import type { Evaluation, SwipeRecord } from "../types";
import { pickDemoUpdate } from "./demoUpdate";

const swipe = (id: string, direction: "left" | "right"): SwipeRecord => ({ productId: id, direction, revisit: false, version: 1, at: "2026-01-01" });
const take = (id: string): Evaluation => ({
  id: `e-${id}`, productId: id, viewerLabel: "V", ratings: {}, notes: {}, reactions: { use: false, invest: false, intro: false }, introNote: "", comment: "", version: 1, at: "x",
});
const base = { products: SEED_PRODUCTS, swipes: {}, evaluations: [] as Evaluation[], seen: {} };

describe("pickDemoUpdate", () => {
  it("has nothing to update when the viewer follows nothing", () => {
    expect(pickDemoUpdate(base)).toBeNull();
  });

  it("prefers a reviewed venture, then a saved one, then one passed on", () => {
    const out = pickDemoUpdate({ ...base, swipes: { "er-guide": swipe("er-guide", "left"), falcon: swipe("falcon", "right") }, evaluations: [take("ai-compliance")] });
    expect(out?.product.id).toBe("ai-compliance");
    expect(pickDemoUpdate({ ...base, swipes: { "er-guide": swipe("er-guide", "left"), falcon: swipe("falcon", "right") } })?.product.id).toBe("falcon");
  });

  it("changes the solution and adds a next step", () => {
    const out = pickDemoUpdate({ ...base, swipes: { falcon: swipe("falcon", "right") } })!;
    expect(out.patch.pitchSolution).not.toBe(out.product.pitchSolution);
    expect(out.patch.next?.[0]).toMatch(/pilot results/);
  });
});
