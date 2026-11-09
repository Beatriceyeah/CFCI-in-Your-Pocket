import { useState } from "react";
import { IntroButton, IntroSheet } from "../../components/ConnectBox";
import { CoverArt } from "../../components/CoverArt";
import { Pill } from "../../components/Pill";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { SKIP_REASONS } from "../../data/dimensions";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

type Tab = "later" | "reviewed" | "no";

// Everything this person has touched: what they saved to review later, what they have already given feedback
// on (it saves as they type, like a shared doc), and what they passed on.
export function MyReviewsPage() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>("later");
  const [viewing, setViewing] = useState<{ product: Product; focus: boolean } | null>(null);
  const [intro, setIntro] = useState<Product | null>(null);

  const byId = (id: string) => state.products.find((p) => p.id === id);
  const takeOf = (id: string) => state.evaluations.find((e) => e.productId === id);
  const later = Object.values(state.swipes)
    .filter((s) => s.direction === "right")
    .map((s) => byId(s.productId))
    .filter((p): p is Product => !!p && !takeOf(p.id));
  // Each venture sits in one place: passed ventures stay under Not interested, even if you wrote something first.
  const reviewed = state.evaluations
    .filter((e) => state.swipes[e.productId]?.direction !== "left")
    .map((e) => byId(e.productId))
    .filter((p): p is Product => !!p);
  const passed = Object.values(state.swipes).filter((s) => s.direction === "left");
  const helped = state.evaluations.length;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "later", label: "Review later", count: later.length },
    { key: "reviewed", label: "Reviewed", count: reviewed.length },
    { key: "no", label: "Not interested", count: passed.length },
  ];

  const row = (p: Product, action: React.ReactNode, extra?: React.ReactNode) => (
    <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "record_open", productId: p.id });
          setViewing({ product: p, focus: false });
        }}
        className="shrink-0"
        aria-label={`Open ${p.name}`}
      >
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
        <h1 className="font-display text-2xl font-bold text-navy">My reviews</h1>
        <p className="text-sm text-muted">
          Everything you add saves automatically, like a shared doc. Students read every note.
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
            className={`rounded-full px-1 py-2 text-[0.8rem] font-medium ${tab === t.key ? "bg-navy text-white" : "text-muted"}`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {tab === "later" &&
          (later.length
            ? later.map((p) =>
                row(
                  p,
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewing({ product: p, focus: true })}
                      className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
                    >
                      Review now
                    </button>
                    <IntroButton product={p} compact onOpen={() => setIntro(p)} />
                  </div>,
                ),
              )
            : empty("Tap Review later on a venture in Browse and it waits for you here."))}
        {tab === "reviewed" &&
          (reviewed.length ? (
            <>
              {[
                { label: "Partially completed", items: reviewed.filter((p) => takeOf(p.id)?.partial), partial: true },
                { label: "Completed", items: reviewed.filter((p) => !takeOf(p.id)?.partial), partial: false },
              ]
                .filter((g) => g.items.length)
                .map((g) => (
                  <li key={g.label} className="flex flex-col gap-2">
                    <p className="px-1 pt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                      {g.label} ({g.items.length})
                    </p>
                    <ul className="flex flex-col gap-2">
                      {g.items.map((p) =>
                        row(
                          p,
                          <button
                            type="button"
                            onClick={() => setViewing({ product: p, focus: true })}
                            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
                          >
                            {g.partial ? "Continue" : "Update"}
                          </button>,
                        ),
                      )}
                    </ul>
                  </li>
                ))}
            </>
          ) : (
            empty("Nothing reviewed yet. Open any venture and add your view beside the section.")
          ))}
        {tab === "no" &&
          (passed.length
            ? passed.flatMap((s) => {
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
                    Back to feed
                  </button>,
                  reason ? (
                    <div className="mt-1 flex gap-1.5">
                      <Pill>{reason}</Pill>
                    </div>
                  ) : undefined,
                );
              })
            : empty("Nothing here."))}
      </ul>

      {viewing && (
        <ProductInfoSheet
          product={viewing.product}
          feedback
          focusFeedback={viewing.focus}
          onClose={() => setViewing(null)}
          introAction={<IntroButton product={viewing.product} onOpen={() => setIntro(viewing.product)} />}
          footer={(done) => (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={done}
                className="flex-1 whitespace-nowrap rounded-full bg-navy px-3 py-2.5 text-sm font-semibold text-white"
              >
                Done
              </button>
              {state.swipes[viewing.product.id]?.direction !== "left" && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "swipe", productId: viewing.product.id, direction: "left" });
                    setViewing(null);
                  }}
                  className="flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-semibold text-ink ring-1 ring-line"
                >
                  Mark as not interested
                </button>
              )}
            </div>
          )}
        />
      )}
      {intro && <IntroSheet product={intro} onClose={() => setIntro(null)} />}
    </div>
  );
}
