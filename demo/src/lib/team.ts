import type { Product, TeamMember } from "../types";

/** "PhD Candidate, Biomedical Engineering" becomes "PhD Candidate · Biomedical Engineering". */
export const teamDetail = (role: string): string =>
  role
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ");

export const teamLine = (m: TeamMember): string =>
  [m.name, teamDetail(m.role), m.year].filter(Boolean).join(" · ");

export const isFaculty = (m: TeamMember): boolean => /Faculty|Professor/.test(m.role);

/** Students first, advisors last. */
export const students = (p: Product): TeamMember[] => p.team.filter((m) => !isFaculty(m));

/** "Student team of 2 · Year 2–3" */
export function teamSummary(p: Product): string {
  const s = students(p);
  const years = s.map((m) => m.year).filter((y): y is string => !!y);
  const nums = years.map((y) => Number(y.replace(/\D/g, ""))).filter((n) => n > 0);
  const span = nums.length
    ? Math.min(...nums) === Math.max(...nums)
      ? `Year ${nums[0]}`
      : `Years ${Math.min(...nums)}–${Math.max(...nums)}`
    : "";
  return [`Student team of ${s.length || p.team.length}`, span].filter(Boolean).join(" · ");
}
