import { describe, expect, it } from "vitest";
import type { Evaluation } from "../types";
import { helpedCount } from "./helped";

const take = (id: string): Evaluation =>
  ({
    id,
    productId: id,
    viewerLabel: "Investor or alum",
    ratings: {},
    notes: {},
    reactions: { use: false, invest: false, intro: false },
    introNote: "",
    comment: "",
    at: new Date().toISOString(),
  }) as Evaluation;

describe("helpedCount", () => {
  it("starts at zero with only the sample history", () => {
    expect(helpedCount([take("eval-sample-kinema")])).toBe(0);
  });

  it("counts the viewer's own reviews", () => {
    expect(helpedCount([take("eval-sample-kinema"), take("eval-1"), take("eval-2")])).toBe(2);
  });
});
