import { DIMENSIONS } from "../data/dimensions";
import { SEED_EVALUATIONS, SEED_STATS } from "../data/seed";
import type { DimensionKey, Evaluation, Product, ReactionKey, SwipeRecord } from "../types";

// views = taps into the overview. shown = times the card appeared in Browse (the interest-rate base).
export interface ProductStats {
  views: number;
  shown: number;
  interested: number;
  skipped: number;
  interestRate: number;
  evaluations: Evaluation[];
  dimensionAvg: Record<DimensionKey, number | null>;
  overall: number | null;
  reactions: Record<ReactionKey, number>;
}

export const averageOf = (values: number[]): number | null =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

export function computeStats(
  product: Product,
  swipes: Record<string, SwipeRecord>,
  liveEvaluations: Evaluation[],
  opens: Record<string, number> = {},
): ProductStats {
  const seed = SEED_STATS[product.id] ?? { views: 0, opens: 0, interested: 0, skipped: 0 };
  const swipe = swipes[product.id];
  const shown = seed.views + (swipe ? 1 : 0);
  const interested = seed.interested + (swipe?.direction === "right" ? 1 : 0);
  const skipped = seed.skipped + (swipe?.direction === "left" ? 1 : 0);
  const evaluations = [
    ...SEED_EVALUATIONS.filter((e) => e.productId === product.id),
    ...liveEvaluations.filter((e) => e.productId === product.id),
  ];
  const dimensionAvg = {} as Record<DimensionKey, number | null>;
  const all: number[] = [];
  for (const d of DIMENSIONS) {
    const vals = evaluations.map((e) => e.ratings[d.key]).filter((v): v is number => v !== undefined);
    dimensionAvg[d.key] = averageOf(vals);
    all.push(...vals);
  }
  const reactions: Record<ReactionKey, number> = { use: 0, invest: 0, intro: 0 };
  for (const e of evaluations) {
    (Object.keys(reactions) as ReactionKey[]).forEach((k) => {
      if (e.reactions[k]) reactions[k] += 1;
    });
  }
  return {
    views: seed.opens + (opens[product.id] ?? 0),
    shown,
    interested,
    skipped,
    interestRate: shown ? interested / shown : 0,
    evaluations,
    dimensionAvg,
    overall: averageOf(all),
    reactions,
  };
}

export const FRESH_DAYS = 30;
export const isStale = (p: Product): boolean => p.daysSinceUpdate > FRESH_DAYS;

export const freshnessLabel = (days: number): string =>
  days === 0 ? "Updated today" : days === 1 ? "Updated yesterday" : `Updated ${days} days ago`;
