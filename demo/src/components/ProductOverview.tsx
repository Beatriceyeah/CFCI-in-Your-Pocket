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

// One labelled section. `rule` puts a thin line on its left (the pitch), `divided` a hairline above it (the details),
// so the page reads as: what it is, who builds it, then the details, each clearly set apart.
function Block({
  title,
  children,
  updated = false,
  tint = false,
  rule,
  divided = false,
}: {
  title: string;
  children: ReactNode;
  /** Show the "Recently updated" tag beside the title. */
  updated?: boolean;
  /** Mark the whole text of the block (for a block that is one piece of text). */
  tint?: boolean;
  rule?: "grey" | "blue";
  divided?: boolean;
}) {
  return (
    <section
      className={`flex flex-col gap-1.5 ${divided ? "border-t border-line pt-5" : ""} ${
        rule ? `border-l-[3px] pl-3.5 ${rule === "blue" ? "border-royal" : "border-line"}` : ""
      }`}
    >
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

// Reads top to bottom: the product (name, one line, stage), the pitch (problem, solution), the builders, then the
// details (snapshot, market, why it wins, traction, next). `lens` lets a caller place a feedback control right beside
// the data it is about.
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
  const version = product.version ?? 1;
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h3 className={`font-display text-2xl font-bold leading-tight text-navy ${isField("name") ? `${MARK} -mx-2 px-2` : ""}`}>
          {product.name}
        </h3>
        <p className={`text-base leading-snug text-ink ${isField("tagline") ? `${MARK} -mx-2 px-2 py-0.5` : ""}`}>{product.tagline}</p>
        <p className="text-xs text-muted">
          <span className="font-semibold text-royal">{product.stage}</span> · {product.ip} · Version {version}
          {version > 1 ? ` (${freshnessLabel(product.daysSinceUpdate)})` : ""}
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Block title="The problem" rule="grey" updated={isField("pitchProblem")} tint={isField("pitchProblem")}>
          <p className="text-[1rem] leading-snug">{product.pitchProblem}</p>
        </Block>
        <Block title="The solution" rule="blue" updated={isField("pitchSolution")} tint={isField("pitchSolution")}>
          <p className="text-[1rem] leading-snug">{product.pitchSolution}</p>
        </Block>
      </div>
      {at("problem")}

      <section className="flex flex-col gap-3 border-t border-line pt-5" aria-label="Built by">
        <h3 className="text-[0.85rem] font-bold uppercase tracking-wider text-royal">Built by</h3>
        <ul className="flex flex-col divide-y divide-line" aria-label="Team">
          {product.team.map((m, i) => {
            // One line says who they are: role or degree and year first, then the program (and school). Most sample
            // summaries do not list a program yet, so it reads "Program not listed yet" until the team supplies it.
            const facts = describeMember(m);
            const who = facts.filter(([k]) => k === "Role" || k === "Degree").map(([, v]) => v);
            const program = facts.find(([k]) => k === "Program")?.[1];
            const school = facts.find(([k]) => k === "School")?.[1];
            return (
              <li key={m.name} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                <PersonAvatar member={m} index={i} className="size-12" />
                <div className="min-w-0">
                  <p className="font-display text-[1.1rem] font-semibold leading-tight text-navy">{m.name}</p>
                  <p className="mt-0.5 flex flex-wrap gap-x-2.5 text-[0.88rem] leading-snug">
                    {who.length > 0 && <span className="whitespace-nowrap text-ink">{who.join(" · ")}</span>}
                    <span className={program ? "text-muted" : "text-muted/70"}>
                      {program ? [program, school].filter(Boolean).join(", ") : "Program not listed yet"}
                    </span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-x-4 border-t border-line pt-5" aria-label="Snapshot">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Stage</p>
          <p className="font-display text-lg font-semibold text-navy">{product.stage}</p>
          <p className="text-xs text-muted">{STAGE_NOTE[product.stage]}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">IP position</p>
          <p className="font-display text-lg font-semibold leading-tight text-navy">{product.ip}</p>
        </div>
      </section>

      <Block title="The market" divided>
        <div className="grid grid-cols-2 gap-x-4">
          {product.market.slice(0, 2).map((m) => (
            <div key={m.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{MARKET_LABEL[m.label] ?? m.label}</p>
              <p className="font-display text-lg font-semibold leading-tight text-navy">{m.value}</p>
              <p className="text-xs leading-snug text-muted">{m.note}</p>
            </div>
          ))}
        </div>
      </Block>
      {at("market")}
      {at("revenue")}

      <Block title="Why it wins" divided updated={newPoints("edge").length > 0}>
        <Points items={product.edge} changed={newPoints("edge")} />
      </Block>
      {at("edge")}
      <Block title="Traction so far" divided updated={newPoints("traction").length > 0}>
        <Points items={product.traction} changed={newPoints("traction")} />
      </Block>
      {at("readiness")}
      <Block title="Next" divided updated={newPoints("next").length > 0}>
        <Points items={product.next} changed={newPoints("next")} />
      </Block>
    </div>
  );
}
