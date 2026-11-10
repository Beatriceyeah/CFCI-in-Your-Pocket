import { SEED_CONNECTIONS, SEED_LISTS } from "../data/seed";
import { changedParts, summarizeUpdate } from "../lib/updateSummary";
import {
  CFCI_STAFF,
  DEFAULT_STAFF_ID,
  DEFAULT_STUDENT_ID,
  REGISTERED_STUDENTS,
} from "../data/users";
import { SEED_PRODUCTS } from "../data/products";
import type {
  ChangeEntry,
  Connection,
  ConnectionStatus,
  Direction,
  Evaluation,
  FeedbackStatus,
  ListingStatus,
  Persona,
  Product,
  Provider,
  Session,
  ShareList,
  SkipReason,
  SwipeRecord,
} from "../types";

export interface State {
  session: Session | null;
  directions: Direction[];
  swipes: Record<string, SwipeRecord>;
  evaluations: Evaluation[];
  /** The product version this viewer last saw, so updates can be flagged. */
  seen: Record<string, number>;
  products: Product[];
  changelog: ChangeEntry[];
  feedbackStatus: Record<string, FeedbackStatus>;
  reminders: Record<string, string>;
  lists: ShareList[];
  connections: Connection[];
  opens: Record<string, number>;
}

export type Action =
  | {
      type: "login";
      persona: Persona;
      provider: Provider;
      userId?: string;
    }
  | { type: "logout" }
  | { type: "set_directions"; directions: Direction[] }
  | { type: "swipe"; productId: string; direction: "left" | "right" }
  | { type: "undo_swipe"; productId: string }
  | {
      type: "tag_skip";
      productId: string;
      reason?: SkipReason;
      revisit?: boolean;
    }
  | { type: "save_evaluation"; evaluation: Evaluation }
  | {
      type: "update_product";
      productId: string;
      patch: Partial<Product>;
      note: string;
    }
  | { type: "set_feedback_status"; evalId: string; status: FeedbackStatus }
  | { type: "set_listing_status"; productId: string; status: ListingStatus }
  | { type: "send_reminder"; productId: string }
  | { type: "create_list"; list: ShareList }
  | { type: "upload_product"; product: Product }
  | { type: "feature_product"; productId: string; until: string }
  | { type: "unfeature_product"; productId: string }
  | { type: "record_open"; productId: string }
  | { type: "mark_seen"; productId: string }
  | { type: "add_owner"; productId: string; userId: string }
  | { type: "request_connection"; connection: Connection }
  | { type: "respond_connection"; id: string; status: ConnectionStatus }
  | { type: "reset" };

// The sample viewer already has three ventures that the teams have since updated: one saved to review later (it
// simply opens at its latest version), one reviewed (it shows what changed and the viewer's last scores) and one
// passed on (it stays under Not interested, marked as updated).
const DAY = 86_400_000;
const sampleSwipes = (): Record<string, SwipeRecord> => ({
  "clinical-sentinel": {
    productId: "clinical-sentinel",
    direction: "left",
    reason: "too_early",
    revisit: false,
    version: 1,
    at: new Date(Date.now() - 22 * DAY).toISOString(),
  },
  "circadian-labs": {
    productId: "circadian-labs",
    direction: "right",
    revisit: false,
    version: 1,
    at: new Date(Date.now() - 21 * DAY).toISOString(),
  },
});
const sampleTakes = (): Evaluation[] => [
  {
    id: "eval-sample-kinema",
    productId: "kinema",
    viewerLabel: "Investor or alum",
    ratings: { problem: 3, market: 4, edge: 3 },
    notes: { problem: "Clear pain, but it was not obvious who pays." },
    unsure: {},
    reactions: { use: false, invest: false, intro: false },
    introNote: "",
    comment: "",
    version: 1,
    at: new Date(Date.now() - 20 * DAY).toISOString(),
  },
];

// The decision a new swipe replaces (with the version seen then), for Undo.
function previousSwipe(state: State, productId: string): SwipeRecord["prev"] {
  const current = state.swipes[productId];
  if (!current) return undefined;
  const { prev: _older, ...swipe } = current;
  return { swipe, seen: state.seen[productId] };
}

export const initialState = (): State => ({
  session: null,
  directions: [],
  swipes: sampleSwipes(),
  evaluations: sampleTakes(),
  // The product version this viewer last saw, so updates can be flagged.
  seen: { "circadian-labs": 1, kinema: 1 },
  products: SEED_PRODUCTS,
  changelog: [],
  feedbackStatus: {},
  reminders: {},
  lists: SEED_LISTS,
  connections: SEED_CONNECTIONS,
  opens: {},
});

function identityFor(
  persona: Persona,
  provider: Provider,
  userId?: string,
): Pick<Session, "userId" | "name" | "email" | "roleLabel"> {
  if (persona === "team") {
    const student =
      REGISTERED_STUDENTS.find(
        (u) => u.id === (userId ?? DEFAULT_STUDENT_ID),
      ) ?? REGISTERED_STUDENTS[0]!;
    return {
      userId: student.id,
      name: student.name,
      email: student.email,
      roleLabel: "Student team",
    };
  }
  if (persona === "admin") {
    const staff =
      CFCI_STAFF.find((u) => u.id === (userId ?? DEFAULT_STAFF_ID)) ??
      CFCI_STAFF[0]!;
    return {
      userId: staff.id,
      name: staff.name,
      email: staff.email,
      roleLabel: "CFCI staff",
    };
  }
  return provider === "google"
    ? {
        userId: "u-sam",
        name: "Sam Rivera",
        email: "sam.rivera@example.com",
        roleLabel: "Duke alum, class of 2008",
      }
    : {
        userId: "u-jordan",
        name: "Jordan Ellis",
        email: "jordan.ellis@example.com",
        roleLabel: "Angel investor",
      };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "login":
      return {
        ...state,
        session: {
          persona: action.persona,
          provider: action.provider,
          ...identityFor(action.persona, action.provider, action.userId),
        },
      };
    case "logout":
      return { ...state, session: null };
    case "set_directions":
      return { ...state, directions: action.directions };
    case "swipe": {
      const version = state.products.find((p) => p.id === action.productId)?.version ?? 1;
      return {
        ...state,
        seen: { ...state.seen, [action.productId]: version },
        swipes: {
          ...state.swipes,
          [action.productId]: {
            productId: action.productId,
            direction: action.direction,
            revisit: false,
            version,
            at: new Date().toISOString(),
            prev: previousSwipe(state, action.productId),
            // Passing on a venture that already came round again is a final no.
            final: action.direction === "left" && state.swipes[action.productId]?.direction === "left" ? true : undefined,
          },
        },
      };
    }
    case "undo_swipe": {
      const { [action.productId]: current, ...rest } = state.swipes;
      const { [action.productId]: _seen, ...seenRest } = state.seen;
      // A venture that came round again goes back to the decision it had before this swipe.
      if (current?.prev) {
        const { swipe, seen } = current.prev;
        return {
          ...state,
          swipes: { ...rest, [action.productId]: swipe },
          seen: seen === undefined ? seenRest : { ...seenRest, [action.productId]: seen },
        };
      }
      return { ...state, swipes: rest };
    }
    case "tag_skip": {
      const current = state.swipes[action.productId];
      if (!current) return state;
      return {
        ...state,
        swipes: {
          ...state.swipes,
          [action.productId]: {
            ...current,
            reason: action.reason ?? current.reason,
            revisit: action.revisit ?? current.revisit,
          },
        },
      };
    }
    case "save_evaluation": {
      return {
        ...state,
        evaluations: [
          ...state.evaluations.filter(
            (e) => e.productId !== action.evaluation.productId,
          ),
          {
            ...action.evaluation,
            viewerName: action.evaluation.viewerName ?? state.session?.name,
          },
        ],
      };
    }
    case "update_product":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId
            ? {
                ...p,
                ...action.patch,
                daysSinceUpdate: 0,
                version: (p.version ?? 1) + 1,
                updateNote: action.note || p.updateNote,
                updateSummary: summarizeUpdate(p, action.patch, action.note),
                updateChanges: changedParts(p, action.patch),
              }
            : p,
        ),
        changelog: [
          {
            id: `chg-${Date.now()}`,
            productId: action.productId,
            note: action.note,
            by: state.session?.name ?? "CFCI staff",
            at: new Date().toISOString(),
          },
          ...state.changelog,
        ],
      };
    case "set_feedback_status":
      return {
        ...state,
        feedbackStatus: {
          ...state.feedbackStatus,
          [action.evalId]: action.status,
        },
      };
    case "set_listing_status":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, status: action.status } : p,
        ),
      };
    case "send_reminder":
      return {
        ...state,
        reminders: {
          ...state.reminders,
          [action.productId]: new Date().toISOString(),
        },
      };
    case "create_list":
      return { ...state, lists: [action.list, ...state.lists] };
    case "feature_product":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, featuredUntil: action.until } : p,
        ),
      };
    case "unfeature_product":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId ? { ...p, featuredUntil: undefined } : p,
        ),
      };
    case "upload_product": {
      const by = state.session?.name ?? "CFCI staff";
      const at = new Date().toISOString();
      const before = state.products.find((p) => p.id === action.product.id);
      const exists = !!before;
      const product: Product = {
        ...action.product,
        status: "live",
        daysSinceUpdate: 0,
        version: before?.version ?? 1,
        teamPhoto: action.product.teamPhoto ?? before?.teamPhoto,
        deckName: action.product.deckName ?? before?.deckName,
        uploadedBy: { name: by, at },
      };
      return {
        ...state,
        products: exists
          ? state.products.map((p) => (p.id === product.id ? product : p))
          : [product, ...state.products],
        changelog: [
          {
            id: `chg-${Date.now()}`,
            productId: product.id,
            note: exists
              ? `Listing details uploaded by ${by}`
              : `Listing uploaded by ${by}`,
            by,
            at,
          },
          ...state.changelog,
        ],
      };
    }
    case "mark_seen": {
      // Called when an overview closes: from then on this viewer has seen the latest version.
      const version = state.products.find((p) => p.id === action.productId)?.version ?? 1;
      const related =
        state.seen[action.productId] !== undefined ||
        !!state.swipes[action.productId] ||
        state.evaluations.some((e) => e.productId === action.productId);
      if (!related || state.seen[action.productId] === version) return state;
      return { ...state, seen: { ...state.seen, [action.productId]: version } };
    }
    case "record_open": {
      return {
        ...state,
        opens: {
          ...state.opens,
          [action.productId]: (state.opens[action.productId] ?? 0) + 1,
        },
      };
    }
    case "add_owner": {
      const user = REGISTERED_STUDENTS.find((u) => u.id === action.userId);
      const product = state.products.find((p) => p.id === action.productId);
      if (!user || !product || product.ownerIds?.includes(user.id))
        return state;
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.productId
            ? {
                ...p,
                ownerIds: [...(p.ownerIds ?? []), user.id],
                team: [...p.team, { name: user.name, role: "Teammate" }],
              }
            : p,
        ),
        changelog: [
          {
            id: `chg-${Date.now()}`,
            productId: action.productId,
            note: `Added ${user.name} as a teammate`,
            by: state.session?.name ?? "CFCI staff",
            at: new Date().toISOString(),
          },
          ...state.changelog,
        ],
      };
    }
    case "request_connection":
      return {
        ...state,
        connections: [action.connection, ...state.connections],
      };
    case "respond_connection":
      return {
        ...state,
        connections: state.connections.map((c) =>
          c.id === action.id ? { ...c, status: action.status } : c,
        ),
      };
    case "reset":
      return initialState();
  }
}
