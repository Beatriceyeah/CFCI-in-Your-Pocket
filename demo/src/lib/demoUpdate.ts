import type { Evaluation, Product, SwipeRecord } from "../types";
import { isListed } from "./analytics";
import { updatedForViewer, updatedPassedForViewer, updatedSavedForViewer } from "./updates";

interface Activity {
  products: Product[];
  swipes: Record<string, SwipeRecord>;
  evaluations: Evaluation[];
  seen: Record<string, number>;
}

export interface DemoUpdate {
  product: Product;
  patch: Partial<Product>;
  note: string;
}

/**
 * For the demo: an update a team could have just posted, on a venture the viewer follows (reviewed first, then saved,
 * then passed on), preferring one that has no update waiting yet. It reworks the solution line and adds a next step,
 * so the overview has something to mark. Returns null when the viewer follows nothing yet.
 */
export function pickDemoUpdate(activity: Activity): DemoUpdate | null {
  const { products, swipes, evaluations } = activity;
  const waiting = new Set(
    [...updatedForViewer(activity), ...updatedSavedForViewer(activity), ...updatedPassedForViewer(activity)].map((p) => p.id),
  );
  const reviewed = new Set(evaluations.map((e) => e.productId));
  const rank = (p: Product): number => (reviewed.has(p.id) ? 0 : swipes[p.id]?.direction === "right" ? 1 : 2) + (waiting.has(p.id) ? 3 : 0);
  const followed = products.filter((p) => isListed(p) && (reviewed.has(p.id) || swipes[p.id]));
  const product = [...followed].sort((a, b) => rank(a) - rank(b))[0];
  if (!product) return null;

  const base = product.pitchSolution.replace(/\s*\.$/, "");
  return {
    product,
    patch: {
      pitchSolution: `${base}. Early pilot data now backs it up.`,
      next: ["Present the pilot results to the first design partner", ...product.next],
    },
    note: "added early pilot data and a design-partner next step",
  };
}
