import { useEffect, useState } from "react";
import { ApiError, api } from "../../api/client";
import type { Product, ProductCreate, FeedbackSummary } from "../../api/types";
import { CategoryChip } from "../../components/CategoryChip";
import { ProductForm } from "../../components/ProductForm";
import { STATUS_LABELS, STATUS_STYLES } from "../../lib/constants";

export function MyProductTab() {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);

  useEffect(() => {
    api.products.mine().then(setProduct);
  }, []);

  useEffect(() => {
    if (product) api.feedback.summary(product.id).then(setSummary);
  }, [product]);

  async function handleCreate(payload: ProductCreate) {
    setBusy(true);
    setFormError(null);
    try {
      setProduct(await api.products.create(payload));
      setEditing(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't list your product right now.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(payload: ProductCreate) {
    if (!product) return;
    setBusy(true);
    setFormError(null);
    try {
      setProduct(await api.products.update(product.id, payload));
      setEditing(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Couldn't save your changes right now.");
    } finally {
      setBusy(false);
    }
  }

  if (product === undefined) return <p className="text-muted text-center">Loading…</p>;

  if (product === null) {
    return editing ? (
      <div className="bg-surface rounded-card p-5 shadow-sm">
        <ProductForm
          submitLabel="List my product"
          busy={busy}
          error={formError}
          onSubmit={handleCreate}
        />
      </div>
    ) : (
      <div className="bg-surface rounded-card flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-ink font-medium">You haven't listed a product yet.</p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="bg-navy rounded-card px-4 py-2 font-semibold text-white"
        >
          List my product
        </button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="bg-surface rounded-card p-5 shadow-sm">
        <ProductForm
          initial={product}
          submitLabel="Save changes"
          busy={busy}
          error={formError}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface rounded-card space-y-3 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-ink text-lg font-semibold">{product.name}</p>
            <p className="text-muted text-sm">{product.one_liner}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[product.status]}`}
          >
            {STATUS_LABELS[product.status]}
          </span>
        </div>
        <CategoryChip category={product.category} />
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-card border-muted/30 text-ink border px-4 py-2 text-sm font-medium"
        >
          Edit product
        </button>
      </div>

      <div className="bg-surface rounded-card space-y-4 p-5 shadow-sm">
        <h3 className="text-ink font-semibold">Feedback received</h3>
        {!summary ? (
          <p className="text-muted text-sm">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-center">
              <Stat label="Right swipes" value={summary.counts.right_swipes} />
              <Stat label="Would use" value={summary.counts.would_use} />
              <Stat label="Would invest" value={summary.counts.would_invest} />
              <Stat label="Would intro" value={summary.counts.would_intro} />
            </div>
            <div className="space-y-2">
              {summary.comments.length === 0 ? (
                <p className="text-muted text-sm italic">No comments yet.</p>
              ) : (
                summary.comments.map((c, i) => (
                  <p key={i} className="bg-canvas rounded-card p-3 text-sm">
                    {c.comment}
                  </p>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-canvas rounded-card p-3">
      <p className="text-navy text-xl font-bold">{value}</p>
      <p className="text-muted text-xs">{label}</p>
    </div>
  );
}
