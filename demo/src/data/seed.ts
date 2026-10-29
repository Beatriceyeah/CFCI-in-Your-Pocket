import type { Connection, DimensionKey, Evaluation, ShareList } from "../types";
import { SEED_PRODUCTS } from "./products";

// Sample engagement from other viewers, so dashboards are not empty on first open.
// Generated deterministically; none of it is real feedback.

export interface SeedStats {
  views: number;
  opens: number;
  interested: number;
  skipped: number;
}

// Rough per-product appeal (0..1) that biases the sample ratings.
const APPEAL: Record<string, number> = {
  "circadian-labs": 0.78,
  "graphene-hall": 0.42,
  ontbi: 0.35,
  falcon: 0.72,
  "cns-immune": 0.5,
  "hf-digital-twins": 0.8,
  "clinical-sentinel": 0.7,
  "cnt-solar": 0.48,
  "ai-compliance": 0.6,
  "viewport-shield": 0.38,
  "continuous-lhmf": 0.4,
  "er-guide": 0.66,
  kinema: 0.74,
  aisleadvisor: 0.55,
  "in-pixel": 0.52,
  "fly-surgical": 0.62,
};

const VIEWERS = [
  "Angel investor",
  "VC associate",
  "Duke alum, class of 2009",
  "Healthcare operator",
  "Corporate venture partner",
  "Duke alum, class of 2015",
  "Defense tech advisor",
  "Founder, Series A",
];

// Placeholder names, one per role, so comments can show who said what.
const VIEWER_NAMES: Record<string, string> = {
  "Angel investor": "Priya Nair",
  "VC associate": "Alex Morgan",
  "Duke alum, class of 2009": "Marcus Hill",
  "Healthcare operator": "Elena Ruiz",
  "Corporate venture partner": "Dana Whitfield",
  "Duke alum, class of 2015": "Noah Kim",
  "Defense tech advisor": "Rachel Stone",
  "Founder, Series A": "Omar Haddad",
};

const COMMENTS: Record<DimensionKey, string[]> = {
  problem: [
    "The pain is real, but I would like to see how many buyers feel it weekly.",
    "Clear problem. Quote one customer in their own words on the card.",
  ],
  market: [
    "The market number looks top-down. Show a bottom-up count of buyers.",
    "Beachhead is smaller than the TAM suggests; say who pays first.",
  ],
  edge: [
    "Differentiation is convincing against the named competitors.",
    "What stops an incumbent from copying this in a year?",
  ],
  readiness: [
    "Good traction for this stage. A signed pilot would move me a lot.",
    "Evidence is thin so far; I would wait for the next milestone.",
  ],
  revenue: [
    "Who signs the purchase order? That is still unclear to me.",
    "Pricing assumption needs at least three buyer conversations behind it.",
  ],
};

type Field = DimensionKey | "general";

const HANDWRITTEN: Record<string, { field: Field; text: string }[]> = {
  "circadian-labs": [
    { field: "market", text: "Strong beachhead. Nursing homes have purchasing power. Have you spoken to a facility pharmacist?" },
    { field: "readiness", text: "FDA combination-product path is the real risk. Get a consultant opinion before the preclinical spend." },
    { field: "general", text: "I know a geriatric sleep clinic in Raleigh that would take an intro call." },
    { field: "edge", text: "Love that it avoids another pill for dysphagia patients. How long does one sticker last?" },
  ],
};

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string): number => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const DAY_MS = 86_400_000;

export const SEED_STATS: Record<string, SeedStats> = {};
export const SEED_EVALUATIONS: Evaluation[] = [];

for (const p of SEED_PRODUCTS) {
  const appeal = APPEAL[p.id] ?? 0.5;
  const rand = rng(hash(p.id));
  const views = Math.round(40 + rand() * 50 + appeal * 30);
  const interested = Math.round(views * (0.18 + appeal * 0.5));
  const opens = Math.round(views * (0.3 + appeal * 0.3));
  SEED_STATS[p.id] = { views, opens, interested, skipped: views - interested };

  const count = Math.max(3, Math.round(interested * 0.3));
  for (let i = 0; i < count; i++) {
    const ratings: Partial<Record<DimensionKey, number>> = {};
    const notes: Partial<Record<DimensionKey, string>> = {};
    (["problem", "market", "edge", "readiness", "revenue"] as const).forEach((k) => {
      const base = 1.5 + appeal * 3 + (rand() - 0.5) * 2.2;
      ratings[k] = Math.min(5, Math.max(1, Math.round(base)));
    });
    let comment = "";
    const hand = HANDWRITTEN[p.id]?.[i];
    if (hand) {
      if (hand.field === "general") comment = hand.text;
      else notes[hand.field] = hand.text;
    } else if (rand() < 0.45) {
      const dim = (["problem", "market", "edge", "readiness", "revenue"] as const)[Math.floor(rand() * 5)] ?? "problem";
      const pool = COMMENTS[dim];
      notes[dim] = pool[Math.floor(rand() * pool.length)] ?? "";
    }
    const viewerLabel = VIEWERS[Math.floor(rand() * VIEWERS.length)] ?? "Viewer";
    SEED_EVALUATIONS.push({
      id: `seed-${p.id}-${i}`,
      productId: p.id,
      viewerLabel,
      viewerName: VIEWER_NAMES[viewerLabel],
      ratings,
      notes,
      reactions: {
        use: rand() < 0.3 + appeal * 0.3,
        invest: rand() < appeal * 0.45,
        intro: rand() < 0.15 + appeal * 0.25,
      },
      introNote: "",
      comment,
      at: new Date(Date.now() - Math.floor(rand() * 20) * DAY_MS).toISOString(),
    });
  }
}

export const SEED_UNIQUE_VIEWERS = 148;

export const SEED_LISTS: ShareList[] = [
  {
    id: "list-health",
    name: "Health & MedTech showcase",
    note: "Six clinical products updated this month. We would value your read on the buyers.",
    productIds: ["circadian-labs", "hf-digital-twins", "er-guide", "kinema", "aisleadvisor", "fly-surgical"],
    recipients: "Duke Health alumni network",
    createdAt: new Date(Date.now() - 4 * DAY_MS).toISOString(),
  },
];

export const SEED_CONNECTIONS: Connection[] = [
  {
    id: "conn-seed-1",
    productId: "circadian-labs",
    fromName: "Alex Morgan",
    fromRole: "VC associate",
    fromEmail: "alex.morgan@example.com",
    message: "We back digital health companies. Would like 20 minutes to hear about your FDA plan.",
    status: "pending",
    at: new Date(Date.now() - 2 * DAY_MS).toISOString(),
  },
  {
    id: "conn-seed-2",
    productId: "circadian-labs",
    fromName: "Dana Whitfield",
    fromRole: "Corporate venture partner",
    fromEmail: "dana.whitfield@example.com",
    message: "Our group runs long-term care facilities and may be a pilot site.",
    status: "accepted",
    at: new Date(Date.now() - 9 * DAY_MS).toISOString(),
  },
];
