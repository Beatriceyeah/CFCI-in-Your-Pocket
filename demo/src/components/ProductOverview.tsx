import type { ReactNode } from "react";
import { STAGE_NOTE } from "../data/dimensions";
import type { ChangedField, DimensionKey, Product, UpdateChanges } from "../types";
import { freshnessLabel } from "../lib/analytics";
import { describeMember } from "../lib/team";
import { PersonAvatar } from "./TeamPhoto";

const MARKET_LABEL: Record<string, string> = {
  TAM: "Market size (TAM)",
  SAM: "Reachable market (SAM)",
  SOM: "Near-term target (SOM)",
};

const MAX_POINTS = 2;

// The green used everywhere for "the team changed this".
const MARK = "rounded-lg bg-interest/10 ring-1 ring-interest/25";

function UpdatedTag() {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold normal-case tracking-normal text-interest-deep">
      <span className="size-1.5 rounded-full bg-interest" aria-hidden="true" />
      Recently updated
    </span>
  );
}

function Block({
  title,
  children,
  updated = false,
  tint = false,
}: {
  title: string;
  children: ReactNode;
  /** Show the "Recently updated" tag beside the title. */
  updated?: boolean;
  /** Mark the whole text of the block (for a block that is one piece of text). */
  tint?: boolean;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="flex items-center justify-between gap-2 text-[0.85rem] font-bold uppercase tracking-wider text-royal">
        {title}
        {updated && <UpdatedTag />}
      </h3>
      {tint ? <div className={`${MARK} px-3 py-2`}>{children}</div> : children}
    </section>
  );
}

function Points({ items, changed = [] }: { items: string[]; changed?: string[] }) {
  if (!items.length) return <p className="text-sm text-muted">Not added yet.</p>;
  // New points come first, so they are always among the ones shown.
  const ordered = [...items.filter((t) => changed.includes(t)), ...items.filter((t) => !changed.includes(t))];
  return (
    <ul className="flex flex-col gap-1.5 text-[0.95rem] leading-snug">
      {ordered.slice(0, Math.max(MAX_POINTS, changed.length)).map((t) => (
        <li key={t} className={`flex gap-2.5 ${changed.includes(t) ? `${MARK} px-2.5 py-1.5` : ""}`}>
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-royal" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

// Short on purpose: the team first, a one-sentence pitch, then the top two points per section.
// `lens` lets a caller place a feedback control right beside the data it is about.
export function ProductOverview({
  product,
  lens,
  changes,
}: {
  product: Product;
  lens?: (key: DimensionKey) => ReactNode;
  /** When given, the parts the team changed since the viewer last looked are marked. */
  changes?: UpdateChanges;
}) {
  const at = (key: DimensionKey) => lens?.(key) ?? null;
  const isField = (f: ChangedField) => !!changes?.fields.includes(f);
  const newPoints = (list: "edge" | "traction" | "next") => changes?.items[list] ?? [];
  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h3 className={`font-display text-2xl font-bold leading-tight text-navy ${isField("name") ? `${MARK} -mx-2 px-2` : ""}`}>
          {product.name}
        </h3>
        <p className={`text-base text-muted ${isField("tagline") ? `${MARK} -mx-2 px-2 py-0.5` : ""}`}>{product.tagline}</p>
        <p className="text-xs font-semibold text-royal">
          Version {product.version ?? 1}
          <span className="font-medium text-muted">
            {" "}
            · {(product.version ?? 1) > 1 ? freshnessLabel(product.daysSinceUpdate) : "Original listing"}
          </span>
        </p>
      </header>

      <ul className="flex flex-col gap-2" aria-label="Team">
        {product.team.map((m, i) => {
          // Program is always shown. Most sample summaries do not list it yet, so it reads "Not listed yet" until
          // the team supplies it.
          const facts = describeMember(m);
          const rows: [string, string][] = facts.some(([k]) => k === "Program")
            ? facts
            : [...facts.filter(([k]) => k !== "School"), ["Program", ""], ...facts.filter(([k]) => k === "School")];
          return (
            <li key={m.name} className="flex items-start gap-3.5 rounded-2xl bg-canvas p-3">
              <PersonAvatar member={m} index={i} className="size-16" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-semibold leading-tight text-navy">{m.name}</p>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[0.88rem] leading-snug">
                  {rows.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted">{k}</dt>
                      <dd className={v ? "font-medium" : "text-muted"}>{v || "Not listed yet"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </li>
          );
        })}
      </ul>

      <Block title="The problem" updated={isField("pitchProblem")} tint={isField("pitchProblem")}>
        <p className="text-[0.95rem] leading-snug">{product.pitchProblem}</p>
      </Block>
      <Block title="The solution" updated={isField("pitchSolution")} tint={isField("pitchSolution")}>
        <p className="text-[0.95rem] leading-snug">{product.pitchSolution}</p>
      </Block>
      {at("problem")}

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
      </section>

      <Block title="The market">
        <div className="grid grid-cols-2 gap-2">
          {product.market.slice(0, 2).map((m) => (
            <div key={m.label} className="rounded-xl bg-canvas p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{MARKET_LABEL[m.label] ?? m.label}</p>
              <p className="font-display text-lg font-semibold leading-tight text-navy">{m.value}</p>
              <p className="line-clamp-2 text-xs text-muted">{m.note}</p>
            </div>
          ))}
        </div>
      </Block>
      {at("market")}
      {at("revenue")}

      <Block title="Why it wins" updated={newPoints("edge").length > 0}>
        <Points items={product.edge} changed={newPoints("edge")} />
      </Block>
      {at("edge")}
      <Block title="Traction so far" updated={newPoints("traction").length > 0}>
        <Points items={product.traction} changed={newPoints("traction")} />
      </Block>
      {at("readiness")}
      <Block title="Next" updated={newPoints("next").length > 0}>
        <Points items={product.next} changed={newPoints("next")} />
      </Block>
    </div>
  );
}
