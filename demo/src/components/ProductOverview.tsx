import { STAGE_NOTE } from "../data/dimensions";
import { teamLine } from "../lib/team";
import type { Product } from "../types";

const MARKET_LABEL: Record<string, string> = {
  TAM: "Market size (TAM)",
  SAM: "Reachable market (SAM)",
  SOM: "Near-term target (SOM)",
};

const MAX_POINTS = 2;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-royal">{title}</h3>
      {children}
    </section>
  );
}

function Points({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-muted">Not added yet.</p>;
  return (
    <ul className="flex flex-col gap-1.5 text-[0.95rem] leading-snug">
      {items.slice(0, MAX_POINTS).map((t) => (
        <li key={t} className="flex gap-2.5">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-royal" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

// Short on purpose: a one-sentence pitch and the top two points per section.
export function ProductOverview({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h3 className="font-display text-2xl font-bold leading-tight text-navy">{product.name}</h3>
        <p className="text-base text-muted">{product.tagline}</p>
      </header>

      <Block title="The problem">
        <p className="text-[0.95rem] leading-snug">{product.pitchProblem}</p>
      </Block>
      <Block title="The solution">
        <p className="text-[0.95rem] leading-snug">{product.pitchSolution}</p>
      </Block>

      <section className="grid grid-cols-2 gap-2" aria-label="Snapshot">
        <div className="rounded-xl bg-canvas p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Stage</p>
          <p className="font-display text-lg font-semibold text-navy">{product.stage}</p>
          <p className="text-xs text-muted">{STAGE_NOTE[product.stage]}</p>
        </div>
        <div className="rounded-xl bg-canvas p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">IP position</p>
          <p className="font-display text-lg font-semibold leading-tight text-navy">{product.ip}</p>
        </div>
        {product.market.slice(0, 2).map((m) => (
          <div key={m.label} className="rounded-xl bg-canvas p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{MARKET_LABEL[m.label] ?? m.label}</p>
            <p className="font-display text-lg font-semibold leading-tight text-navy">{m.value}</p>
            <p className="line-clamp-2 text-xs text-muted">{m.note}</p>
          </div>
        ))}
      </section>

      <Block title="Why it wins">
        <Points items={product.edge} />
      </Block>
      <Block title="Traction so far">
        <Points items={product.traction} />
      </Block>
      <Block title="Next">
        <Points items={product.next} />
      </Block>
      <Block title="Team">
        <ul className="flex flex-col gap-0.5 text-[0.92rem]">
          {product.team.map((t) => (
            <li key={t.name}>{teamLine(t)}</li>
          ))}
        </ul>
      </Block>
    </div>
  );
}
