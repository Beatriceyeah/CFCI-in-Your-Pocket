import { describeMember } from "../lib/team";
import type { Product } from "../types";
import { Icon } from "./Icon";
import { PersonAvatar } from "./TeamPhoto";

function Line({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl bg-canvas px-3 py-2">
      <p className="text-[0.78rem] font-bold uppercase tracking-wider text-royal">{label}</p>
      <p className="pc-line-text line-clamp-3 text-[0.92rem] leading-snug">{text}</p>
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
  // Avatars scale with the card's own height (cqh), so a short card shrinks them instead of cutting the bottom line off.
  const size =
    count === 1
      ? "size-[clamp(4rem,32cqh,9rem)]"
      : count === 2
        ? "size-[clamp(2.5rem,13cqh,4rem)]"
        : "size-[clamp(2rem,10cqh,3rem)]";
  return (
    <article className="product-card flex h-full flex-col overflow-y-auto overflow-x-hidden rounded-card bg-surface shadow-lg ring-1 ring-line">
      <div className="pc-top flex min-h-0 flex-1 flex-col gap-2 px-5 pt-4">
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
              <span className="whitespace-nowrap rounded-full bg-interest/15 px-2.5 py-1 text-xs font-bold text-interest-deep">
                Recently updated
              </span>
            )}
          </div>
        </div>
        <ul aria-label="Team" className="pc-team flex min-h-0 flex-1 flex-col justify-center gap-3">
          {product.team.map((m, i) => (
            <li key={m.name} className={`flex min-w-0 items-center ${count === 1 ? "gap-4" : "gap-3.5"}`}>
              <PersonAvatar member={m} index={i} className={size} />
              <div className="min-w-0">
                <p
                  className={`pc-name font-display font-semibold leading-tight text-navy ${
                    count === 1 ? "line-clamp-2 text-2xl" : `truncate ${count < 3 ? "text-xl" : "text-[1.05rem]"}`
                  }`}
                >
                  {m.name}
                </p>
                <p className={`pc-member-detail text-[0.85rem] leading-snug text-muted ${count === 1 ? "pc-single mt-0.5 line-clamp-3" : "line-clamp-2"}`}>
                  {count === 1
                    ? // One builder has room: each fact on its own line, so a long program name never leaves a dangling dot.
                      describeMember(m).map(([k, v]) => (
                        <span key={k} className="block">
                          {v}
                        </span>
                      ))
                    : describeMember(m).map(([, v]) => v).join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 flex-col gap-2 px-5 pb-4 pt-2">
        <h2 className="pc-title font-display text-2xl font-bold leading-tight text-navy">{product.name}</h2>
        <div className="flex flex-col gap-2">
          <Line label="The problem" text={product.pitchProblem} />
          <Line label="The solution" text={product.pitchSolution} />
        </div>
        <p className="pc-status text-xs text-muted">
          {product.stage} · {product.ip}
        </p>
      </div>
    </article>
  );
}
