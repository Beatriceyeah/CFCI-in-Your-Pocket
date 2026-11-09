import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "../data/products";
import { averageOf, computeStats, daysUntilDelist, isDelisted, isListed, isStale, wasUpdatedRecently } from "./analytics";

describe("analytics", () => {
  it("averages and handles empty input", () => {
    expect(averageOf([2, 4])).toBe(3);
    expect(averageOf([])).toBeNull();
  });

  it("adds a live right swipe to the sample interest count", () => {
    const product = SEED_PRODUCTS[0]!;
    const base = computeStats(product, {}, []);
    const swiped = computeStats(
      product,
      { [product.id]: { productId: product.id, direction: "right", revisit: false, at: "" } },
      [],
    );
    expect(swiped.shown).toBe(base.shown + 1);
    expect(swiped.interested).toBe(base.interested + 1);
  });

  it("flags listings between 30 and 60 days as stale, and delists them after 60", () => {
    const stale = SEED_PRODUCTS.find((p) => p.id === "cnt-solar")!;
    expect(isStale(stale)).toBe(true);
    expect(isListed(stale)).toBe(true);
    expect(daysUntilDelist(stale)).toBe(60 - stale.daysSinceUpdate);
    const old = SEED_PRODUCTS.find((p) => p.id === "continuous-lhmf")!;
    expect(isDelisted(old)).toBe(true);
    expect(isListed(old)).toBe(false);
    expect(isStale(SEED_PRODUCTS[0]!)).toBe(false);
  });

  it("tags recently updated listings", () => {
    expect(wasUpdatedRecently(SEED_PRODUCTS.find((p) => p.id === "circadian-labs")!)).toBe(true);
    expect(wasUpdatedRecently(SEED_PRODUCTS.find((p) => p.id === "ontbi")!)).toBe(false);
  });

  it("weights deeper engagement double", () => {
    const product = SEED_PRODUCTS[0]!;
    const s = computeStats(product, {}, [], {}, []);
    const rated = s.evaluations.filter((e) => Object.keys(e.ratings).length > 0).length;
    expect(s.engagement).toBe(s.views + s.interested + 2 * rated + 2 * s.comments + 2 * s.introRequests);
    const withIntro = computeStats(product, {}, [], {}, [
      { id: "c", productId: product.id, fromName: "", fromRole: "", fromEmail: "", message: "", status: "pending", at: "" },
    ]);
    expect(withIntro.engagement).toBe(s.engagement + 2);
  });

  it("splits interest before and after an update", () => {
    const updated = SEED_PRODUCTS.find((p) => p.id === "circadian-labs")!;
    const s = computeStats(updated, {}, []);
    expect(s.versions).not.toBeNull();
    expect(computeStats(SEED_PRODUCTS.find((p) => p.id === "ontbi")!, {}, []).versions).toBeNull();
  });
});

describe("feedbackItems", () => {
  it("splits lens notes, overall comments and intro offers into separate items", async () => {
    const { feedbackItems } = await import("./feedback");
    const items = feedbackItems([
      {
        id: "e1",
        productId: "p",
        viewerLabel: "Angel investor",
        ratings: { market: 4 },
        notes: { market: "Good market" },
        reactions: { use: false, invest: false, intro: true },
        introNote: "A clinic",
        comment: "Nice work",
        at: "2026-10-01T00:00:00.000Z",
      },
    ]);
    expect(items.map((i) => i.field).sort()).toEqual(["general", "general", "market"]);
    expect(items.find((i) => i.field === "market")?.rating).toBe(4);
  });
});

describe("rankProducts", () => {
  it("puts featured first, then interests, then the rest by freshness", async () => {
    const { rankProducts } = await import("./order");
    const now = Date.now();
    const base = SEED_PRODUCTS[0]!;
    const make = (id: string, category: "health" | "software", days: number, featured = false) => ({
      ...base,
      id,
      category,
      daysSinceUpdate: days,
      featuredUntil: featured ? new Date(now + 86_400_000).toISOString() : undefined,
    });
    const ranked = rankProducts(
      [make("old-health", "health", 30), make("new-soft", "software", 1), make("feat", "software", 50, true), make("new-health", "health", 2)],
      ["health"],
      now,
    );
    expect(ranked.map((p) => p.id)).toEqual(["feat", "new-health", "old-health", "new-soft"]);
  });

  it("stops featuring once the end date has passed", async () => {
    const { isFeatured } = await import("./order");
    const base = SEED_PRODUCTS[0]!;
    expect(isFeatured({ ...base, featuredUntil: new Date(Date.now() - 1000).toISOString() })).toBe(false);
  });
});
