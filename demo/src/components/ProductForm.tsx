import { useState } from "react";
import type { Product } from "../types";

interface Props {
  product: Product;
  askChangeNote: boolean;
  submitLabel: string;
  onSubmit: (patch: Partial<Product>, note: string) => void;
  onSkip?: () => void;
  initialNote?: string;
}

const lines = (s: string): string[] =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

const INPUT = "rounded-xl border border-line bg-surface px-3 py-2 text-[0.95rem]";

export function ProductForm({ product, askChangeNote, submitLabel, onSubmit, onSkip, initialNote = "" }: Props) {
  const [name, setName] = useState(product.name);
  const [tagline, setTagline] = useState(product.tagline);
  const [pitchProblem, setPitchProblem] = useState(product.pitchProblem);
  const [pitchSolution, setPitchSolution] = useState(product.pitchSolution);
  const [summary, setSummary] = useState(product.summary);
  const [problems, setProblems] = useState(product.problems.join("\n"));
  const [solution, setSolution] = useState(product.solution.join("\n"));
  const [next, setNext] = useState(product.next.join("\n"));
  const [cover, setCover] = useState("");
  const [video, setVideo] = useState("");
  const [note, setNote] = useState(initialNote);

  const valid = name.trim() !== "" && tagline.trim() !== "" && (!askChangeNote || note.trim() !== "");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit(
          {
            name: name.trim(),
            tagline: tagline.trim(),
            pitchProblem: pitchProblem.trim(),
            pitchSolution: pitchSolution.trim(),
            summary: summary.trim(),
            problems: lines(problems),
            solution: lines(solution),
            next: lines(next),
          },
          note.trim(),
        );
      }}
    >
      <Field id="pf-name" label="Product name">
        <input id="pf-name" className={INPUT} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field id="pf-tagline" label="One-sentence intro" hint="Shown on the browse card.">
        <input id="pf-tagline" className={INPUT} value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </Field>
      <Field id="pf-pitch-problem" label="The problem, in one sentence" hint="First thing investors read on your card.">
        <textarea id="pf-pitch-problem" rows={2} className={INPUT} value={pitchProblem} onChange={(e) => setPitchProblem(e.target.value)} />
      </Field>
      <Field id="pf-pitch-solution" label="The solution, in one sentence" hint="Shown right under the problem.">
        <textarea id="pf-pitch-solution" rows={2} className={INPUT} value={pitchSolution} onChange={(e) => setPitchSolution(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field id="pf-cover" label="Cover image">
          <label htmlFor="pf-cover" className="cursor-pointer rounded-xl border border-dashed border-royal px-3 py-2 text-center text-sm text-royal">
            {cover || "Choose file"}
            <input id="pf-cover" type="file" accept="image/*" className="sr-only" onChange={(e) => setCover(e.target.files?.[0]?.name ?? "")} />
          </label>
        </Field>
        <Field id="pf-video" label="Demo video">
          <label htmlFor="pf-video" className="cursor-pointer rounded-xl border border-dashed border-royal px-3 py-2 text-center text-sm text-royal">
            {video || "Choose file"}
            <input id="pf-video" type="file" accept="video/*" className="sr-only" onChange={(e) => setVideo(e.target.files?.[0]?.name ?? "")} />
          </label>
        </Field>
      </div>
      <Field id="pf-summary" label="Product brief">
        <textarea id="pf-summary" rows={3} className={INPUT} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </Field>
      <Field id="pf-problems" label="The problem" hint="One point per line. This is what investors read first.">
        <textarea id="pf-problems" rows={3} className={INPUT} value={problems} onChange={(e) => setProblems(e.target.value)} />
      </Field>
      <Field id="pf-solution" label="The solution" hint="One point per line.">
        <textarea id="pf-solution" rows={3} className={INPUT} value={solution} onChange={(e) => setSolution(e.target.value)} />
      </Field>
      <Field id="pf-next" label="What you work on next" hint="One milestone per line.">
        <textarea id="pf-next" rows={3} className={INPUT} value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      {askChangeNote && (
        <Field id="pf-note" label="What changed?" hint="Shown to CFCI staff and reviewers as the update note.">
          <input id="pf-note" className={INPUT} value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example: added pilot site and tightened the problem statement" />
        </Field>
      )}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={!valid} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white disabled:opacity-40">
          {submitLabel}
        </button>
        {onSkip && (
          <button type="button" onClick={onSkip} className="px-3 py-2 font-medium text-muted">
            Skip for now
          </button>
        )}
      </div>
    </form>
  );
}
