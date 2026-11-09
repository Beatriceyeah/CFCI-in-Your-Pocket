import { useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { IntroButton, IntroSheet } from "../../components/ConnectBox";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { Pill } from "../../components/Pill";
import { SKIP_REASONS } from "../../data/dimensions";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

type Tab = "todo" | "done" | "skipped";

export function ShortlistPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>("todo");
  const [viewing, setViewing] = useState<{ product: Product; focus: boolean } | null>(null);
  const [intro, setIntro] = useState<Product | null>(null);

  const byId = (id: string) => state.products.find((p) => p.id === id);
  const liked = Object.values(state.swipes)
    .filter((s) => s.direction === "right")
    .map((s) => byId(s.productId))
    .filter((p): p is Product => !!p);
  const takeOf = (id: string) => state.evaluations.find((e) => e.productId === id);
  const todo = liked.filter((p) => !takeOf(p.id) || takeOf(p.id)?.partial);
  const done = liked.filter((p) => takeOf(p.id) && !takeOf(p.id)?.partial);
  const helped = state.evaluations.filter((e) => !e.partial).length;
  const skipped = Object.values(state.swipes).filter((s) => s.direction === "left");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "todo", label: "To help", count: todo.length },
    { key: "done", label: "Shared", count: done.length },
    { key: "skipped", label: "Skipped", count: skipped.length },
  ];

  const row = (p: Product, action: React.ReactNode, extra?: React.ReactNode) => (
    <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
      <button type="button" onClick={() => {
          dispatch({ type: "record_open", productId: p.id });
          setViewing({ product: p, focus: false });
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
            ? `${todo.length} team${todo.length > 1 ? "s" : ""} could use your help`
            : "Your shortlist"}
        </h1>
        <p className="text-sm text-muted">
          Students read every note. A minute of your view helps a team decide what to build next.
        </p>
        {helped > 0 && (
          <p className="mt-2 rounded-2xl bg-interest/10 px-4 py-2 text-sm font-semibold text-interest-deep">
            Thank you. You have helped {helped} {helped === 1 ? "team" : "teams"} so far.
          </p>
        )}
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
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewing({ product: p, focus: true })}
                      className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
                    >
                      {takeOf(p.id) ? "Continue" : "Help this team"}
                    </button>
                    <IntroButton product={p} compact onOpen={() => setIntro(p)} />
                  </div>,
                  takeOf(p.id) ? (
                    <div className="mt-1">
                      <Pill tone="warn">Partially completed</Pill>
                    </div>
                  ) : undefined,
                ),
              )
            : empty("Tap the eye in Browse to build your shortlist."))}
        {tab === "done" &&
          (done.length
            ? done.map((p) =>
                row(
                  p,
                  <button
                    type="button"
                    onClick={() => setViewing({ product: p, focus: true })}
                    className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
                  >
                    Update my take
                  </button>,
                  <div className="mt-1">
                    <Pill tone="good">Shared</Pill>
                  </div>,
                ),
              )
            : empty("Nothing shared yet."))}
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

      {viewing && (
        <ProductInfoSheet
          product={viewing.product}
          feedback
          focusFeedback={viewing.focus}
          onShared={() => setTab("done")}
          onClose={() => setViewing(null)}
          footer={<IntroButton product={viewing.product} onOpen={() => setIntro(viewing.product)} />}
        />
      )}
      {intro && <IntroSheet product={intro} onClose={() => setIntro(null)} />}
    </div>
  );
}
