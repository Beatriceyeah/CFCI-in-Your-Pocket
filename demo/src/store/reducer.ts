import { SEED_CONNECTIONS, SEED_LISTS } from "../data/seed";
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
  EvaluationDraft,
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
  onboarded: Record<Persona, boolean>;
  directions: Direction[];
  swipes: Record<string, SwipeRecord>;
  evaluations: Evaluation[];
  drafts: Record<string, EvaluationDraft>;
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
      fresh?: boolean;
    }
  | { type: "logout" }
  | { type: "finish_onboarding" }
  | { type: "set_directions"; directions: Direction[] }
  | { type: "swipe"; productId: string; direction: "left" | "right" }
  | { type: "undo_swipe"; productId: string }
  | {
      type: "tag_skip";
      productId: string;
      reason?: SkipReason;
      revisit?: boolean;
    }
  | { type: "save_draft"; productId: string; draft: EvaluationDraft }
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
  | { type: "add_owner"; productId: string; userId: string }
  | { type: "request_connection"; connection: Connection }
  | { type: "respond_connection"; id: string; status: ConnectionStatus }
  | { type: "reset" };

export const initialState = (): State => ({
  session: null,
  onboarded: { external: false, team: false, admin: true },
  directions: [],
  swipes: {},
  evaluations: [],
  drafts: {},
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
        // Signing in from the login page counts as a new visit, so onboarding shows again.
        onboarded: action.fresh
          ? { ...state.onboarded, [action.persona]: action.persona === "admin" }
          : state.onboarded,
        session: {
          persona: action.persona,
          provider: action.provider,
          ...identityFor(action.persona, action.provider, action.userId),
        },
      };
    case "logout":
      return { ...state, session: null };
    case "finish_onboarding":
      return state.session
        ? {
            ...state,
            onboarded: { ...state.onboarded, [state.session.persona]: true },
          }
        : state;
    case "set_directions":
      return { ...state, directions: action.directions };
    case "swipe":
      return {
        ...state,
        swipes: {
          ...state.swipes,
          [action.productId]: {
            productId: action.productId,
            direction: action.direction,
            revisit: false,
            at: new Date().toISOString(),
          },
        },
      };
    case "undo_swipe": {
      const { [action.productId]: _removed, ...rest } = state.swipes;
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
    case "save_draft":
      return {
        ...state,
        drafts: { ...state.drafts, [action.productId]: action.draft },
      };
    case "save_evaluation": {
      const { [action.evaluation.productId]: _draft, ...drafts } = state.drafts;
      return {
        ...state,
        drafts,
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
            ? { ...p, ...action.patch, daysSinceUpdate: 0 }
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
      const exists = state.products.some((p) => p.id === action.product.id);
      const product: Product = {
        ...action.product,
        status: "live",
        daysSinceUpdate: 0,
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
    case "record_open":
      return {
        ...state,
        opens: {
          ...state.opens,
          [action.productId]: (state.opens[action.productId] ?? 0) + 1,
        },
      };
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
