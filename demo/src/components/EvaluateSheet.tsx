import { useEffect, useState } from "react";
import {
  DIMENSIONS,
  notePromptFor,
  RATING_WORDS,
  REACTIONS,
} from "../data/dimensions";
import type {
  DimensionKey,
  Evaluation,
  EvaluationDraft,
  Product,
  ReactionKey,
} from "../types";
import { Icon } from "./Icon";
import { ProductOverview } from "./ProductOverview";
import { Sheet } from "./Sheet";

interface Props {
  product: Product;
  existing?: Evaluation;
  draft?: EvaluationDraft;
  viewerLabel: string;
  onDraft: (d: EvaluationDraft) => void;
  onSave: (e: Evaluation) => void;
  onClose: () => void;
}

const EMPTY_REACTIONS: Record<ReactionKey, boolean> = {
  use: false,
  invest: false,
  intro: false,
};

export function EvaluateSheet({
  product,
  existing,
  draft,
  viewerLabel,
  onDraft,
  onSave,
  onClose,
}: Props) {
  const start = existing ?? draft;
  const [ratings, setRatings] = useState<Partial<Record<DimensionKey, number>>>(
    start?.ratings ?? {},
  );
  const [unsure, setUnsure] = useState<Partial<Record<DimensionKey, boolean>>>(
    start?.unsure ?? {},
  );
  const [notes, setNotes] = useState<Partial<Record<DimensionKey, string>>>(
    start?.notes ?? {},
  );
  const [reactions, setReactions] = useState(
    start?.reactions ?? EMPTY_REACTIONS,
  );
  const [introNote, setIntroNote] = useState(start?.introNote ?? "");
  const [comment, setComment] = useState(start?.comment ?? "");

  const [refOpen, setRefOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  // Progress saves itself, so the viewer can leave to re-read the overview or close and come back.
  useEffect(() => {
    if (!touched) return;
    onDraft({ ratings, unsure, notes, reactions, introNote, comment });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched, ratings, unsure, notes, reactions, introNote, comment]);

  const required = DIMENSIONS.filter((d) => d.required);
  const answered = required.filter(
    (d) => ratings[d.key] !== undefined || unsure[d.key],
  ).length;
  const [attempted, setAttempted] = useState(false);
  const isAnswered = (k: DimensionKey) =>
    ratings[k] !== undefined || !!unsure[k];
  const firstMissing = required.find((d) => !isAnswered(d.key));

  const trySubmit = () => {
    if (firstMissing) {
      setAttempted(true);
      document
        .getElementById(`dim-${firstMissing.key}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    save();
  };

  const rate = (key: DimensionKey, n: number) => {
    setTouched(true);
    setRatings((r) => ({ ...r, [key]: n }));
    setUnsure((u) => ({ ...u, [key]: false }));
  };
  const markUnsure = (key: DimensionKey) => {
    setTouched(true);
    setRatings((r) => {
      const next = { ...r };
      delete next[key];
      return next;
    });
    setNotes((n) => ({ ...n, [key]: "" }));
    setUnsure((u) => ({ ...u, [key]: true }));
  };

  const save = () =>
    onSave({
      id: existing?.id ?? `eval-${product.id}-${Date.now()}`,
      productId: product.id,
      viewerLabel,
      ratings,
      unsure,
      notes,
      reactions,
      introNote: reactions.intro ? introNote.trim() : "",
      comment: comment.trim(),
      at: new Date().toISOString(),
    });

  return (
    <Sheet
      wide
      title={`Your take on ${product.name}`}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm text-muted">
            {attempted && firstMissing
              ? `${required.length - answered} left to answer`
              : `${answered} of ${required.length} required answered`}
          </p>
          <button
            type="button"
            onClick={trySubmit}
            className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white"
          >
            Submit my take
          </button>
        </div>
      }
    >
      <div className="sm:grid sm:h-full sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside
          className="hidden overflow-y-auto border-r border-line p-5 sm:block"
          aria-label="Project reference"
        >
          <ProductOverview product={product} />
        </aside>
        <div className="sm:min-h-0 sm:overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-line bg-surface">
            <div className="flex items-center justify-between gap-3 px-5 py-2">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className={`size-1.5 rounded-full ${touched || draft ? "bg-interest" : "bg-line"}`}
                />
                {touched || draft ? "Saved automatically" : "Saves as you go"}
              </p>
              <button
                type="button"
                aria-expanded={refOpen}
                onClick={() => setRefOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full bg-navy/8 px-3 py-1.5 text-sm font-semibold text-navy sm:hidden"
              >
                <Icon name="info" className="size-4" />
                {refOpen ? "Hide project info" : "Project info"}
              </button>
            </div>
            {refOpen && (
              <div className="max-h-[42dvh] overflow-y-auto border-t border-line p-5 sm:hidden">
                <ProductOverview product={product} />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-5 p-5">
            <p className="text-sm text-muted">
              Score the first three lenses from 1 to 5. The last two are
              optional. If you&rsquo;re not sure about one, pick the &ldquo;not
              sure&rdquo; option. It counts as an answer and stays out of the
              score.
            </p>

            <ul className="flex flex-col gap-5">
              {DIMENSIONS.map((d) => {
                const value = ratings[d.key];
                const isUnsure = !!unsure[d.key];
                const needsAnswer =
                  attempted && d.required && !isAnswered(d.key);
                return (
                  <li
                    key={d.key}
                    id={`dim-${d.key}`}
                    className={`flex flex-col gap-2 rounded-2xl transition ${
                      needsAnswer ? "-m-2 bg-royal/5 p-2 ring-2 ring-royal" : ""
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <p className="font-display font-semibold text-navy">
                          {d.label}
                          {!d.required && (
                            <span className="ml-1.5 text-xs font-medium text-muted">
                              Optional
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted">{d.prompt}</p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-royal">
                        {value
                          ? RATING_WORDS[value - 1]
                          : needsAnswer
                            ? "Needs an answer"
                            : ""}
                      </span>
                    </div>
                    <div
                      className="flex gap-1.5"
                      role="radiogroup"
                      aria-label={`${d.label} score`}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={value === n}
                          aria-label={`${n} of 5, ${RATING_WORDS[n - 1]}`}
                          onClick={() => rate(d.key, n)}
                          className={`h-11 flex-1 rounded-xl text-sm font-semibold ring-1 ring-inset transition ${
                            value === n
                              ? "bg-royal text-white ring-royal"
                              : "bg-surface text-muted ring-line hover:ring-royal"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-pressed={isUnsure}
                      onClick={() => markUnsure(d.key)}
                      className={`self-start rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                        isUnsure
                          ? "bg-navy text-white ring-navy"
                          : "text-muted ring-line"
                      }`}
                    >
                      {d.unsureLabel}
                    </button>
                    {value !== undefined && (
                      <textarea
                        id={`note-${d.key}`}
                        aria-label={`Note on ${d.label}`}
                        rows={2}
                        value={notes[d.key] ?? ""}
                        onChange={(e) => {
                          setTouched(true);
                          setNotes((n) => ({ ...n, [d.key]: e.target.value }));
                        }}
                        placeholder={`${notePromptFor(d, value)} (optional)`}
                        className="anim-fade rounded-xl border border-line px-3 py-2 text-sm"
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            <section className="flex flex-col gap-2 border-t border-line pt-4">
              <h3 className="font-display font-semibold text-navy">
                If this were mine (optional)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    aria-pressed={reactions[r.key]}
                    title={r.hint}
                    onClick={() => {
                      setTouched(true);
                      setReactions((s) => ({ ...s, [r.key]: !s[r.key] }));
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-medium ring-1 ring-inset ${
                      reactions[r.key]
                        ? "bg-interest/25 text-interest-deep ring-interest"
                        : "bg-surface text-ink ring-line"
                    }`}
                  >
                    {reactions[r.key] && (
                      <Icon name="check" className="size-4" />
                    )}
                    {r.label}
                  </button>
                ))}
              </div>
              {reactions.intro && (
                <input
                  id="intro-note"
                  value={introNote}
                  onChange={(e) => {
                    setTouched(true);
                    setIntroNote(e.target.value);
                  }}
                  placeholder="Who could you introduce them to? (optional)"
                  className="rounded-xl border border-line px-3 py-2 text-sm"
                />
              )}
            </section>

            <label className="flex flex-col gap-1.5" htmlFor="overall-comment">
              <span className="font-display font-semibold text-navy">
                Anything else for the team? (optional)
              </span>
              <textarea
                id="overall-comment"
                value={comment}
                onChange={(e) => {
                  setTouched(true);
                  setComment(e.target.value);
                }}
                rows={3}
                placeholder="A suggestion, a concern, a customer they should call"
                className="rounded-xl border border-line px-3 py-2 text-sm"
              />
            </label>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
