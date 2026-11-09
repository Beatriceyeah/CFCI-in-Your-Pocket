import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "../data/products";
import type { Evaluation, SwipeRecord } from "../types";
import { updatedForViewer, updatedPassedForViewer, updatedSavedForViewer } from "./updates";

const base = SEED_PRODUCTS.find((p) => p.id === "kinema")!; // version 2 in the sample data
const products = [base];
const swipe = (direction: "left" | "right", version?: number): Record<string, SwipeRecord> => ({
  [base.id]: { productId: base.id, direction, revisit: false, version, at: "2026-01-01" },
});
const take = (version?: number): Evaluation => ({
  id: "e1",
  productId: base.id,
  viewerLabel: "Viewer",
  ratings: {},
  notes: {},
  reactions: { use: false, invest: false, intro: false },
  introNote: "",
  comment: "",
  version,
  at: "2026-01-01",
});

describe("updatedForViewer", () => {
  it("flags a reviewed venture by the version the review was written for", () => {
    expect(updatedForViewer({ products, swipes: {}, evaluations: [take(1)], seen: {} })).toHaveLength(1);
  });

  it("stops flagging once the latest version has been seen", () => {
    expect(updatedForViewer({ products, swipes: {}, evaluations: [take(1)], seen: { kinema: 2 } })).toHaveLength(0);
  });

  it("does not flag a venture that was only saved to review later", () => {
    expect(updatedForViewer({ products, swipes: swipe("right", 1), evaluations: [], seen: { kinema: 1 } })).toHaveLength(0);
  });

  it("ignores ventures the viewer passed on or never touched", () => {
    expect(updatedForViewer({ products, swipes: swipe("left", 1), evaluations: [take(1)], seen: {} })).toHaveLength(0);
    expect(updatedForViewer({ products, swipes: {}, evaluations: [], seen: { kinema: 1 } })).toHaveLength(0);
  });
});

describe("updatedSavedForViewer", () => {
  it("flags a saved venture the team updated since", () => {
    expect(updatedSavedForViewer({ products, swipes: swipe("right", 1), evaluations: [], seen: { kinema: 1 } })).toHaveLength(1);
  });

  it("stops once the latest version was opened", () => {
    expect(updatedSavedForViewer({ products, swipes: swipe("right", 1), evaluations: [], seen: { kinema: 2 } })).toHaveLength(0);
  });

  it("leaves reviewed and passed ventures to the other rules", () => {
    expect(updatedSavedForViewer({ products, swipes: swipe("right", 1), evaluations: [take(1)], seen: {} })).toHaveLength(0);
    expect(updatedSavedForViewer({ products, swipes: swipe("left", 1), evaluations: [], seen: {} })).toHaveLength(0);
  });
});

describe("updatedPassedForViewer", () => {
  it("flags a passed venture the team updated since", () => {
    expect(updatedPassedForViewer({ products, swipes: swipe("left", 1), evaluations: [], seen: { kinema: 1 } })).toHaveLength(1);
  });

  it("stops once the latest version was opened", () => {
    expect(updatedPassedForViewer({ products, swipes: swipe("left", 1), evaluations: [], seen: { kinema: 2 } })).toHaveLength(0);
  });

  it("only looks at ventures the viewer passed on", () => {
    expect(updatedPassedForViewer({ products, swipes: swipe("right", 1), evaluations: [], seen: {} })).toHaveLength(0);
  });
});
