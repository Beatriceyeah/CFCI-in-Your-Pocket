import type { Product, UpdateSummary } from "../types";

const same = (a: string[], b: string[]): boolean => a.length === b.length && a.every((x, i) => x === b[i]);

const plural = (n: number, word: string): string => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * A short, plain-language summary of what a team changed. In the demo this is worked out from the difference
 * between the old listing and the update (a real version would hand the same difference to an AI model).
 */
export function summarizeUpdate(before: Product, patch: Partial<Product>, note: string): UpdateSummary {
  const points: string[] = [];
  const changed = <K extends keyof Product>(key: K): boolean => patch[key] !== undefined && patch[key] !== before[key];

  if (changed("name")) points.push(`Renamed to ${patch.name}`);
  if (changed("pitchProblem")) points.push("Rewrote the problem statement");
  if (changed("pitchSolution")) points.push("Reworded the solution");
  if (changed("tagline")) points.push("New one-sentence intro");
  if (changed("summary")) points.push("Updated the overview");
  if (patch.problems && !same(patch.problems, before.problems)) points.push("Revised the list of problems");
  if (patch.solution && !same(patch.solution, before.solution)) points.push("Revised how the solution works");
  if (patch.next && !same(patch.next, before.next)) {
    const added = patch.next.filter((n) => !before.next.includes(n)).length;
    points.push(added > 0 ? `Added ${plural(added, "next step")}` : "Revised the next steps");
  }
  if (changed("teamPhoto")) points.push("New team photo");
  if (changed("deckName")) points.push(`New slide deck: ${patch.deckName}`);

  const text = note.trim();
  return {
    headline: text ? text.charAt(0).toUpperCase() + text.slice(1) : "The team posted an update",
    points: points.length ? points.slice(0, 3) : ["Small wording changes"],
  };
}
