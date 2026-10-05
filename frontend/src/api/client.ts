// The single API client. Every HTTP call in the app goes through here (AGENTS.md).
import type {
  AuthProvider,
  AuthSession,
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

export interface ProductListQuery {
  page?: number;
  page_size?: number;
  category?: Direction[];
  exclude_swiped?: boolean;
}

// Endpoint functions. Add one per contract endpoint, grouped by module.
export const api = {
  health: () => request<HealthStatus>("GET", "/health"),

  // Auth + Me (Module 2)
  demoLogin: (provider: AuthProvider) =>
    request<AuthSession>("POST", "/auth/demo-login", { provider }),
  me: () => request<User>("GET", "/me"),
  updateMe: (changes: MeUpdate) => request<User>("PATCH", "/me", changes),

  // Products (Module 1)
  listProducts: (query: ProductListQuery = {}) =>
    requestPage<ProductCard>("/products", { ...query }),
  getProduct: (id: string) => request<Product>("GET", `/products/${id}`),
  createProduct: (product: ProductCreate) => request<Product>("POST", "/products", product),
  updateProduct: (id: string, changes: ProductUpdate) =>
    request<Product>("PATCH", `/products/${id}`, changes),
  myProduct: () => request<Product | null>("GET", "/me/product"),

  // Browse (Module 3)
  swipe: (id: string, direction: SwipeDirection) =>
    request<Swipe>("PUT", `/products/${id}/swipe`, { direction }),
  giveFeedback: (id: string, feedback: FeedbackRequest) =>
    request<Feedback>("POST", `/products/${id}/feedback`, feedback),

  // My Dashboard (Module 4)
  interestedProducts: (page = 1, page_size = 50) =>
    requestPage<ProductCard>("/me/interested-products", { page, page_size }),
  feedbackSummary: (id: string) => request<FeedbackSummary>("GET", `/products/${id}/feedback`),
};
