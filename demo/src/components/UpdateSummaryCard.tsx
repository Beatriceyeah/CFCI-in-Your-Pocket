import type { UpdateSummary } from "../types";
import { Icon } from "./Icon";

/** Sits at the top of an overview the viewer has seen before: a short summary of what the team changed since. */
export function UpdateSummaryCard({
  summary,
  from,
  to,
  marked = false,
}: {
  summary: UpdateSummary;
  from: number;
  to: number;
  /** The changed parts are also marked in the overview below. */
  marked?: boolean;
}) {
  return (
    <section className="flex flex-col gap-1.5 rounded-xl bg-royal/5 p-3 ring-1 ring-royal/15" aria-label="What changed">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-royal">
        <Icon name="sparkle" className="size-4" />
        What changed
        <span className="font-semibold normal-case tracking-normal text-muted">
          · v{from} to v{to}
        </span>
        <span className="ml-auto rounded-full bg-royal/10 px-2 py-0.5 text-[0.65rem] normal-case tracking-normal">AI summary</span>
      </p>
      <p className="font-semibold leading-snug text-navy">{summary.headline}</p>
      {summary.points.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-sm">
          {summary.points.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="mt-[0.6rem] size-1 shrink-0 rounded-full bg-royal" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      )}
      {marked && <p className="text-xs text-muted">Changed parts are marked in green below.</p>}
    </section>
  );
}
