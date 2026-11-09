import { useCallback, useMemo, useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { IntroButton, IntroSheet } from "../../components/ConnectBox";
import { Icon } from "../../components/Icon";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { SwipeDeck } from "../../components/SwipeDeck";
import { Toast } from "../../components/Toast";
import { SKIP_REASONS } from "../../data/dimensions";
import { isListed, wasUpdatedRecently } from "../../lib/analytics";
import { isFeatured, rankProducts } from "../../lib/order";
import { teamSummary } from "../../lib/team";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

interface Props {
  onGoShortlist: () => void;
}

type ToastState = { kind: "saved" | "skipped"; product: Product } | null;

export function BrowsePage({ onGoShortlist }: Props) {
  const { state, dispatch } = useStore();
  // Interests are set in My info. They only move ventures up the ranking.
  const interests = state.directions;
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"swipe" | "list">("swipe");
  const [open, setOpen] = useState<{ product: Product; focus: boolean } | null>(null);
  const [intro, setIntro] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [skipTagged, setSkipTagged] = useState(false);

  const { queue, looped } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (p: Product): boolean =>
      !q ||
      [p.name, p.tagline, p.pitchProblem, p.pitchSolution, ...p.team.map((t) => t.role)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const listed = state.products.filter((p) => isListed(p) && matches(p));
    const unseen = listed.filter((p) => !state.swipes[p.id]);
    if (unseen.length) return { queue: rankProducts(unseen, interests), looped: false };
    // Everything has been seen once: loop back around instead of ending. Skipped ventures come first, oldest
    // first, and each pass moves a venture to the back of the line.
    const swiped = listed.filter((p) => state.swipes[p.id]);
    const skipped = swiped.filter((p) => state.swipes[p.id]?.direction === "left");
    const pool = (skipped.length ? skipped : swiped).sort((a, b) =>
      (state.swipes[a.id]?.at ?? "").localeCompare(state.swipes[b.id]?.at ?? ""),
    );
    return { queue: pool, looped: pool.length > 0 };
  }, [state.products, state.swipes, interests, query]);

  const featured: ReadonlySet<string> = useMemo(
    () => new Set(queue.filter((p) => isFeatured(p)).map((p) => p.id)),
    [queue],
  );
  const updated: ReadonlySet<string> = useMemo(
    () => new Set(queue.filter((p) => wasUpdatedRecently(p)).map((p) => p.id)),
    [queue],
  );

  // Ventures this viewer already looked at that have changed since.
  const news = useMemo(
    () =>
      state.products.filter(
        (p) => isListed(p) && state.seen[p.id] !== undefined && state.seen[p.id]! < (p.version ?? 1),
      ),
    [state.products, state.seen],
  );

  const swipe = useCallback(
    (product: Product, direction: "left" | "right") => {
      dispatch({ type: "swipe", productId: product.id, direction });
      setOpen(null);
      setSkipTagged(false);
      setToast({ kind: direction === "right" ? "saved" : "skipped", product });
    },
    [dispatch],
  );

  const openProduct = (product: Product, focus = false) => {
    dispatch({ type: "record_open", productId: product.id });
    setOpen({ product, focus });
  };

  const dismiss = useCallback(() => setToast(null), []);

  const undo = (product: Product) => {
    dispatch({ type: "undo_swipe", productId: product.id });
    setToast(null);
  };

  // Skipped: a single-row strip in place of the action buttons, so it never covers the card.
  const notice =
    toast?.kind === "skipped" ? (
      <Toast onDismiss={dismiss}>
        {skipTagged ? (
          <p className="flex-1">Thanks, noted.</p>
        ) : (
          <>
            <span className="shrink-0 text-white/80">Why skip?</span>
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
              {SKIP_REASONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-sm hover:bg-white/25"
                  onClick={() => {
                    dispatch({ type: "tag_skip", productId: toast.product.id, reason: r.key });
                    setSkipTagged(true);
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button type="button" className="shrink-0 px-1 text-white/70" onClick={() => undo(toast.product)}>
              Undo
            </button>
          </>
        )}
      </Toast>
    ) : null;

  const rowAction = (p: Product) => (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={() => swipe(p, "left")}
        aria-label={`Skip ${p.name}`}
        className="grid size-10 place-items-center rounded-full bg-surface text-muted ring-1 ring-line"
      >
        <Icon name="close" className="size-5" />
      </button>
      <IntroButton product={p} compact onOpen={() => setIntro(p)} />
      <button
        type="button"
        onClick={() => swipe(p, "right")}
        aria-label={`Interested in ${p.name}`}
        className="grid size-10 place-items-center rounded-full bg-interest text-white"
      >
        <Icon name="eye" className="size-5" />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
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

      {news.length > 0 && (
        <button
          type="button"
          onClick={() => openProduct(news[0]!)}
          className="anim-fade flex items-center gap-3 rounded-2xl bg-interest/10 px-4 py-2 text-left ring-1 ring-interest/30"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-interest text-white">
            <Icon name="refresh" className="size-4" />
          </span>
          <span className="min-w-0 flex-1 text-sm leading-snug">
            <span className="font-semibold text-interest-deep">
              {news.length === 1 ? `${news[0]!.name} has an update` : `${news.length} ventures you looked at have updates`}
            </span>
            <span className="block truncate text-muted">{news[0]!.updateNote ?? "The team posted new progress."}</span>
          </span>
        </button>
      )}

      {looped && (
        <p className="anim-fade rounded-2xl bg-canvas px-4 py-2.5 text-sm text-muted ring-1 ring-line">
          <span className="font-semibold text-navy">You have been around once.</span> Here they come again. A second look
          can change your mind, and the teams may have updated.
        </p>
      )}

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
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-display font-semibold text-navy">{p.name}</span>
                    {updated.has(p.id) && (
                      <span className="shrink-0 rounded-full bg-interest/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-interest-deep">
                        Updated
                      </span>
                    )}
                  </span>
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
          notice={view === "swipe" ? notice : null}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card bg-surface p-8 text-center ring-1 ring-line">
          <h2 className="font-display text-xl font-bold text-navy">
            {query.trim() ? "No products match" : "New ventures are on the way"}
          </h2>
          <p className="max-w-xs text-muted">
            {query.trim()
              ? "Try a different word."
              : "CFCI adds ventures as teams are ready. Check your shortlist while you wait."}
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
            <button type="button" onClick={onGoShortlist} className="rounded-full bg-navy px-4 py-2 font-medium text-white">
              Open shortlist
            </button>
          </div>
        </div>
      )}

      {notice && view === "list" && (
        <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">{notice}</div>
      )}

      {toast?.kind === "saved" && (
        <Toast center seconds={4} onDismiss={dismiss}>
          <span className="grid size-12 place-items-center rounded-full bg-interest">
            <Icon name="check" className="size-7" />
          </span>
          <p className="font-display text-xl font-semibold">Added to your shortlist</p>
          <p className="text-sm text-white/75">{toast.product.name}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy"
              onClick={() => {
                openProduct(toast.product, true);
                setToast(null);
              }}
            >
              Help this team
            </button>
            <button type="button" className="px-3 py-2 text-sm text-white/75" onClick={() => undo(toast.product)}>
              Undo
            </button>
          </div>
        </Toast>
      )}

      {open && (
        <ProductInfoSheet
          product={open.product}
          feedback
          focusFeedback={open.focus}
          onClose={() => setOpen(null)}
          footer={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => swipe(open.product, "left")}
                className="rounded-full px-5 py-2.5 font-semibold text-ink ring-1 ring-line"
              >
                Skip
              </button>
              <IntroButton product={open.product} onOpen={() => setIntro(open.product)} />
              <button
                type="button"
                onClick={() => swipe(open.product, "right")}
                className="flex items-center gap-1.5 rounded-full bg-interest px-5 py-2.5 font-semibold text-white"
              >
                <Icon name="eye" className="size-4" />
                Interested
              </button>
            </div>
          }
        />
      )}
      {intro && <IntroSheet product={intro} onClose={() => setIntro(null)} />}
    </div>
  );
}
