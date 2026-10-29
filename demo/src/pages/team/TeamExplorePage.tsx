import { useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { ownedProduct, useStore } from "../../store/StoreContext";
import type { Product } from "../../types";

export function TeamExplorePage() {
  const { state } = useStore();
  const mine = ownedProduct(state);
  const [open, setOpen] = useState<Product | null>(null);
  const others = state.products.filter((p) => p.status === "live" && p.id !== mine?.id);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Explore the portfolio</h1>
        <p className="text-sm text-muted">See how other teams present themselves to investors.</p>
      </div>
      <ul className="flex flex-col gap-2">
        {others.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setOpen(p)}
              className="flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ring-line"
            >
              <CoverArt product={p} className="size-16 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display font-semibold text-navy">{p.name}</span>
                <span className="line-clamp-2 block text-sm text-muted">{p.tagline}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {open && <ProductInfoSheet product={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
