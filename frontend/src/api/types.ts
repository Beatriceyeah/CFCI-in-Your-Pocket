// Mirrors docs/contract.md field-for-field (snake_case). Update in the same change as the contract.

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export interface ErrorBody {
  code: ErrorCode;
  message: string;
  details: Record<string, unknown>;
}

export interface Envelope<T> {
  data: T | null;
  error: ErrorBody | null;
}

export interface PageMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedEnvelope<T> {
  data: T[];
  error: ErrorBody | null;
  meta: PageMeta;
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

export type AuthProvider = "duke_netid" | "linkedin" | "google";
export type Role = "student" | "external";
export type Direction = "research" | "health" | "software" | "hardware";
export type ProductStatus = "pending_review" | "live" | "archived";

export interface User {
  id: string;
  name: string;
  email: string;
  auth_provider: AuthProvider;
  role: Role;
  interested_directions: Direction[];
  onboarded: boolean;
  created_at: string;
}

export interface ProductCard {
  id: string;
  name: string;
  one_liner: string;
  cover_image_url: string;
  category: Direction;
}

export interface Product extends ProductCard {
  demo_video_url: string;
  brief: string;
  team_name: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  name: string;
  one_liner: string;
  cover_image_url: string;
  demo_video_url: string;
  brief: string;
  category: Direction;
}

export type ProductUpdate = Partial<ProductCreate>;

export interface DemoLoginRequest {
  provider: AuthProvider;
}

export interface AuthSession {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export interface MeUpdate {
  interested_directions?: Direction[];
  onboarded?: boolean;
}

export interface HealthStatus {
  status: string;
}
