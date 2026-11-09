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

const TEAM_ROLE = /founder|team member|member|advisor|lead|officer/i;
const FACULTY = /faculty|professor/i;
const DEGREE = /phd|master|meng|graduate|candidate|student|undergrad/i;

/**
 * Splits a person's free-text description into labeled facts. "PhD" or "Master's Student" is a degree, like a
 * year, so it is never shown as a role. A role is what they do on the team: Co-founder, Team member, Faculty.
 */
export function describeMember(m: TeamMember): [string, string][] {
  let role = "";
  let degree = "";
  const program: string[] = [];
  let school = "";
  for (const part of m.role.split(",").map((x) => x.trim()).filter(Boolean)) {
    if (FACULTY.test(part)) role = role || part;
    else if (TEAM_ROLE.test(part)) role = role || part;
    else if (DEGREE.test(part)) degree = degree || part;
    else if (/university/i.test(part)) school = part;
    else program.push(part);
  }
  const year = m.year ? (/^year/i.test(m.year) ? m.year : `Year ${m.year}`) : "";
  const out: [string, string][] = [];
  if (role) out.push(["Role", role]);
  // Degree and year are both where someone is in their studies, so they share a line.
  const stage = [degree, year].filter(Boolean).join(" · ");
  if (stage) out.push(["Degree", stage]);
  if (program.length) out.push(["Program", program.join(", ")]);
  if (school) out.push(["School", school]);
  return out;
}
