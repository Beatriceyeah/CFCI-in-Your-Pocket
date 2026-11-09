import { useState } from "react";
import { IntroButton, IntroSheet } from "../../components/ConnectBox";
import { CoverArt } from "../../components/CoverArt";
import { Pill } from "../../components/Pill";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { SKIP_REASONS } from "../../data/dimensions";
import { freshnessLabel } from "../../lib/analytics";
import { updatedForViewer, updatedPassedForViewer, updatedSavedForViewer } from "../../lib/updates";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

type Tab = "later" | "reviewed" | "no";
type Sub = "partial" | "done";

// Everything this person has touched: what they saved to review later, what they have already given feedback
// on (it saves as they type, like a shared doc), and what they passed on.
export function MyReviewsPage() {
  const { state, dispatch } = useStore();
  const updated = updatedForViewer(state);
  const updatedSaved = updatedSavedForViewer(state);
  const updatedPassed = updatedPassedForViewer(state);
  const [viewing, setViewing] = useState<{ product: Product; focus: boolean } | null>(null);
  const [intro, setIntro] = useState<Product | null>(null);

  const byId = (id: string) => state.products.find((p) => p.id === id);
  const takeOf = (id: string) => state.evaluations.find((e) => e.productId === id);
  const isUpdated = (id: string) => updated.some((p) => p.id === id);
  const isUpdatedSaved = (id: string) => updatedSaved.some((p) => p.id === id);
  const isUpdatedPassed = (id: string) => updatedPassed.some((p) => p.id === id);
  // Updated ones go first, and keep their order otherwise.
  const updatedFirst = (items: Product[], flagged: (id: string) => boolean): Product[] => [
    ...items.filter((p) => flagged(p.id)),
    ...items.filter((p) => !flagged(p.id)),
  ];
  // Review later opens at the latest version of the venture, so it never needs a "what changed". Reviewed ventures
  // do: the team's update is compared with what you said. Passed ventures stay under Not interested, even if you
  // wrote something first.
  const later = updatedFirst(
    Object.values(state.swipes)
      .filter((s) => s.direction === "right")
      .map((s) => byId(s.productId))
      .filter((p): p is Product => !!p && !takeOf(p.id)),
    isUpdatedSaved,
  );
  const reviewed = state.evaluations
    .filter((e) => state.swipes[e.productId]?.direction !== "left")
    .map((e) => byId(e.productId))
    .filter((p): p is Product => !!p);
  const partial = updatedFirst(reviewed.filter((p) => takeOf(p.id)?.partial), isUpdated);
  const done = updatedFirst(reviewed.filter((p) => !takeOf(p.id)?.partial), isUpdated);
  const passedAll = Object.values(state.swipes).filter((s) => s.direction === "left");
  const passed = [
    ...passedAll.filter((s) => isUpdatedPassed(s.productId)),
    ...passedAll.filter((s) => !isUpdatedPassed(s.productId)),
  ];
  const helped = state.evaluations.length;

  // Land where something changed: Reviewed (on the part that has an update) first, then Review later.
  const [tab, setTab] = useState<Tab>(() =>
    updated.length ? "reviewed" : updatedSaved.length ? "later" : updatedPassed.length ? "no" : "later",
  );
  const [sub, setSub] = useState<Sub>(() =>
    partial.some((p) => isUpdated(p.id)) || !done.length ? "partial" : "done",
  );

  const tabs: { key: Tab; label: string; count: number; dot?: boolean; soft?: boolean }[] = [
    { key: "later", label: "Review later", count: later.length, dot: updatedSaved.length > 0 },
    { key: "reviewed", label: "Reviewed", count: reviewed.length, dot: updated.length > 0 },
    { key: "no", label: "Not interested", count: passed.length, dot: updatedPassed.length > 0, soft: true },
  ];
  const subs: { key: Sub; label: string; items: Product[] }[] = [
    { key: "partial", label: "Partially completed", items: partial },
    { key: "done", label: "Completed", items: done },
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
            {t.dot && (
              <span
                className={`ml-1 inline-block size-1.5 rounded-full align-middle ${t.soft ? "bg-interest/45" : "bg-interest"}`}
                role="img"
                aria-label="has updates"
              />
            )}
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
                  updatedSaved.some((u) => u.id === p.id) ? (
                    <p className="mt-1">
                      <span className="whitespace-nowrap rounded-full bg-interest/15 px-2 py-0.5 text-[0.7rem] font-bold text-interest-deep">
                        Recently updated
                      </span>
                    </p>
                  ) : undefined,
                ),
              )
            : empty("Tap Review later on a venture in Browse and it waits for you here."))}
        {tab === "reviewed" && (
          <>
            <li>
              <div className="grid grid-cols-2 gap-1 rounded-full bg-canvas p-1 ring-1 ring-line" role="tablist" aria-label="Reviewed">
                {subs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={sub === t.key}
                    onClick={() => setSub(t.key)}
                    className={`rounded-full px-2 py-1.5 text-[0.78rem] font-medium ${sub === t.key ? "bg-surface text-navy shadow-sm ring-1 ring-line" : "text-muted"}`}
                  >
                    {t.label} ({t.items.length})
                    {t.items.some((p) => isUpdated(p.id)) && (
                      <span
                        className="ml-1 inline-block size-1.5 rounded-full bg-interest align-middle"
                        role="img"
                        aria-label="has updates"
                      />
                    )}
                  </button>
                ))}
              </div>
            </li>
            {(subs.find((t) => t.key === sub)?.items ?? []).length
              ? (subs.find((t) => t.key === sub)?.items ?? []).map((p) => {
                  if (isUpdated(p.id)) {
                    const since = state.seen[p.id] ?? takeOf(p.id)?.version ?? 1;
                    return (
                      <li key={p.id} className="flex flex-col gap-2.5 rounded-2xl bg-surface p-3 ring-1 ring-interest/40">
                        <div className="flex items-center gap-3">
                          <CoverArt product={p} className="size-14 shrink-0 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-semibold leading-tight text-navy">{p.name}</p>
                            <p className="mt-0.5 text-xs font-semibold text-royal">
                              v{since} to v{p.version ?? 1}
                              <span className="font-medium text-muted"> · {freshnessLabel(p.daysSinceUpdate)}</span>
                            </p>
                          </div>
                          <span className="self-start whitespace-nowrap rounded-full bg-interest/15 px-2 py-0.5 text-[0.7rem] font-bold text-interest-deep">
                            Recently updated
                          </span>
                        </div>
                        {p.updateSummary && <p className="text-sm leading-snug">{p.updateSummary.headline}</p>}
                        <button
                          type="button"
                          onClick={() => {
                            dispatch({ type: "record_open", productId: p.id });
                            setViewing({ product: p, focus: false });
                          }}
                          className="rounded-full bg-navy py-2.5 text-sm font-semibold text-white"
                        >
                          See what changed
                        </button>
                      </li>
                    );
                  }
                  return row(
                    p,
                    <button
                      type="button"
                      onClick={() => setViewing({ product: p, focus: true })}
                      className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
                    >
                      {sub === "partial" ? "Continue" : "Update"}
                    </button>,
                  );
                })
              : empty(
                  sub === "partial"
                    ? "Nothing half-finished. Reviews with a missing answer wait here."
                    : "Nothing completed yet. Open any venture and add your view beside the section.",
                )}
          </>
        )}
        {tab === "no" &&
          (passed.length
            ? passed.flatMap((sw) => {
                const p = byId(sw.productId);
                if (!p) return [];
                const reason = SKIP_REASONS.find((r) => r.key === sw.reason)?.label;
                const back = (
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "undo_swipe", productId: p.id })}
                    className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
                  >
                    Back to feed
                  </button>
                );
                if (isUpdatedPassed(p.id)) {
                  // The same marking as elsewhere, in a softer green: they passed on it, so it asks for less attention.
                  const since = state.seen[p.id] ?? sw.version ?? 1;
                  return (
                    <li key={p.id} className="flex flex-col gap-2.5 rounded-2xl bg-surface p-3 ring-1 ring-interest/20">
                      <div className="flex items-center gap-3">
                        <CoverArt product={p} className="size-14 shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-semibold leading-tight text-navy">{p.name}</p>
                          <p className="mt-0.5 text-xs font-semibold text-royal">
                            v{since} to v{p.version ?? 1}
                            <span className="font-medium text-muted"> · {freshnessLabel(p.daysSinceUpdate)}</span>
                          </p>
                          {reason && (
                            <div className="mt-1 flex gap-1.5">
                              <Pill>{reason}</Pill>
                            </div>
                          )}
                        </div>
                        <span className="self-start whitespace-nowrap rounded-full bg-interest/10 px-2 py-0.5 text-[0.7rem] font-bold text-interest-deep/80">
                          Recently updated
                        </span>
                      </div>
                      {p.updateSummary && <p className="text-sm leading-snug">{p.updateSummary.headline}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            dispatch({ type: "record_open", productId: p.id });
                            setViewing({ product: p, focus: false });
                          }}
                          className="flex-1 rounded-full bg-interest/15 py-2 text-sm font-semibold text-interest-deep"
                        >
                          See what changed
                        </button>
                        {back}
                      </div>
                    </li>
                  );
                }
                return row(
                  p,
                  back,
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
