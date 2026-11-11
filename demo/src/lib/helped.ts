import type { Evaluation } from "../types";

// How many teams this viewer has helped: only reviews they wrote themselves count, not the sample history the demo
// starts with (those ids begin with "eval-sample"). The number starts at 0 and grows as they review.
export const helpedCount = (evaluations: Evaluation[]): number =>
  evaluations.filter((e) => !e.id.startsWith("eval-sample")).length;
