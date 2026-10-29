import { useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { EvaluateSheet } from "../../components/EvaluateSheet";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { Pill } from "../../components/Pill";
import { SKIP_REASONS } from "../../data/dimensions";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

type Tab = "todo" | "done" | "skipped";

export function ShortlistPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>("todo");
  const [evaluating, setEvaluating] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);

  const byId = (id: string) => state.products.find((p) => p.id === id);
  const liked = Object.values(state.swipes)
    .filter((s) => s.direction === "right")
    .map((s) => byId(s.productId))
    .filter((p): p is Product => !!p);
  const evaluated = new Set(state.evaluations.map((e) => e.productId));
  const todo = liked.filter((p) => !evaluated.has(p.id));
  const done = liked.filter((p) => evaluated.has(p.id));
  const skipped = Object.values(state.swipes).filter((s) => s.direction === "left");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "todo", label: "To rate", count: todo.length },
    { key: "done", label: "Rated", count: done.length },
    { key: "skipped", label: "Skipped", count: skipped.length },
  ];

  const row = (p: Product, action: React.ReactNode, extra?: React.ReactNode) => (
    <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
      <button type="button" onClick={() => {
          dispatch({ type: "record_open", productId: p.id });
          setViewing(p);
        }} className="shrink-0" aria-label={`Open ${p.name}`}>
        <CoverArt product={p} className="size-16 rounded-xl" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-semibold text-navy">{p.name}</p>
        <p className="line-clamp-2 text-sm text-muted">{p.tagline}</p>
        {extra}
      </div>
      {action}
    </li>
  );

  const empty = (text: string) => (
    <p className="rounded-2xl bg-surface p-6 text-center text-muted ring-1 ring-line">{text}</p>
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">
          {todo.length
            ? `${todo.length} product${todo.length > 1 ? "s" : ""} waiting for your take`
            : "Your shortlist"}
        </h1>
        <p className="text-sm text-muted">
          Five quick scores tell the team what you think. It takes about a minute each.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1 ring-1 ring-line" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-2 py-2 text-sm font-medium ${
              tab === t.key ? "bg-navy text-white" : "text-muted"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {tab === "todo" &&
          (todo.length
            ? todo.map((p) =>
                row(
                  p,
                  <button
                    type="button"
                    onClick={() => setEvaluating(p)}
                    className="shrink-0 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
                  >
                    {state.drafts[p.id] ? "Continue my take" : "Share your take"}
                  </button>,
                  state.drafts[p.id] ? (
                    <div className="mt-1">
                      <Pill tone="warn">Draft saved</Pill>
                    </div>
                  ) : undefined,
                ),
              )
            : empty("Swipe right in Browse to build your shortlist."))}
        {tab === "done" &&
          (done.length
            ? done.map((p) =>
                row(
                  p,
                  <button
                    type="button"
                    onClick={() => setEvaluating(p)}
                    className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
                  >
                    Edit my take
                  </button>,
                  <div className="mt-1">
                    <Pill tone="good">Rated</Pill>
                  </div>,
                ),
              )
            : empty("Nothing rated yet."))}
        {tab === "skipped" &&
          (skipped.length
            ? skipped.flatMap((s) => {
                const p = byId(s.productId);
                if (!p) return [];
                const reason = SKIP_REASONS.find((r) => r.key === s.reason)?.label;
                return row(
                  p,
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "undo_swipe", productId: p.id })}
                    className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
                  >
                    Bring back
                  </button>,
                  <div className="mt-1 flex gap-1.5">
                    {reason && <Pill>{reason}</Pill>}
                    {s.revisit && <Pill tone="warn">Revisit</Pill>}
                  </div>,
                );
              })
            : empty("Nothing skipped."))}
      </ul>

      {viewing && <ProductInfoSheet product={viewing} onClose={() => setViewing(null)} />}
      {evaluating && state.session && (
        <EvaluateSheet
          product={evaluating}
          existing={state.evaluations.find((e) => e.productId === evaluating.id)}
          draft={state.drafts[evaluating.id]}
          viewerLabel={state.session.roleLabel}
          onDraft={(draft) => dispatch({ type: "save_draft", productId: evaluating.id, draft })}
          onSave={(evaluation) => {
            dispatch({ type: "save_evaluation", evaluation });
            setEvaluating(null);
            setTab("done");
          }}
          onClose={() => setEvaluating(null)}
        />
      )}
    </div>
  );
}
