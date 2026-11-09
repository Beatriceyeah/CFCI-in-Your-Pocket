import { useState } from "react";
import { notePromptFor, RATING_WORDS, REACTIONS, type Dimension } from "../data/dimensions";
import type { Product } from "../types";
import { Icon } from "./Icon";
import { Pill } from "./Pill";
import type { EvaluationForm } from "./useEvaluation";

/** Top of the sheet: sets the tone and shows where this person's take stands. */
export function FeedbackBanner({ product, form }: { product: Product; form: EvaluationForm }) {
  const done = form.status === "done";
  return (
    <section className="flex flex-col gap-1.5 rounded-2xl bg-interest/10 p-4 ring-1 ring-interest/30">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-interest-deep">Help the {product.name} team</h3>
        {form.status !== "new" && <Pill tone={done ? "good" : "warn"}>{done ? "Shared" : "Partially completed"}</Pill>}
      </div>
      <p className="text-sm leading-snug">
        {done
          ? `You shared your take on ${new Date(form.existing?.at ?? Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric" })}. Change anything below and it updates automatically.`
          : "Students are building this. Add your view beside any section as you read. It saves as you go, and you can skip what you are not sure about."}
      </p>
    </section>
  );
}

/** Rating and note for one lens, shown right under the data it is about. */
export function LensControl({ dim, form, flagged }: { dim: Dimension; form: EvaluationForm; flagged: boolean }) {
  const value = form.ratings[dim.key];
  const isUnsure = !!form.unsure[dim.key];
  return (
    <div
      id={`dim-${dim.key}`}
      className={`flex flex-col gap-2 rounded-2xl p-3 transition ${
        flagged ? "bg-royal/10 ring-2 ring-royal" : "bg-royal/5 ring-1 ring-royal/15"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-display font-semibold text-navy">Your take: {dim.label}</p>
          <p className="text-sm text-muted">{dim.prompt}</p>
        </div>
        <span className="shrink-0 text-sm font-medium text-royal">{value ? RATING_WORDS[value - 1] : ""}</span>
      </div>
      <div className="flex gap-1.5" role="radiogroup" aria-label={`${dim.label} score`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of 5, ${RATING_WORDS[n - 1]}`}
            onClick={() => form.rate(dim.key, n)}
            className={`h-10 flex-1 rounded-xl text-sm font-semibold ring-1 ring-inset transition ${
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
          value={form.notes[dim.key] ?? ""}
          onChange={(e) => form.setNote(dim.key, e.target.value)}
          placeholder={`${notePromptFor(dim, value)} (optional)`}
          className="anim-fade rounded-xl border border-line bg-surface px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}

/** The closing questions and the submit button. Nothing here is required; a missed lens only triggers a reminder. */
export function FeedbackFinish({ form, onSubmitted }: { form: EvaluationForm; onSubmitted: () => void }) {
  const [reminding, setReminding] = useState(false);
  const missing = form.missing;

  const goBack = () => {
    setReminding(false);
    const first = missing[0];
    if (first) document.getElementById(`dim-${first.key}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const submit = () => {
    form.submit();
    setReminding(false);
    onSubmitted();
  };

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

      {reminding && missing.length > 0 && (
        <div role="alert" className="anim-fade flex flex-col gap-2 rounded-2xl bg-warn-soft p-4 text-sm text-warn">
          <p className="font-semibold">
            You have not answered {missing.map((d) => d.label).join(" or ")} yet.
          </p>
          <p>You can still send what you have. Students find even partial feedback useful.</p>
          <div className="flex gap-2">
            <button type="button" onClick={goBack} className="rounded-full bg-surface px-4 py-2 font-semibold text-navy ring-1 ring-line">
              Go back to answer
            </button>
            <button type="button" onClick={submit} className="rounded-full bg-navy px-4 py-2 font-semibold text-white">
              Send anyway
            </button>
          </div>
        </div>
      )}

      {!reminding && (
        <button
          type="button"
          onClick={() => (missing.length ? setReminding(true) : submit())}
          className="rounded-full bg-navy py-3 font-semibold text-white"
        >
          {form.status === "done" ? "Save my update" : "Send my take to the team"}
        </button>
      )}
    </div>
  );
}
