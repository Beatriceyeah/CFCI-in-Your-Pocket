import { DIMENSIONS } from "../data/dimensions";
import { SEED_EVALUATIONS, SEED_STATS, SEED_VERSION_STATS } from "../data/seed";
import type { Connection, DimensionKey, Evaluation, Product, ReactionKey, SwipeRecord } from "../types";

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
  /** Written comments: lens notes plus overall comments. */
  comments: number;
  partial: number;
  introRequests: number;
  /** Any engagement counts once; deeper engagement (a rating, a comment, an intro request) counts double. */
  engagement: number;
  /** Interest rate before and after the latest update, only for listings that have been updated. */
  versions: { before: number; after: number } | null;
}

export const commentCount = (e: Evaluation): number =>
  Object.values(e.notes).filter((t) => !!t?.trim()).length + (e.comment.trim() ? 1 : 0);

export const averageOf = (values: number[]): number | null =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;

export function computeStats(
  product: Product,
  swipes: Record<string, SwipeRecord>,
  liveEvaluations: Evaluation[],
  opens: Record<string, number> = {},
  connections: Connection[] = [],
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
  const views = seed.opens + (opens[product.id] ?? 0);
  const comments = evaluations.reduce((n, e) => n + commentCount(e), 0);
  const introRequests = connections.filter((c) => c.productId === product.id).length;
  const rated = evaluations.filter((e) => Object.keys(e.ratings).length > 0).length;

  let versions: ProductStats["versions"] = null;
  const latest = product.version ?? 1;
  const vs = SEED_VERSION_STATS[product.id];
  if (latest > 1 && vs) {
    let bShown = vs.before.shown;
    let bInt = vs.before.interested;
    let aShown = vs.after.shown;
    let aInt = vs.after.interested;
    if (swipe) {
      const after = (swipe.version ?? 1) >= latest;
      if (after) {
        aShown += 1;
        if (swipe.direction === "right") aInt += 1;
      } else {
        bShown += 1;
        if (swipe.direction === "right") bInt += 1;
      }
    }
    versions = { before: bShown ? bInt / bShown : 0, after: aShown ? aInt / aShown : 0 };
  }

  return {
    views,
    shown,
    interested,
    skipped,
    interestRate: shown ? interested / shown : 0,
    evaluations,
    dimensionAvg,
    overall: averageOf(all),
    reactions,
    comments,
    partial: evaluations.filter((e) => e.partial).length,
    introRequests,
    engagement: views + interested + 2 * rated + 2 * comments + 2 * introRequests,
    versions,
  };
}

export const FRESH_DAYS = 30;
/** Listings that have not been updated in this many days leave Browse until the team posts an update. */
export const DELIST_DAYS = 60;
/** How long the "Updated" tag stays on a listing after the team posts an update. */
export const UPDATED_TAG_DAYS = 7;

export const isDelisted = (p: Product): boolean => p.status === "live" && p.daysSinceUpdate > DELIST_DAYS;
/** Live but past the reminder point: staff should nudge the team. */
export const isStale = (p: Product): boolean =>
  p.status === "live" && p.daysSinceUpdate > FRESH_DAYS && p.daysSinceUpdate <= DELIST_DAYS;
export const isListed = (p: Product): boolean => p.status === "live" && !isDelisted(p);
export const daysUntilDelist = (p: Product): number => Math.max(0, DELIST_DAYS - p.daysSinceUpdate);
export const wasUpdatedRecently = (p: Product): boolean =>
  (p.version ?? 1) > 1 && p.daysSinceUpdate <= UPDATED_TAG_DAYS;

export const freshnessLabel = (days: number): string =>
  days === 0 ? "Updated today" : days === 1 ? "Updated yesterday" : `Updated ${days} days ago`;
