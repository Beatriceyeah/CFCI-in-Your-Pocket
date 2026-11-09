import { describe, expect, it } from "vitest";
import { SEED_PRODUCTS } from "../data/products";
import { describeMember } from "./team";

const d = (role: string, year?: string) => describeMember({ name: "X", role, year });

describe("describeMember", () => {
  it("never shows a degree as a role", () => {
    expect(d("PhD, Co-founder", "Year 1")).toEqual([
      ["Role", "Co-founder"],
      ["Degree", "PhD · Year 1"],
    ]);
  });

  it("separates degree from program", () => {
    expect(d("PhD Candidate, Biomedical Engineering", "Year 2")).toEqual([
      ["Degree", "PhD Candidate · Year 2"],
      ["Program", "Biomedical Engineering"],
    ]);
    expect(d("Master's Student, Materials Science")).toEqual([
      ["Degree", "Master's Student"],
      ["Program", "Materials Science"],
    ]);
  });

  it("handles team members, faculty and school names", () => {
    expect(d("PhD", "Year 4")).toEqual([["Degree", "PhD · Year 4"]]);
    expect(d("Team member")).toEqual([["Role", "Team member"]]);
    expect(d("Faculty")).toEqual([["Role", "Faculty"]]);
    expect(d("Professor, Electrical Engineering")).toEqual([
      ["Role", "Professor"],
      ["Program", "Electrical Engineering"],
    ]);
    expect(d("Duke University")).toEqual([["School", "Duke University"]]);
  });

  it("never labels a degree as a role for any sample product", () => {
    for (const p of SEED_PRODUCTS)
      for (const m of p.team)
        for (const [k, v] of describeMember(m)) if (k === "Role") expect(v).not.toMatch(/phd|master|meng|candidate/i);
  });
});
