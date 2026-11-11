import { useCallback, useMemo, useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { IntroButton, IntroSheet } from "../../components/ConnectBox";
import { Icon } from "../../components/Icon";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { SwipeDeck } from "../../components/SwipeDeck";
import { Toast } from "../../components/Toast";
import { SKIP_REASONS } from "../../data/dimensions";
import { wasUpdatedRecently } from "../../lib/analytics";
import { buildFeed } from "../../lib/feed";
import { updatedPassedForViewer } from "../../lib/updates";
import { isFeatured } from "../../lib/order";
import { teamSummary } from "../../lib/team";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

interface Props {
  onGoReviews: () => void;
}

// `id` is new for every swipe, so each pop-up starts with its own countdown instead of inheriting the last one's.
type ToastState = { id: number; kind: "saved" | "skipped"; product: Product } | null;

export function BrowsePage({ onGoReviews }: Props) {
  const { state, dispatch } = useStore();
  // Interests are set in My info. They only move ventures up the ranking.
  const interests = state.directions;
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"swipe" | "list">("swipe");
  const [open, setOpen] = useState<{ product: Product; focus: boolean } | null>(null);
  const [intro, setIntro] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [skipTagged, setSkipTagged] = useState(false);
  const [reasonsOpen, setReasonsOpen] = useState(false);
  const [returning, setReturning] = useState<{ productId: string; direction: "left" | "right" } | null>(null);

  const queue = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (p: Product): boolean =>
      !q ||
      [p.name, p.tagline, p.pitchProblem, p.pitchSolution, ...p.team.map((t) => t.role)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    // Featured, then updated, then new, then the ones you passed on coming round again. See lib/feed.ts.
    return buildFeed({
      products: state.products,
      swipes: state.swipes,
      evaluations: state.evaluations,
      seen: state.seen,
      interests,
      matches,
    });
  }, [state.products, state.swipes, state.evaluations, state.seen, interests, query]);

  // Ventures you passed on come round again. Say so, otherwise a card you just skipped reappearing looks like a bug.
  const passedIds = useMemo(
    () => new Set(Object.values(state.swipes).filter((sw) => sw.direction === "left").map((sw) => sw.productId)),
    [state.swipes],
  );
  const updatedPassedIds = useMemo(
    () => new Set(updatedPassedForViewer(state).map((p) => p.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.products, state.swipes, state.evaluations, state.seen],
  );
  const topCard = queue[0];
  const loopNotice = !topCard || !passedIds.has(topCard.id)
    ? null
    : updatedPassedIds.has(topCard.id)
      ? "You passed on this one. The team has updated it since."
      : "That's all the new ones. Here are ventures you passed on.";

  const featured: ReadonlySet<string> = useMemo(
    () => new Set(queue.filter((p) => isFeatured(p)).map((p) => p.id)),
    [queue],
  );
  const updated: ReadonlySet<string> = useMemo(
    () => new Set(queue.filter((p) => wasUpdatedRecently(p)).map((p) => p.id)),
    [queue],
  );

  const swipe = useCallback(
    (product: Product, direction: "left" | "right") => {
      dispatch({ type: "swipe", productId: product.id, direction });
      setReturning(null);
      setOpen(null);
      setSkipTagged(false);
      setReasonsOpen(false);
      setToast({ id: Date.now(), kind: direction === "right" ? "saved" : "skipped", product });
    },
    [dispatch],
  );

  const openProduct = (product: Product, focus = false) => {
    dispatch({ type: "record_open", productId: product.id });
    setOpen({ product, focus });
  };

  const dismiss = useCallback(() => setToast(null), []);

  const undo = (product: Product) => {
    // The card flies back in from the side it was swiped to (left = skipped, right = review later).
    setReturning({ productId: product.id, direction: toast?.kind === "skipped" ? "left" : "right" });
    window.setTimeout(() => setReturning(null), 500);
    dispatch({ type: "undo_swipe", productId: product.id });
    setToast(null);
  };

  // Both outcomes float at the top in the same style. Not interested only says "Why?" until it is tapped.
  const floatNote =
    toast?.kind === "skipped" ? (
      <Toast key={toast.id} onDismiss={dismiss} seconds={skipTagged ? 1.5 : reasonsOpen ? 6 : 2}>
        {skipTagged ? (
          <p className="pr-8 font-semibold">Thanks, noted.</p>
        ) : (
          <>
            <p className="min-w-0 pr-7 leading-snug">
              <span className="text-base font-semibold">{toast.product.name}</span>{" "}
              <span className="text-sm text-white/70">skipped</span>
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-expanded={reasonsOpen}
                onClick={() => setReasonsOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-semibold text-navy"
              >
                Pick a reason
                <span className={`inline-block text-xs transition-transform ${reasonsOpen ? "rotate-180" : ""}`}>▾</span>
              </button>
              <button type="button" className="text-white/75 underline underline-offset-2" onClick={() => undo(toast.product)}>
                Undo
              </button>
            </div>
            {reasonsOpen && (
              <div className="anim-fade flex flex-wrap gap-1.5">
                {SKIP_REASONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className="rounded-full bg-white/15 px-3 py-1.5 hover:bg-white/25"
                    onClick={() => {
                      dispatch({ type: "tag_skip", productId: toast.product.id, reason: r.key });
                      setSkipTagged(true);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Toast>
    ) : toast?.kind === "saved" ? (
      <Toast key={toast.id} onDismiss={dismiss} seconds={2}>
        <p className="min-w-0 pr-7 leading-snug">
          <span className="text-base font-semibold">{toast.product.name}</span>{" "}
          <span className="text-sm text-white/70">added to My reviews</span>
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-full bg-white px-3.5 py-1.5 font-semibold text-navy"
            onClick={() => {
              setToast(null);
              onGoReviews();
            }}
          >
            Review now
          </button>
          <button type="button" className="text-white/75 underline underline-offset-2" onClick={() => undo(toast.product)}>
            Undo
          </button>
        </div>
      </Toast>
    ) : null;

  const rowAction = (p: Product) => (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => swipe(p, "left")}
        aria-label={`Not interested in ${p.name}`}
        className="grid size-10 place-items-center rounded-full bg-surface text-muted ring-1 ring-line"
      >
        <Icon name="close" className="size-5" />
      </button>
      <IntroButton product={p} compact onOpen={() => setIntro(p)} />
      <button
        type="button"
        onClick={() => swipe(p, "right")}
        aria-label={`Review ${p.name} later`}
        className="grid size-10 place-items-center rounded-full bg-interest text-white"
      >
        <Icon name="eye" className="size-5" />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {floatNote && (
        // Zero-height sticky anchor, so the note floats over the page instead of pushing the card down.
        <div className="sticky top-0 z-30 -mb-3 h-0">
          <div className="absolute inset-x-0 top-0 flex justify-center">{floatNote}</div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="relative block min-w-0 flex-1" htmlFor="browse-search">
          <span className="sr-only">Search products</span>
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted"
          />
          <input
            id="browse-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, problems or teams"
            className="w-full rounded-full border border-line bg-surface py-2.5 pl-11 pr-4 text-[0.95rem]"
          />
        </label>
        <div
          className="grid shrink-0 grid-cols-2 gap-0.5 rounded-full bg-surface p-0.5 ring-1 ring-line"
          role="group"
          aria-label="View"
        >
          {(["swipe", "list"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`rounded-full px-3 py-2 text-xs font-semibold capitalize ${view === v ? "bg-navy text-white" : "text-muted"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {queue.length && view === "list" ? (
        <ul className="flex flex-col gap-2 pb-2">
          {queue.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
              <button
                type="button"
                onClick={() => openProduct(p)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
                aria-label={`Open ${p.name}`}
              >
                <CoverArt product={p} featured={featured.has(p.id)} className="size-14 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-semibold text-navy">{p.name}</span>
                  {(updated.has(p.id) || passedIds.has(p.id)) && (
                    <span className="mt-0.5 flex flex-wrap gap-1">
                      {updated.has(p.id) && (
                        <span className="whitespace-nowrap rounded-full bg-interest/15 px-2 py-0.5 text-[0.7rem] font-bold text-interest-deep">
                          Recently updated
                        </span>
                      )}
                      {passedIds.has(p.id) && (
                        <span className="whitespace-nowrap rounded-full bg-canvas px-2 py-0.5 text-[0.7rem] font-semibold text-muted ring-1 ring-line">
                          Passed before
                        </span>
                      )}
                    </span>
                  )}
                  <span className="line-clamp-1 block text-xs text-muted">{teamSummary(p)}</span>
                  <span className="line-clamp-2 mt-0.5 block text-sm">{p.pitchProblem}</span>
                </span>
              </button>
              {rowAction(p)}
            </li>
          ))}
        </ul>
      ) : queue.length ? (
        <SwipeDeck
          products={queue}
          onSwipe={swipe}
          onOpen={(p) => openProduct(p)}
          onIntro={setIntro}
          paused={!!open || !!intro}
          featured={featured}
          updated={updated}
          returning={returning}
          // Below the card, so the pop-up that floats over the top of the page never covers it.
          caption={
            loopNotice ? (
              <p
                key={loopNotice}
                role="status"
                className="anim-fade -mb-1 px-2 text-center text-[0.82rem] leading-snug text-navy"
              >
                <Icon name="refresh" className="mr-1.5 inline size-4 align-text-bottom text-royal" />
                {loopNotice}
              </p>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card bg-surface p-8 text-center ring-1 ring-line">
          <h2 className="font-display text-xl font-bold text-navy">
            {query.trim() ? "No products match" : "You have seen everything here"}
          </h2>
          <p className="max-w-xs text-muted">
            {query.trim()
              ? "Try a different word."
              : "Pick up anything you saved in My reviews, or put back a venture you passed on."}
          </p>
          <div className="flex gap-2">
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-full px-4 py-2 font-medium text-royal ring-1 ring-royal"
              >
                Clear search
              </button>
            )}
            <button type="button" onClick={onGoReviews} className="rounded-full bg-navy px-4 py-2 font-medium text-white">
              Open My reviews
            </button>
          </div>
        </div>
      )}

      {open && (
        <ProductInfoSheet
          product={open.product}
          feedback
          focusFeedback={open.focus}
          onClose={() => setOpen(null)}
          introAction={<IntroButton product={open.product} onOpen={() => setIntro(open.product)} />}
          footer={(done) => (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => swipe(open.product, "left")}
                className="flex-1 whitespace-nowrap rounded-full px-2 py-2.5 text-sm font-semibold text-ink ring-1 ring-line"
              >
                Not interested
              </button>
              {state.evaluations.some((e) => e.productId === open.product.id) ? (
                // Once you have written something the venture is already in My reviews, so this is where you finish.
                <button
                  type="button"
                  onClick={done}
                  className="flex-1 whitespace-nowrap rounded-full bg-navy px-2 py-2.5 text-sm font-semibold text-white"
                >
                  Done
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => swipe(open.product, "right")}
                  className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-interest px-2 py-2.5 text-sm font-semibold text-white"
                >
                  <Icon name="eye" className="size-4" />
                  Review later
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
