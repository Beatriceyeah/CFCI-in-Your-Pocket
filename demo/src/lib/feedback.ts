import type { DimensionKey, Evaluation } from "../types";

export type FeedbackField = DimensionKey | "general";

export interface FeedbackItem {
  key: string;
  evalId: string;
  viewerLabel: string;
  viewerName: string;
  at: string;
  field: FeedbackField;
  text: string;
  rating?: number;
}

/** Flattens evaluations into individual comments: one per lens note, plus overall comments and intro offers. */
export function feedbackItems(evaluations: Evaluation[]): FeedbackItem[] {
  const items: FeedbackItem[] = [];
  for (const e of evaluations) {
    const base = { evalId: e.id, viewerLabel: e.viewerLabel, viewerName: e.viewerName ?? e.viewerLabel, at: e.at };
    (Object.keys(e.notes) as DimensionKey[]).forEach((dim) => {
      const text = e.notes[dim]?.trim();
      if (text) items.push({ ...base, key: `${e.id}:${dim}`, field: dim, text, rating: e.ratings[dim] });
    });
    if (e.comment) items.push({ ...base, key: `${e.id}:general`, field: "general", text: e.comment });
    if (e.reactions.intro) {
      items.push({
        ...base,
        key: `${e.id}:intro`,
        field: "general",
        text: e.introNote ? `Offers an intro: ${e.introNote}` : "Offers to introduce you to someone",
      });
    }
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
}

export function groupBy<T>(items: T[], keyOf: (item: T) => string): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = keyOf(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return [...map.entries()];
}
