import { useState } from "react";
import { ApiError, api } from "../../api/client";
import type { ProductCard } from "../../api/types";

interface FeedbackSheetProps {
  product: ProductCard;
  onDone: () => void;
}

const TOGGLES: { key: "would_use" | "would_invest" | "would_intro"; label: string }[] = [
  { key: "would_use", label: "Would use" },
  { key: "would_invest", label: "Would invest" },
  { key: "would_intro", label: "Would intro someone" },
];

export function FeedbackSheet({ product, onDone }: FeedbackSheetProps) {
  const [values, setValues] = useState({
    would_use: false,
    would_invest: false,
    would_intro: false,
  });
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof typeof values) {
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api.feedback.give(product.id, { ...values, comment: comment.trim() || null });
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.code === "CONFLICT") {
        onDone();
        return;
      }
      setError(err instanceof ApiError ? err.message : "Couldn't send feedback right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="bg-surface rounded-card flex w-full max-w-md flex-col gap-4 p-6 sm:max-h-[85vh]">
        <div className="space-y-1">
          <p className="text-interest text-sm font-semibold">
            You're interested in {product.name}!
          </p>
          <h2 className="text-navy text-xl font-bold">Quick feedback</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {TOGGLES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={values[key]}
              onClick={() => toggle(key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                values[key]
                  ? "bg-interest text-white"
                  : "bg-canvas text-muted border-muted/30 border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink font-medium">Comment (optional)</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            className="rounded-card border-muted/30 focus:border-royal border px-3 py-2 outline-none"
            placeholder="What stood out to you?"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy}
            className="bg-navy rounded-card flex-1 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send feedback"}
          </button>
          <button
            type="button"
            onClick={onDone}
            disabled={busy}
            className="text-muted rounded-card border-muted/30 border px-4 py-2 font-medium"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
