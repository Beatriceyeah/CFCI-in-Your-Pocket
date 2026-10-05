// The single API client. Every HTTP call in the app goes through here (AGENTS.md).
import type {
  AuthSession,
  DemoLoginRequest,
  Direction,
  Envelope,
  ErrorBody,
  ErrorCode,
  Feedback,
  FeedbackRequest,
  FeedbackSummary,
  HealthStatus,
  MeUpdate,
  Page,
  PaginatedEnvelope,
  Product,
  ProductCard,
  ProductCreate,
  ProductUpdate,
  Swipe,
  SwipeDirection,
  User,
} from "./types";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/api/v1`;

export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: Record<string, unknown>;

  constructor(status: number, body: ErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.status = status;
    this.details = body.details;
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

type Query = Record<string, string | number | boolean | string[] | undefined>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) url.searchParams.append(key, String(v));
  }
  return url.toString();
}

async function send<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, {
      code: "INTERNAL_ERROR",
      message: "Can't reach the server. Check your connection.",
      details: {},
    });
  }

  let payload: (Envelope<unknown> & { meta?: unknown }) | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload || payload.error) {
    throw new ApiError(
      response.status,
      payload?.error ?? { code: "INTERNAL_ERROR", message: "Unexpected response", details: {} },
    );
  }
  return payload as T;
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const envelope = await send<Envelope<T>>(method, path, body);
  return envelope.data as T;
}

export async function requestPage<T>(path: string, query?: Query): Promise<Page<T>> {
  const envelope = await send<PaginatedEnvelope<T>>("GET", path, undefined, query);
  return { items: envelope.data, meta: envelope.meta };
}

interface ListProductsQuery extends Query {
  page?: number;
  page_size?: number;
  category?: Direction[];
  exclude_swiped?: boolean;
}

interface PageQuery extends Query {
  page?: number;
  page_size?: number;
}

// Endpoint functions. Add one per contract endpoint, grouped by module.
export const api = {
  health: () => request<HealthStatus>("GET", "/health"),

  auth: {
    demoLogin: (payload: DemoLoginRequest) =>
      request<AuthSession>("POST", "/auth/demo-login", payload),
  },

  me: {
    get: () => request<User>("GET", "/me"),
    update: (payload: MeUpdate) => request<User>("PATCH", "/me", payload),
  },

  products: {
    list: (query?: ListProductsQuery) => requestPage<ProductCard>("/products", query),
    get: (productId: string) => request<Product>("GET", `/products/${productId}`),
    create: (payload: ProductCreate) => request<Product>("POST", "/products", payload),
    update: (productId: string, payload: ProductUpdate) =>
      request<Product>("PATCH", `/products/${productId}`, payload),
    mine: () => request<Product | null>("GET", "/me/product"),
  },

  swipes: {
    swipe: (productId: string, direction: SwipeDirection) =>
      request<Swipe>("PUT", `/products/${productId}/swipe`, { direction }),
    interestedProducts: (query?: PageQuery) =>
      requestPage<ProductCard>("/me/interested-products", query),
  },

  feedback: {
    give: (productId: string, payload: FeedbackRequest) =>
      request<Feedback>("POST", `/products/${productId}/feedback`, payload),
    summary: (productId: string) =>
      request<FeedbackSummary>("GET", `/products/${productId}/feedback`),
  },
};
