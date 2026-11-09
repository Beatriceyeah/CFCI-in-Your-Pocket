import { describeMember } from "../lib/team";
import type { Product } from "../types";
import { Icon } from "./Icon";
import { PersonAvatar } from "./TeamPhoto";

function Line({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-canvas px-3 py-2">
      <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-royal">{label}</p>
      <p className="line-clamp-3 text-[0.92rem] leading-snug">{text}</p>
    </div>
  );
}

// First-impression card: the builders come first, listed one by one, then the product and a one-sentence
// problem and solution.
export function ProductCard({
  product,
  featured = false,
  updated = false,
}: {
  product: Product;
  featured?: boolean;
  updated?: boolean;
}) {
  const count = product.team.length;
  const size = count === 1 ? "size-20" : count === 2 ? "size-16" : "size-12";
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card bg-surface shadow-lg ring-1 ring-line">
      <div className="flex min-h-min flex-1 flex-col gap-2 px-5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-royal">Built by</p>
          <div className="flex gap-1.5">
            {featured && (
              <span className="flex items-center gap-1 rounded-full bg-interest px-2.5 py-1 text-xs font-bold text-white">
                <Icon name="star" className="size-3.5" />
                Featured
              </span>
            )}
            {updated && (
              <span className="rounded-full bg-interest/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-interest-deep">
                Updated
              </span>
            )}
          </div>
        </div>
        <ul aria-label="Team" className="flex min-h-0 flex-1 flex-col justify-center gap-3">
          {product.team.map((m, i) => (
            <li key={m.name} className="flex min-w-0 items-center gap-3.5">
              <PersonAvatar member={m} index={i} className={size} />
              <div className="min-w-0">
                <p className={`truncate font-display font-semibold leading-tight text-navy ${product.team.length < 3 ? "text-xl" : "text-[1.05rem]"}`}>
                  {m.name}
                </p>
                <p className="line-clamp-2 text-[0.85rem] leading-snug text-muted">
                  {describeMember(m).map(([, v]) => v).join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 flex-col gap-2 px-5 pb-4 pt-2">
        <h2 className="font-display text-2xl font-bold leading-tight text-navy">{product.name}</h2>
        <div className="flex flex-col gap-2">
          <Line label="The problem" text={product.pitchProblem} />
          <Line label="The solution" text={product.pitchSolution} />
        </div>
        <p className="text-xs text-muted">
          {product.stage} · {product.ip}
        </p>
      </div>
    </article>
  );
}
