import { useState } from "react";
import { Icon } from "../../components/Icon";
import { daysLeft, isFeatured } from "../../lib/order";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

type Choice = 7 | 14 | 30 | "date";

const PRESETS: { value: Choice; label: string }[] = [
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
  { value: "date", label: "Pick a date" },
];

const DAY_MS = 86_400_000;
const toInputDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const endOfDay = (date: string): Date => new Date(`${date}T23:59:59`);

/** Choose how long a venture stays at the top of Browse, see the end date, then confirm. */
export function FeaturePanel({
  product,
  onDone,
}: {
  product: Product;
  onDone: () => void;
}) {
  const { dispatch } = useStore();
  const featured = isFeatured(product);
  const [choice, setChoice] = useState<Choice>(featured ? "date" : 14);
  const [date, setDate] = useState(
    featured && product.featuredUntil
      ? toInputDate(new Date(product.featuredUntil))
      : toInputDate(new Date(Date.now() + 14 * DAY_MS)),
  );

  const until =
    choice === "date" ? endOfDay(date) : new Date(Date.now() + choice * DAY_MS);
  const valid = until.getTime() > Date.now();
  const days = daysLeft(until.toISOString());

  return (
    <div className="anim-fade flex w-full flex-col gap-3 border-t border-interest/40 pt-4">
      <div>
        <p className="font-display font-semibold text-navy">
          Feature at the top of Browse
        </p>
        <p className="text-sm text-muted">
          Everyone sees it first, until the end date.
        </p>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="How long"
      >
        {PRESETS.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={choice === o.value}
            onClick={() => setChoice(o.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ${
              choice === o.value
                ? "bg-navy text-white ring-navy"
                : "bg-surface text-ink ring-line"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {choice === "date" && (
        <label
          className="flex flex-col gap-1 text-sm font-semibold text-navy"
          htmlFor={`feature-date-${product.id}`}
        >
          Last day featured
          <input
            id={`feature-date-${product.id}`}
            type="date"
            min={toInputDate(new Date(Date.now() + DAY_MS))}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-fit rounded-xl border border-line bg-surface px-3 py-2 font-normal text-ink"
          />
        </label>
      )}
      <p className="text-sm">
        {valid ? (
          <>
            Ends{" "}
            <span className="font-semibold">
              {until.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-muted">
              {" "}
              · {days} day{days === 1 ? "" : "s"}
            </span>
          </>
        ) : (
          <span className="text-danger">Pick a date in the future.</span>
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!valid}
          onClick={() => {
            dispatch({
              type: "feature_product",
              productId: product.id,
              until: until.toISOString(),
            });
            onDone();
          }}
          className="flex items-center gap-1.5 rounded-full bg-interest px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Icon name="star" className="size-4" />
          {featured ? "Save changes" : "Feature this venture"}
        </button>
        {featured && (
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "unfeature_product", productId: product.id });
              onDone();
            }}
            className="rounded-full px-4 py-2 text-sm font-semibold text-danger ring-1 ring-danger/30"
          >
            Remove feature
          </button>
        )}
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-2 text-sm font-medium text-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
