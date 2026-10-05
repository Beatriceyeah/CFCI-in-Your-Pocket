import type { ProductStatus } from "../api/types";
import { STATUS_LABELS } from "./labels";

const STYLES: Record<ProductStatus, string> = {
  pending_review: "bg-accent-yellow/30 text-ink",
  live: "bg-interest/20 text-ink",
  archived: "bg-muted/15 text-muted",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
