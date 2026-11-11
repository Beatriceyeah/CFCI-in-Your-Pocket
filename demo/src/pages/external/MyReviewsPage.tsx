import { useState } from "react";
import { IntroButton, IntroSheet } from "../../components/ConnectBox";
import { CoverArt } from "../../components/CoverArt";
import { DemoUpdate } from "../../components/DemoUpdate";
import { Pill } from "../../components/Pill";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { SKIP_REASONS } from "../../data/dimensions";
import { pickDemoUpdate } from "../../lib/demoUpdate";
import { updatedForViewer, updatedPassedForViewer, updatedSavedForViewer } from "../../lib/updates";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

type Tab = "later" | "reviewed" | "no";

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
  // One list: updated first, then the rest with the most recently edited review on top. Whether a review is complete
  // is for the team and CFCI to see; for the person who wrote it, it is simply reviewed.
  const reviewedAll = state.evaluations
    .filter((e) => state.swipes[e.productId]?.direction !== "left")
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((e) => byId(e.productId))
    .filter((p): p is Product => !!p);
  const reviewed = [
    ...reviewedAll.filter((p) => isUpdated(p.id)),
    ...reviewedAll.filter((p) => !isUpdated(p.id)),
  ];
  const passedAll = Object.values(state.swipes).filter((s) => s.direction === "left");
  const passed = [
    ...passedAll.filter((s) => isUpdatedPassed(s.productId)),
    ...passedAll.filter((s) => !isUpdatedPassed(s.productId)),
  ];
  const helped = state.evaluations.length;
  // The demo block only appears once there is a venture an update could be posted to.
  const followsAny = pickDemoUpdate(state) !== null;

  // Land where something changed.
  const [tab, setTab] = useState<Tab>(() =>
    updated.length ? "reviewed" : updatedSaved.length ? "later" : updatedPassed.length ? "no" : "later",
  );

  const tabs: { key: Tab; label: string; count: number; dot?: boolean; soft?: boolean }[] = [
    { key: "later", label: "Review later", count: later.length, dot: updatedSaved.length > 0 },
    { key: "reviewed", label: "Reviewed", count: reviewed.length, dot: updated.length > 0 },
    { key: "no", label: "Not interested", count: passed.length, dot: updatedPassed.length > 0, soft: true },
  ];

  const open = (p: Product, focus: boolean) => {
    dispatch({ type: "record_open", productId: p.id });
    setViewing({ product: p, focus });
  };

  // The one signal that a team changed something. It is softer for ventures you passed on.
  const updatedMark = (soft = false) => (
    <p className={`flex items-center gap-1.5 text-xs font-semibold ${soft ? "text-interest-deep/70" : "text-interest-deep"}`}>
      <span className={`size-1.5 rounded-full ${soft ? "bg-interest/45" : "bg-interest"}`} aria-hidden="true" />
      Recently updated
    </p>
  );

  const primary = "rounded-full bg-navy px-3.5 py-1.5 text-sm font-semibold text-white";
  const outline = "rounded-full px-3.5 py-1.5 text-sm font-semibold text-royal ring-1 ring-royal";

  // Every list uses this one row: cover, name, at most one mark, one line of text, then the buttons.
  const item = ({
    p,
    flagged = false,
    soft = false,
    chip,
    actions,
  }: {
    p: Product;
    flagged?: boolean;
    soft?: boolean;
    chip?: React.ReactNode;
    actions: React.ReactNode;
  }) => (
    <li key={p.id} className="flex items-start gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
      <button type="button" onClick={() => open(p, false)} className="shrink-0" aria-label={`Open ${p.name}`}>
        <CoverArt product={p} className="size-14 rounded-xl" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-display font-semibold leading-tight text-navy">{p.name}</p>
        {flagged && updatedMark(soft)}
        {chip}
        <p className={`line-clamp-2 text-sm leading-snug ${flagged ? "" : "text-muted"}`}>
          {flagged ? (p.updateSummary?.headline ?? p.updateNote ?? p.tagline) : p.tagline}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">{actions}</div>
      </div>
    </li>
  );

  const seeChanges = (p: Product) => (
    <button type="button" onClick={() => open(p, false)} className={primary}>
      See what changed
    </button>
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
          <p className="mt-2 rounded-2xl bg-interest/10 px-4 py-2.5 text-sm font-semibold leading-snug text-interest-deep">
            <span className="block text-base font-bold">Thank you!</span>
            You're helping {helped} {helped === 1 ? "team" : "teams"} build better.
          </p>
        )}
      </div>
      {followsAny && (
        <section className="flex flex-col gap-2 rounded-2xl bg-canvas p-4 ring-1 ring-line" aria-label="For the demo">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">For the demo</p>
          <DemoUpdate
            explain
            onPosted={(p) =>
              setTab(
                state.evaluations.some((e) => e.productId === p.id)
                  ? "reviewed"
                  : state.swipes[p.id]?.direction === "right"
                    ? "later"
                    : "no",
              )
            }
          />
        </section>
      )}
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
                item({
                  p,
                  flagged: isUpdatedSaved(p.id),
                  actions: (
                    <>
                      <button type="button" onClick={() => open(p, true)} className={primary}>
                        Review now
                      </button>
                      <IntroButton product={p} compact onOpen={() => setIntro(p)} />
                    </>
                  ),
                }),
              )
            : empty("Tap Review later on a venture in Browse and it waits for you here."))}
        {tab === "reviewed" &&
          (reviewed.length
            ? reviewed.map((p) => {
                const flagged = isUpdated(p.id);
                return item({
                  p,
                  flagged,
                  actions: flagged ? (
                    seeChanges(p)
                  ) : (
                    <button type="button" onClick={() => open(p, true)} className={outline}>
                      Edit
                    </button>
                  ),
                });
              })
            : empty("Nothing reviewed yet. Open any venture and add your view beside the section."))}
        {tab === "no" &&
          (passed.length
            ? passed.flatMap((sw) => {
                const p = byId(sw.productId);
                if (!p) return [];
                const reason = SKIP_REASONS.find((r) => r.key === sw.reason)?.label;
                const flagged = isUpdatedPassed(p.id);
                return item({
                  p,
                  flagged,
                  soft: true,
                  chip: reason ? (
                    <div className="flex gap-1.5">
                      <Pill>{reason}</Pill>
                    </div>
                  ) : undefined,
                  actions: (
                    <>
                      {flagged && seeChanges(p)}
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "undo_swipe", productId: p.id })}
                        className={flagged ? "px-1 text-sm font-semibold text-royal underline underline-offset-2" : outline}
                      >
                        Back to feed
                      </button>
                    </>
                  ),
                });
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
          footer={(done) => {
            // Left is the way out, right is the way on: the same order as the swipe cards and the Browse sheet.
            // "Done" only once there is something to be done: with no review yet this just closes the venture.
            const hasReview = state.evaluations.some((e) => e.productId === viewing.product.id);
            return (
              <div className="flex items-center gap-2">
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
                <button
                  type="button"
                  onClick={done}
                  className={`flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-semibold ${
                    hasReview ? "bg-navy text-white" : "text-ink ring-1 ring-line"
                  }`}
                >
                  {hasReview ? "Done" : "Close"}
                </button>
              </div>
            );
          }}
        />
      )}
      {intro && <IntroSheet product={intro} onClose={() => setIntro(null)} />}
    </div>
  );
}
