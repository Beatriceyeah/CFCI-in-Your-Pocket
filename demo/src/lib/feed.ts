import type { Direction, Evaluation, Product, SwipeRecord } from "../types";
import { isListed } from "./analytics";
import { isFeatured, rankProducts } from "./order";

interface FeedInput {
  products: Product[];
  swipes: Record<string, SwipeRecord>;
  evaluations: Evaluation[];
  /** The product version this viewer last saw, per product. */
  seen: Record<string, number>;
  interests: Direction[];
  /** The search box. */
  matches?: (p: Product) => boolean;
  now?: number;
}

/**
 * What Browse shows, in order. Ventures you passed on come back round once, at the end.
 * 1. ventures CFCI is featuring that you have not decided on
 * 2. ventures the team has updated since you last saw them (new, or passed on), most recent first
 * 3. everything new to you, by your interests and recency (see rankProducts)
 * 4. ventures you passed on once, oldest decision first. Passing on one again is final: it leaves the loop
 *    (and stays under Not interested) unless the team updates it.
 * Ventures you saved or reviewed are left out: they wait in My reviews, where a review shows what changed.
 */
export function buildFeed({ products, swipes, evaluations, seen, interests, matches = () => true, now = Date.now() }: FeedInput): Product[] {
  const reviewed = new Set(evaluations.map((e) => e.productId));
  const undecided = (p: Product) => !swipes[p.id];
  const updatedSinceSeen = (p: Product): boolean => {
    const baseline = seen[p.id] ?? swipes[p.id]?.version;
    return baseline !== undefined && (p.version ?? 1) > baseline;
  };
  // A venture passed on twice is out of the loop for good, unless the team updates it.
  const candidates = products.filter(
    (p) =>
      isListed(p) &&
      matches(p) &&
      !reviewed.has(p.id) &&
      swipes[p.id]?.direction !== "right" &&
      !(swipes[p.id]?.final && !updatedSinceSeen(p)),
  );

  const featured = rankProducts(candidates.filter((p) => undecided(p) && isFeatured(p, now)), interests, now);
  const taken = new Set(featured.map((p) => p.id));
  const updated = candidates
    .filter((p) => !taken.has(p.id) && updatedSinceSeen(p))
    .sort((a, b) => a.daysSinceUpdate - b.daysSinceUpdate);
  updated.forEach((p) => taken.add(p.id));
  const fresh = rankProducts(candidates.filter((p) => !taken.has(p.id) && undecided(p)), interests, now);
  fresh.forEach((p) => taken.add(p.id));
  const looped = candidates
    .filter((p) => !taken.has(p.id))
    .sort((a, b) => (swipes[a.id]?.at ?? "").localeCompare(swipes[b.id]?.at ?? ""));

  return [...featured, ...updated, ...fresh, ...looped];
}
