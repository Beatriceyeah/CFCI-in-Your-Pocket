import type { DimensionKey, Direction, ReactionKey, SkipReason, Stage } from "../types";

export interface Dimension {
  key: DimensionKey;
  label: string;
  prompt: string;
  /** Required lenses can be judged from the card alone; the rest are optional. */
  required: boolean;
  unsureLabel: string;
  notePrompts: { low: string; mid: string; high: string };
}

// Business lenses an investor or alum scores. Three can be judged from the card; "unsure" counts as an answer.
export const DIMENSIONS: Dimension[] = [
  {
    key: "problem",
    required: true,
    label: "Problem",
    prompt: "How painful and urgent is the problem?",
    unsureLabel: "Not sure about this problem yet",
    notePrompts: {
      low: "Why is this not a real pain point?",
      mid: "What would make this problem more urgent?",
      high: "Why does this feel like a real pain point?",
    },
  },
  {
    key: "market",
    required: true,
    label: "Market",
    prompt: "Is the market big enough to matter?",
    unsureLabel: "Not sure about this market yet",
    notePrompts: {
      low: "Why do you think this market is too small or hard to reach?",
      mid: "What would you need to see to believe in the market size?",
      high: "Why do you think this is a good market?",
    },
  },
  {
    key: "edge",
    required: true,
    label: "Edge",
    prompt: "Is the solution clearly better than the alternatives?",
    unsureLabel: "Not sure how it compares yet",
    notePrompts: {
      low: "What makes this easy to beat or copy?",
      mid: "Where is the difference still unclear?",
      high: "What makes this clearly better than the alternatives?",
    },
  },
  {
    key: "readiness",
    required: false,
    label: "Readiness",
    prompt: "Is the evidence and traction credible for this stage?",
    unsureLabel: "Hard to judge at this stage",
    notePrompts: {
      low: "What evidence is missing at this stage?",
      mid: "Which milestone would raise your confidence?",
      high: "What makes the traction convincing?",
    },
  },
  {
    key: "revenue",
    required: false,
    label: "Path to revenue",
    prompt: "Is there a believable buyer and business model?",
    unsureLabel: "Not sure about the business model yet",
    notePrompts: {
      low: "Why is the buyer or business model unclear?",
      mid: "What would you need to know about the buyer or pricing?",
      high: "Why do you believe someone will pay for this?",
    },
  },
];

export const notePromptFor = (d: Dimension, rating: number): string =>
  rating <= 2 ? d.notePrompts.low : rating === 3 ? d.notePrompts.mid : d.notePrompts.high;

export const RATING_WORDS = ["Weak", "Fair", "Okay", "Good", "Strong"];

export const REACTIONS: { key: ReactionKey; label: string; hint: string }[] = [
  { key: "use", label: "Would use", hint: "I or my organization would try this" },
  { key: "invest", label: "Would invest", hint: "I would consider funding this" },
  { key: "intro", label: "Would intro", hint: "I can introduce the team to someone" },
];

export const SKIP_REASONS: { key: SkipReason; label: string }[] = [
  { key: "not_my_area", label: "Not my area" },
  { key: "too_early", label: "Too early" },
  { key: "unclear_need", label: "Unclear need" },
  { key: "small_market", label: "Market too small" },
];

export const DIRECTIONS: { key: Direction; label: string; blurb: string }[] = [
  { key: "health", label: "Health", blurb: "Clinical tools, devices and care delivery" },
  { key: "software", label: "Software & AI", blurb: "Platforms, data and decision support" },
  { key: "hardware", label: "Hardware", blurb: "Sensors, imaging and devices" },
  { key: "research", label: "Research", blurb: "Science-led platforms and new materials" },
];

export const STAGE_NOTE: Record<Stage, string> = {
  "Early research": "Lab or concept work, no working prototype yet",
  Prototype: "Working prototype or demo exists",
  Validating: "Customer discovery and evidence in progress",
};

export const directionLabel = (d: Direction): string =>
  DIRECTIONS.find((x) => x.key === d)?.label ?? d;
