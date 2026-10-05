import type { Direction } from "../api/types";
import { DIRECTIONS, DIRECTION_LABELS } from "./labels";

interface Props {
  selected: Direction[];
  onChange: (selected: Direction[]) => void;
  label: string;
}

export function DirectionChips({ selected, onChange, label }: Props) {
  function toggle(direction: Direction) {
    onChange(
      selected.includes(direction)
        ? selected.filter((d) => d !== direction)
        : [...selected, direction],
    );
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {DIRECTIONS.map((direction) => {
        const on = selected.includes(direction);
        return (
          <button
            key={direction}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(direction)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              on
                ? "border-royal bg-royal text-surface"
                : "border-muted/30 bg-surface text-ink hover:border-royal"
            }`}
          >
            {DIRECTION_LABELS[direction]}
          </button>
        );
      })}
    </div>
  );
}
