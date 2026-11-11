import { describeMember } from "../lib/team";
import type { Product } from "../types";
import { Icon } from "./Icon";
import { PersonAvatar } from "./TeamPhoto";

// One side of the pitch, set off by a thin rule on the left instead of a box: grey for the problem, blue for the
// solution, so the two read as "problem, then answer".
function Pitch({ label, text, tone, big }: { label: string; text: string; tone: "problem" | "solution"; big: boolean }) {
  return (
    <div className={`border-l-[3px] pl-3.5 ${tone === "problem" ? "border-line" : "border-royal"}`}>
      <p className="text-[0.78rem] font-bold uppercase tracking-wider text-royal">{label}</p>
      <p
        className={`pc-line-text leading-snug text-ink ${
          big ? "line-clamp-4 text-[clamp(0.95rem,3.6cqh,1.12rem)]" : "line-clamp-3 text-[clamp(0.95rem,3.2cqh,1.05rem)]"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

// First-impression card: the product first (name, one-sentence problem and solution), then the builders listed one
// by one, with their photos and names kept prominent. The product block uses the leftover height and its type grows
// with the card, so a tall card has no dead space and a short one loses only the least important parts.
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
      ? "size-[clamp(3.5rem,13cqh,5rem)]"
      : count === 2
        ? "size-[clamp(2.75rem,10cqh,3.75rem)]"
        : "size-[clamp(2.25rem,8cqh,3rem)]";
  return (
    <article data-team={Math.min(count, 3)} className="product-card flex h-full flex-col overflow-y-auto overflow-x-hidden rounded-card bg-surface shadow-lg ring-1 ring-line">
      <div className="pc-top flex min-h-min flex-1 flex-col px-5 pt-4">
        <div className="pc-meta flex min-h-7 items-start justify-between gap-3">
          <p className="pc-status min-w-0 pt-1 text-xs leading-snug text-muted">
            {product.stage} · {product.ip}
          </p>
          <div className="flex shrink-0 gap-1.5">
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
        <div className="pc-body flex flex-1 flex-col justify-center gap-4 py-2">
          <h2 className="pc-title font-display text-[clamp(1.5rem,6.5cqh,2.2rem)] font-bold leading-[1.1] text-navy">
            {product.name}
          </h2>
          <div className="pc-pitches flex flex-col gap-3.5">
            <Pitch label="The problem" text={product.pitchProblem} tone="problem" big={count < 3} />
            <Pitch label="The solution" text={product.pitchSolution} tone="solution" big={count < 3} />
          </div>
        </div>
      </div>

      <div className="pc-built shrink-0 border-t border-line px-5 pb-4 pt-3">
        <p className="pc-built-label mb-2 text-xs font-semibold uppercase tracking-wider text-royal">Built by</p>
        <ul aria-label="Team" className="pc-team flex flex-col gap-2.5">
          {product.team.map((m, i) => (
            <li key={m.name} className="flex min-w-0 items-center gap-3.5">
              <PersonAvatar member={m} index={i} className={size} />
              <div className="min-w-0">
                <p
                  className={`pc-name font-display font-semibold leading-tight text-navy ${
                    count === 1 ? "line-clamp-2 text-xl" : `truncate ${count < 3 ? "text-lg" : "text-[1.05rem]"}`
                  }`}
                >
                  {m.name}
                </p>
                <p className={`pc-member-detail text-[0.85rem] leading-snug text-muted ${count === 1 ? "pc-single mt-0.5 line-clamp-3" : count >= 3 ? "line-clamp-1" : "line-clamp-2"}`}>
                  {count === 1
                    ? describeMember(m).map(([k, v]) => (
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
    </article>
  );
}
