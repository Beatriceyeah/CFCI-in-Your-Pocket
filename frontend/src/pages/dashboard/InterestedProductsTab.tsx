import { useEffect, useState } from "react";
import { ApiError, api } from "../../api/client";
import type { Product, ProductCard as ProductCardData } from "../../api/types";
import { CategoryChip } from "../../components/CategoryChip";
import { ProductInfoSheet } from "../../components/browse/ProductInfoSheet";

export function InterestedProductsTab() {
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ProductCardData | null>(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api.swipes
      .interestedProducts({ page: 1, page_size: 50 })
      .then(({ items }) => setProducts(items))
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.message : "Couldn't load this."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function open(product: ProductCardData) {
    setSelected(product);
    setDetailLoading(true);
    try {
      setDetail(await api.products.get(product.id));
    } catch {
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading) return <p className="text-muted text-center">Loading…</p>;
  if (error)
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  if (products.length === 0)
    return (
      <p className="text-muted text-center text-sm">
        Swipe right on something in Browse to see it here.
      </p>
    );

  return (
    <div className="flex flex-col gap-3">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          onClick={() => void open(product)}
          className="bg-surface rounded-card flex items-center gap-3 p-3 text-left shadow-sm"
        >
          <img
            src={product.cover_image_url}
            alt={product.name}
            className="h-16 w-16 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-ink truncate font-semibold">{product.name}</p>
              <CategoryChip category={product.category} />
            </div>
            <p className="text-muted truncate text-sm">{product.one_liner}</p>
          </div>
        </button>
      ))}

      {selected && (
        <ProductInfoSheet
          product={detail}
          loading={detailLoading}
          readOnly
          onClose={() => {
            setSelected(null);
            setDetail(null);
          }}
        />
      )}
    </div>
  );
}
