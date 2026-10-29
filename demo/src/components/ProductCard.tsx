import { teamLine } from "../lib/team";
import type { Product } from "../types";
import { CoverArt } from "./CoverArt";

function Line({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-canvas px-3 py-2">
      <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-royal">{label}</p>
      <p className="text-[0.92rem] leading-snug">{text}</p>
    </div>
  );
}

// First-impression card: who is behind it, then a one-sentence problem and solution. No tags.
export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const shown = product.team.slice(0, 2);
  const more = product.team.length - shown.length;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-lg ring-1 ring-line">
      <CoverArt product={product} featured={featured} className="min-h-28 flex-1" />
      <div className="flex shrink-0 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-bold leading-tight text-navy">{product.name}</h2>
          <ul className="text-[0.82rem] leading-snug text-muted" aria-label="Team">
            {shown.map((m) => (
              <li key={m.name} className="truncate">
                {teamLine(m)}
              </li>
            ))}
            {more > 0 && <li>+{more} more</li>}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <Line label="The problem" text={product.pitchProblem} />
          <Line label="The solution" text={product.pitchSolution} />
        </div>
      </div>
    </article>
  );
}
