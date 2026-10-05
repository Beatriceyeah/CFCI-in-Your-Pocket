import { useCallback, useEffect, useState } from "react";
import { ApiError, api } from "../api/client";
import type { Product, ProductCard as ProductCardData } from "../api/types";
import { FeedbackSheet } from "../components/browse/FeedbackSheet";
import { ProductInfoSheet } from "../components/browse/ProductInfoSheet";
import { SwipeCard } from "../components/browse/SwipeCard";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 20;

export function BrowsePage() {
  const { user } = useAuth();
  const [myProductId, setMyProductId] = useState<string | null>(null);
  const [stack, setStack] = useState<ProductCardData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [infoProduct, setInfoProduct] = useState<Product | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoCard, setInfoCard] = useState<ProductCardData | null>(null);
  const [feedbackCard, setFeedbackCard] = useState<ProductCardData | null>(null);

  const loadPage = useCallback(async (pageNum: number, ownProductId: string | null) => {
    try {
      const { items, meta } = await api.products.list({ page: pageNum, page_size: PAGE_SIZE });
      const filtered = items.filter((p) => p.id !== ownProductId);
      setStack((prev) => (pageNum === 1 ? filtered : [...prev, ...filtered]));
      setPage(pageNum);
      setHasMore(pageNum * meta.page_size < meta.total);
      if (filtered.length === 0 && pageNum * meta.page_size >= meta.total) setExhausted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load products right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "student") {
      void loadPage(1, null);
      return;
    }
    api.products
      .mine()
      .then((mine) => {
        setMyProductId(mine?.id ?? null);
        void loadPage(1, mine?.id ?? null);
      })
      .catch(() => void loadPage(1, null));
  }, [user, loadPage]);

  useEffect(() => {
    if (!loading && stack.length === 0) {
      if (hasMore) void loadPage(page + 1, myProductId);
      else setExhausted(true);
    } else if (stack.length > 0) {
      setExhausted(false);
    }
  }, [stack.length, hasMore, loading, page, myProductId, loadPage]);

  async function handleSwipe(card: ProductCardData, direction: "left" | "right") {
    setStack((prev) => prev.filter((p) => p.id !== card.id));
    try {
      await api.swipes.swipe(card.id, direction);
      if (direction === "right") setFeedbackCard(card);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't record that swipe.");
    }
  }

  async function handleTap(card: ProductCardData) {
    setInfoCard(card);
    setInfoLoading(true);
    try {
      setInfoProduct(await api.products.get(card.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load that product.");
      setInfoCard(null);
    } finally {
      setInfoLoading(false);
    }
  }

  function closeInfo() {
    setInfoProduct(null);
    setInfoCard(null);
  }

  function handleInfoSwipe(direction: "left" | "right") {
    if (!infoCard) return;
    const card = infoCard;
    closeInfo();
    void handleSwipe(card, direction);
  }

  function restart() {
    setExhausted(false);
    setStack([]);
    setHasMore(true);
    setLoading(true);
    void loadPage(1, myProductId);
  }

  const visible = stack.slice(0, 2);
  const topId = visible[0]?.id;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 pt-6 pb-24">
      <h1 className="text-navy text-xl font-bold">Browse products</h1>

      {error && (
        <p role="alert" className="rounded-card bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-muted mt-10 text-center">Loading products…</p>
      ) : exhausted || visible.length === 0 ? (
        <div className="bg-surface rounded-card mt-10 flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-ink font-medium">You've seen everything live right now.</p>
          <p className="text-muted text-sm">
            Check back soon, or go again — swiping is never final.
          </p>
          <button
            type="button"
            onClick={restart}
            className="bg-navy rounded-card px-4 py-2 font-semibold text-white"
          >
            Start over
          </button>
        </div>
      ) : (
        <div className="relative h-[60vh] min-h-[420px]">
          {visible
            .slice()
            .reverse()
            .map((card) => (
              <SwipeCard
                key={card.id}
                product={card}
                isTop={card.id === topId}
                onSwipe={(direction) => void handleSwipe(card, direction)}
                onTap={() => void handleTap(card)}
              />
            ))}
        </div>
      )}

      {infoCard && (
        <ProductInfoSheet
          product={infoProduct}
          loading={infoLoading}
          onClose={closeInfo}
          onSwipe={handleInfoSwipe}
        />
      )}

      {feedbackCard && (
        <FeedbackSheet product={feedbackCard} onDone={() => setFeedbackCard(null)} />
      )}
    </main>
  );
}
