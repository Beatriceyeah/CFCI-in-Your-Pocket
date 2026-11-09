import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "../data/products";
import type { Evaluation, Product, SwipeRecord } from "../types";
import { buildFeed } from "./feed";

const proto = SEED_PRODUCTS[0]!;
const make = (id: string, extra: Partial<Product> = {}): Product => ({
  ...proto,
  id,
  status: "live",
  daysSinceUpdate: 10,
  version: 1,
  featuredUntil: undefined,
  ...extra,
});
const swipe = (id: string, direction: "left" | "right", at: string, version = 1): SwipeRecord => ({
  productId: id,
  direction,
  revisit: false,
  version,
  at,
});
const ids = (list: Product[]) => list.map((p) => p.id);
const none = { swipes: {}, evaluations: [] as Evaluation[], seen: {}, interests: [] };

describe("buildFeed", () => {
  it("puts featured first, then updated, then new, then ventures you passed on", () => {
    const products = [
      make("passed"),
      make("new"),
      make("updated", { version: 2 }),
      make("featured", { featuredUntil: new Date(Date.now() + 86_400_000).toISOString() }),
    ];
    const feed = buildFeed({
      products,
      ...none,
      swipes: { passed: swipe("passed", "left", "2026-01-01"), updated: swipe("updated", "left", "2026-01-02", 1) },
    });
    expect(ids(feed)).toEqual(["featured", "updated", "new", "passed"]);
  });

  it("brings passed ventures back oldest decision first", () => {
    const products = [make("a"), make("b")];
    const feed = buildFeed({
      products,
      ...none,
      swipes: { a: swipe("a", "left", "2026-03-01"), b: swipe("b", "left", "2026-02-01") },
    });
    expect(ids(feed)).toEqual(["b", "a"]);
  });

  it("leaves out ventures that were saved or reviewed", () => {
    const products = [make("saved"), make("reviewed"), make("open")];
    const take = { id: "e", productId: "reviewed", viewerLabel: "V", ratings: {}, notes: {}, reactions: { use: false, invest: false, intro: false }, introNote: "", comment: "", at: "x" } as Evaluation;
    const feed = buildFeed({ products, ...none, swipes: { saved: swipe("saved", "right", "2026-01-01") }, evaluations: [take] });
    expect(ids(feed)).toEqual(["open"]);
  });

  it("stops treating a venture as updated once its latest version has been seen", () => {
    const products = [make("a", { version: 2 }), make("b")];
    const feed = buildFeed({
      products,
      ...none,
      swipes: { a: swipe("a", "left", "2026-01-01", 1), b: swipe("b", "left", "2026-02-01") },
      seen: { a: 2 },
    });
    expect(ids(feed)).toEqual(["a", "b"]); // both are passed, oldest first, a is no longer pushed up
  });

  it("does not count a venture you have never seen as updated", () => {
    const products = [make("n1", { version: 3 }), make("n2", { version: 1, daysSinceUpdate: 1 })];
    expect(ids(buildFeed({ products, ...none }))).toEqual(["n2", "n1"]); // plain recency order
  });

  it("respects the search box", () => {
    const products = [make("a"), make("b")];
    expect(ids(buildFeed({ products, ...none, matches: (p) => p.id === "b" }))).toEqual(["b"]);
  });
});
