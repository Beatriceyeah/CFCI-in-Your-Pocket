import type { TeamMember } from "../types";

/** "PhD Candidate, Biomedical Engineering" becomes "PhD Candidate · Biomedical Engineering". */
export const teamDetail = (role: string): string =>
  role
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" · ");

export const teamLine = (m: TeamMember): string => [m.name, teamDetail(m.role)].filter(Boolean).join(" · ");
