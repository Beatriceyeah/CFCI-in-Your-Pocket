import type { Direction } from "../api/types";
import { DIRECTION_LABELS } from "../lib/constants";

interface CategoryChipProps {
  category: Direction;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ category, selected = true, onClick }: CategoryChipProps) {
  const base = "rounded-full px-3 py-1 text-xs font-medium transition";
  const look = selected ? "bg-royal text-white" : "bg-canvas text-muted border border-muted/30";

  if (!onClick) {
    return <span className={`${base} ${look}`}>{DIRECTION_LABELS[category]}</span>;
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${look}`} aria-pressed={selected}>
      {DIRECTION_LABELS[category]}
    </button>
  );
}
