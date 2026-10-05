// Shared display labels for contract enums (docs/contract.md). Keep in sync with api/types.ts.
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

export const STATUS_STYLES: Record<ProductStatus, string> = {
  pending_review: "bg-accent-yellow/30 text-ink",
  live: "bg-interest/20 text-ink",
  archived: "bg-muted/20 text-muted",
};
