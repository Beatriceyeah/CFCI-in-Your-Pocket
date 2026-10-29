export type Direction = "health" | "software" | "hardware" | "research";
export type Persona = "external" | "team" | "admin";
export type Provider = "duke_netid" | "linkedin" | "google";
export type ListingStatus = "draft" | "live" | "archived";
export type Stage = "Early research" | "Prototype" | "Validating";
export type DimensionKey = "problem" | "market" | "edge" | "readiness" | "revenue";
export type ReactionKey = "use" | "invest" | "intro";
export type SkipReason = "not_my_area" | "too_early" | "unclear_need" | "small_market";
export type FeedbackStatus = "new" | "noted" | "planned" | "not_now";

export interface MarketStat {
  label: string;
  value: string;
  note: string;
}

export interface TeamMember {
  name: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  pitchProblem: string;
  pitchSolution: string;
  category: Direction;
  stage: Stage;
  ip: string;
  summary: string;
  problems: string[];
  solution: string[];
  edge: string[];
  market: MarketStat[];
  traction: string[];
  next: string[];
  team: TeamMember[];
  daysSinceUpdate: number;
  status: ListingStatus;
  ownerIds?: string[];
  uploadedBy?: { name: string; at: string };
  /** While in the future, CFCI is featuring this venture at the top of Browse. */
  featuredUntil?: string;
}

export interface Session {
  persona: Persona;
  provider: Provider;
  userId: string;
  name: string;
  email: string;
  roleLabel: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
}

export type ConnectionStatus = "pending" | "accepted" | "declined";

export interface Connection {
  id: string;
  productId: string;
  fromName: string;
  fromRole: string;
  fromEmail: string;
  message: string;
  status: ConnectionStatus;
  at: string;
}

export interface SwipeRecord {
  productId: string;
  direction: "left" | "right";
  reason?: SkipReason;
  revisit: boolean;
  at: string;
}

export interface Evaluation {
  id: string;
  productId: string;
  viewerLabel: string;
  viewerName?: string;
  ratings: Partial<Record<DimensionKey, number>>;
  notes: Partial<Record<DimensionKey, string>>;
  unsure?: Partial<Record<DimensionKey, boolean>>;
  reactions: Record<ReactionKey, boolean>;
  introNote: string;
  comment: string;
  at: string;
}

export interface ChangeEntry {
  id: string;
  productId: string;
  note: string;
  by: string;
  at: string;
}

export interface ShareList {
  id: string;
  name: string;
  note: string;
  productIds: string[];
  recipients: string;
  createdAt: string;
}

export type EvaluationDraft = Pick<
  Evaluation,
  "ratings" | "unsure" | "notes" | "reactions" | "introNote" | "comment"
>;
