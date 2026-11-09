import type { Evaluation, Product, SwipeRecord } from "../types";

interface ViewerActivity {
  products: Product[];
  swipes: Record<string, SwipeRecord>;
  evaluations: Evaluation[];
  /** The product version this viewer last saw, per product. */
  seen: Record<string, number>;
}

/**
 * Reviewed ventures the team has updated since this viewer last looked. Only a venture you already gave feedback on
 * has something to compare: one saved to review later simply opens at its latest version, and one you passed on
 * stays quiet.
 */
export function updatedForViewer({ products, swipes, evaluations, seen }: ViewerActivity): Product[] {
  return products.filter((p) => {
    const take = evaluations.find((e) => e.productId === p.id);
    if (!take || swipes[p.id]?.direction === "left") return false;
    const baseline = seen[p.id] ?? take.version ?? 1;
    return (p.version ?? 1) > baseline;
  });
}

/**
 * Ventures saved to review later that the team has updated since they were saved or last opened. They just open
 * at the latest version, so this only marks them; there is no "what changed" for them.
 */
export function updatedSavedForViewer({ products, swipes, evaluations, seen }: ViewerActivity): Product[] {
  return products.filter((p) => {
    const swipe = swipes[p.id];
    if (swipe?.direction !== "right" || evaluations.some((e) => e.productId === p.id)) return false;
    return (p.version ?? 1) > (seen[p.id] ?? swipe.version ?? 1);
  });
}

/**
 * Ventures the viewer passed on that the team has updated since. They stay under Not interested; this only marks
 * them (in a softer green) so a changed venture is not missed.
 */
export function updatedPassedForViewer({ products, swipes, seen }: ViewerActivity): Product[] {
  return products.filter((p) => {
    const swipe = swipes[p.id];
    if (swipe?.direction !== "left") return false;
    return (p.version ?? 1) > (seen[p.id] ?? swipe.version ?? 1);
  });
}
