// Display labels for contract enums. Components show these, never the raw API values.
import type { AuthProvider, Direction, ProductStatus } from "../api/types";

export const DIRECTIONS: Direction[] = ["research", "health", "software", "hardware"];

export const DIRECTION_LABELS: Record<Direction, string> = {
  research: "Research",
  health: "Health",
  software: "Software",
  hardware: "Hardware",
};

export const PROVIDER_LABELS: Record<AuthProvider, string> = {
  duke_netid: "Duke NetID",
  linkedin: "LinkedIn",
  google: "Google",
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  pending_review: "Pending review",
  live: "Live",
  archived: "Archived",
};
