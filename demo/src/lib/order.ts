import type { Direction, Product } from "../types";

export const isFeatured = (p: Product, now: number = Date.now()): boolean =>
  !!p.featuredUntil && new Date(p.featuredUntil).getTime() > now;

/**
 * Default Browse order, for everyone:
 * 1. ventures CFCI is featuring (until their end date)
 * 2. ventures in the viewer's interests
 * 3. everything else
 * Within each group, the most recently updated listing comes first. Nothing is hidden.
 */
export function rankProducts(products: Product[], interests: Direction[], now: number = Date.now()): Product[] {
  const tier = (p: Product): number => (isFeatured(p, now) ? 0 : interests.includes(p.category) ? 1 : 2);
  return [...products].sort((a, b) => tier(a) - tier(b) || a.daysSinceUpdate - b.daysSinceUpdate);
}

export const daysLeft = (iso: string, now: number = Date.now()): number =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86_400_000));
