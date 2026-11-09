import { useState, type ReactNode } from "react";
import { useStore } from "../store/StoreContext";
import { notePromptFor, RATING_WORDS, REACTIONS, type Dimension } from "../data/dimensions";
import { Icon } from "./Icon";
import type { EvaluationForm } from "./useEvaluation";

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/**
 * A comment on one section of the product, like a comment in a shared doc. Closed, it is a small "add your take"
 * link, or a bubble showing what you said. Open, it holds the score and a note. Nothing needs saving.
 */
export function LensComment({
  dim,
  form,
  defaultOpen = false,
}: {
  dim: Dimension;
  form: EvaluationForm;
  defaultOpen?: boolean;
}) {
  const { state } = useStore();
  const [open, setOpen] = useState(defaultOpen);
  const value = form.ratings[dim.key];
  const isUnsure = !!form.unsure[dim.key];
  const note = form.notes[dim.key] ?? "";
  const has = value !== undefined || isUnsure || note.trim() !== "";
  const who = state.session?.name ?? "You";

  if (!open && !has) {
    return (
      <div id={`dim-${dim.key}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-3 text-[0.82rem] font-medium text-royal ring-1 ring-inset ring-royal/30 hover:bg-royal/5"
        >
          <Icon name="comment" className="size-3.5" />
          Add your take on {dim.label.toLowerCase()}
        </button>
      </div>
    );
  }

  const avatar = (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-royal text-[0.65rem] font-bold text-white">
      {initialsOf(who)}
    </span>
  );

  if (!open) {
    return (
      <div id={`dim-${dim.key}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-start gap-2 rounded-xl bg-surface p-2.5 text-left shadow-sm ring-1 ring-line"
        >
          {avatar}
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-semibold text-navy">
              {value ? `${value}/5 · ${RATING_WORDS[value - 1]}` : "Not sure yet"}
            </span>
            {note.trim() && <span className="line-clamp-2 block text-muted">{note}</span>}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div id={`dim-${dim.key}`} className="anim-fade flex flex-col gap-2 rounded-xl bg-surface p-3 shadow-md ring-1 ring-royal/30">
      <div className="flex items-center gap-2">
        {avatar}
        <p className="min-w-0 flex-1 text-sm">
          <span className="font-semibold text-navy">You</span>
          <span className="text-muted"> on {dim.label.toLowerCase()}</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close comment"
          className="grid size-7 place-items-center rounded-full text-muted hover:bg-canvas"
        >
          <Icon name="close" className="size-4" />
        </button>
      </div>
      <p className="text-sm text-muted">{dim.prompt}</p>
      <div className="flex gap-1.5" role="radiogroup" aria-label={`${dim.label} score`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5, ${RATING_WORDS[n - 1]}`}
            onClick={() => form.rate(dim.key, n)}
            className={`h-10 flex-1 rounded-lg text-sm font-semibold ring-1 ring-inset transition ${
              value === n ? "bg-royal text-white ring-royal" : "bg-surface text-muted ring-line hover:ring-royal"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-pressed={isUnsure}
        onClick={() => form.markUnsure(dim.key)}
        className={`self-start rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
          isUnsure ? "bg-navy text-white ring-navy" : "bg-surface text-muted ring-line"
        }`}
      >
        {dim.unsureLabel}
      </button>
      {value !== undefined && (
        <textarea
          aria-label={`Note on ${dim.label}`}
          rows={2}
          value={note}
          onChange={(e) => form.setNote(dim.key, e.target.value)}
          placeholder={`${notePromptFor(dim, value)} (optional)`}
          className="anim-fade rounded-lg border border-line bg-surface px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}

/** The closing questions and a Done button. Nothing here is required and nothing needs sending: it all saves as you go. */
export function FeedbackFinish({
  form,
  onDone,
  action,
}: {
  form: EvaluationForm;
  onDone: () => void;
  /** When given, it takes the place of the Done button (Done then lives in the sheet's bottom bar). */
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-5">
      <section className="flex flex-col gap-2">
        <div>
          <h3 className="font-display font-semibold text-navy">What would you do first?</h3>
          <p className="text-sm text-muted">If this were your venture. This helps the team.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              aria-pressed={form.reactions[r.key]}
              title={r.hint}
              onClick={() => form.toggleReaction(r.key)}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-medium ring-1 ring-inset ${
                form.reactions[r.key] ? "bg-interest/25 text-interest-deep ring-interest" : "bg-surface text-ink ring-line"
              }`}
            >
              {form.reactions[r.key] && <Icon name="check" className="size-4" />}
              {r.label}
            </button>
          ))}
        </div>
        {form.reactions.intro && (
          <input
            value={form.introNote}
            onChange={(e) => form.setIntroNote(e.target.value)}
            placeholder="Who could you introduce them to? (optional)"
            className="rounded-xl border border-line px-3 py-2 text-sm"
          />
        )}
      </section>

      <label className="flex flex-col gap-1.5" htmlFor="overall-comment">
        <span className="font-display font-semibold text-navy">Anything else that would help the team? (optional)</span>
        <textarea
          id="overall-comment"
          value={form.comment}
          onChange={(e) => form.setComment(e.target.value)}
          rows={3}
          placeholder="A suggestion, a concern, a customer they should call"
          className="rounded-xl border border-line px-3 py-2 text-sm"
        />
      </label>

      {action ? (
        <div className="flex [&>button]:py-3">{action}</div>
      ) : (
        <button type="button" onClick={onDone} className="rounded-full bg-navy py-3 font-semibold text-white">
          Done
        </button>
      )}
    </div>
  );
}
