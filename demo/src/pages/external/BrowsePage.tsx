import { useCallback, useMemo, useState } from "react";
import { Icon } from "../../components/Icon";
import { CoverArt } from "../../components/CoverArt";
import { EvaluateSheet } from "../../components/EvaluateSheet";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { SwipeDeck } from "../../components/SwipeDeck";
import { Toast } from "../../components/Toast";
import { SKIP_REASONS } from "../../data/dimensions";
import { isFeatured, rankProducts } from "../../lib/order";
import { teamLine } from "../../lib/team";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

interface Props {
  onGoShortlist: () => void;
}

type ToastState = { kind: "saved" | "skipped"; product: Product } | null;

export function BrowsePage({ onGoShortlist }: Props) {
  const { state, dispatch } = useStore();
  // Interests are set in onboarding and My info. They only move ventures up the ranking.
  const interests = state.directions;
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"swipe" | "list">("swipe");
  const [open, setOpen] = useState<Product | null>(null);
  const [evaluating, setEvaluating] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [skipTagged, setSkipTagged] = useState(false);

  const queue = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (p: Product): boolean =>
      !q ||
      [
        p.name,
        p.tagline,
        p.pitchProblem,
        p.pitchSolution,
        ...p.team.map((t) => t.name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const unseen = state.products.filter(
      (p) => p.status === "live" && !state.swipes[p.id] && matches(p),
    );
    return rankProducts(unseen, interests);
  }, [state.products, state.swipes, interests, query]);

  const featured: ReadonlySet<string> = useMemo(
    () => new Set(queue.filter((p) => isFeatured(p)).map((p) => p.id)),
    [queue],
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

  const openProduct = (product: Product) => {
    dispatch({ type: "record_open", productId: product.id });
    setOpen(product);
  };

  const dismiss = useCallback(() => setToast(null), []);

  const undo = (product: Product) => {
    dispatch({ type: "undo_swipe", productId: product.id });
    setToast(null);
  };

  // A single-row strip that takes the place of the action buttons, so it never covers the card.
  const notice = toast ? (
    <Toast onDismiss={dismiss}>
      {toast.kind === "saved" ? (
        <>
          <p className="min-w-0 flex-1 truncate font-semibold">Added to shortlist</p>
          <button
            type="button"
            className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-navy"
            onClick={() => {
              setEvaluating(toast.product);
              setToast(null);
            }}
          >
            Share your take
          </button>
          <button
            type="button"
            className="shrink-0 px-1 text-white/70"
            onClick={() => undo(toast.product)}
          >
            Undo
          </button>
        </>
      ) : skipTagged ? (
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
                  dispatch({
                    type: "tag_skip",
                    productId: toast.product.id,
                    reason: r.key,
                  });
                  setSkipTagged(true);
                }}
              >
                {r.label}
              </button>
            ))}
            <button
              type="button"
              className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-semibold text-navy"
              onClick={() => {
                dispatch({
                  type: "tag_skip",
                  productId: toast.product.id,
                  revisit: true,
                });
                setToast(null);
              }}
            >
              Revisit later
            </button>
          </div>
          <button
            type="button"
            className="shrink-0 px-1 text-white/70"
            onClick={() => undo(toast.product)}
          >
            Undo
          </button>
        </>
      )}
    </Toast>
  ) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-2">
        <label
          className="relative block min-w-0 flex-1"
          htmlFor="browse-search"
        >
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
            <li key={p.id}>
              <button
                type="button"
                onClick={() => openProduct(p)}
                className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-line"
              >
                <CoverArt
                  product={p}
                  featured={featured.has(p.id)}
                  className="size-16 shrink-0 rounded-xl"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display font-semibold text-navy">
                    {p.name}
                  </span>
                  <span className="line-clamp-1 block text-sm text-muted">
                    {teamLine(p.team[0] ?? { name: "", role: "" })}
                  </span>
                  <span className="line-clamp-2 mt-0.5 block text-sm">
                    {p.pitchProblem}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : queue.length ? (
        <SwipeDeck
          products={queue}
          onSwipe={swipe}
          onOpen={openProduct}
          paused={!!open || !!evaluating}
          featured={featured}
          notice={view === "swipe" ? notice : null}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-card bg-surface p-8 text-center ring-1 ring-line">
          <h2 className="font-display text-xl font-bold text-navy">
            {query.trim()
              ? "No products match"
              : "You have seen everything here"}
          </h2>
          <p className="max-w-xs text-muted">
            {query.trim()
              ? "Try a different word."
              : "Bring back something you skipped, or share your take on your shortlist."}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setQuery("");
              }}
              className="rounded-full px-4 py-2 font-medium text-royal ring-1 ring-royal"
            >
              Clear search
            </button>
            <button
              type="button"
              onClick={onGoShortlist}
              className="rounded-full bg-navy px-4 py-2 font-medium text-white"
            >
              Open shortlist
            </button>
          </div>
        </div>
      )}

      {notice && view === "list" && (
        <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
          {notice}
        </div>
      )}

      {open && (
        <ProductInfoSheet
          product={open}
          onClose={() => setOpen(null)}
          footer={
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => swipe(open, "left")}
                className="flex-1 rounded-full py-2.5 font-semibold text-ink ring-1 ring-line"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={() => swipe(open, "right")}
                className="flex-1 rounded-full bg-interest py-2.5 font-semibold text-white"
              >
                Interested
              </button>
            </div>
          }
        />
      )}

      {evaluating && state.session && (
        <EvaluateSheet
          product={evaluating}
          existing={state.evaluations.find(
            (e) => e.productId === evaluating.id,
          )}
          draft={state.drafts[evaluating.id]}
          viewerLabel={state.session.roleLabel}
          onDraft={(draft) =>
            dispatch({ type: "save_draft", productId: evaluating.id, draft })
          }
          onSave={(evaluation) => {
            dispatch({ type: "save_evaluation", evaluation });
            setEvaluating(null);
          }}
          onClose={() => setEvaluating(null)}
        />
      )}
    </div>
  );
}
