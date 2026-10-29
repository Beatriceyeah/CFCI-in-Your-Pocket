import { RATING_WORDS } from "../data/dimensions";

export function RatingBar({ value, max = 5 }: { value: number | null; max?: number }) {
  const pct = value === null ? 0 : (value / max) * 100;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-canvas">
      <div className="h-full rounded-full bg-royal" style={{ width: `${pct}%` }} />
    </div>
  );
}

export const ratingWord = (v: number | null): string =>
  v === null ? "No ratings" : (RATING_WORDS[Math.round(v) - 1] ?? "");
