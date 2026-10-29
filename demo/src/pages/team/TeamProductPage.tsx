import { useState } from "react";
import { ProductForm } from "../../components/ProductForm";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { ProductCard } from "../../components/ProductCard";
import { Pill } from "../../components/Pill";
import { Sheet } from "../../components/Sheet";
import { computeStats, freshnessLabel, isStale } from "../../lib/analytics";
import { ownedProduct, useStore } from "../../store/StoreContext";
import { NoProduct } from "./NoProduct";
import { TeamMembers } from "./TeamMembers";
import type { ListingStatus } from "../../types";

const STATUS: Record<
  ListingStatus,
  { label: string; tone: "warn" | "good" | "neutral"; note: string }
> = {
  draft: {
    label: "Draft",
    tone: "warn",
    note: "CFCI staff are still setting up this listing. It is not visible to investors yet.",
  },
  live: {
    label: "Live",
    tone: "good",
    note: "Visible to investors and alumni in Browse.",
  },
  archived: {
    label: "Archived",
    tone: "neutral",
    note: "Hidden from Browse. Update the listing and ask CFCI to restore it.",
  },
};

interface Props {
  editNote: string | null;
  clearEditNote: () => void;
}

export function TeamProductPage({ editNote, clearEditNote }: Props) {
  const { state, dispatch } = useStore();
  const [previewing, setPreviewing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"listing" | "team" | "history">("listing");
  const product = ownedProduct(state);
  if (!product) return <NoProduct />;

  const stats = computeStats(product, state.swipes, state.evaluations, state.opens);
  const status = STATUS[product.status];
  const reminder = state.reminders[product.id];
  const changes = state.changelog.filter((c) => c.productId === product.id);
  const showForm = editing || editNote !== null;
  const close = () => {
    setEditing(false);
    clearEditNote();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-navy">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone={status.tone}>{status.label}</Pill>
          <Pill tone={isStale(product) ? "warn" : "neutral"}>
            {freshnessLabel(product.daysSinceUpdate)}
          </Pill>
        </div>
        <p className="text-sm text-muted">{status.note}</p>
      </div>

      <div
        className="grid grid-cols-3 gap-1 rounded-full bg-surface p-1 ring-1 ring-line"
        role="tablist"
      >
        {(["listing", "team", "history"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-2 py-2 text-sm font-medium capitalize ${tab === t ? "bg-navy text-white" : "text-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "team" && <TeamMembers product={product} />}
      {tab === "history" && (
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold text-navy">
            Update history
          </h2>
          <p className="text-sm text-muted">
            Shared with everyone on the team.
          </p>
          {changes.length ? (
            <ul className="flex flex-col gap-2">
              {changes.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl bg-surface px-4 py-3 text-sm ring-1 ring-line"
                >
                  <p>{c.note}</p>
                  <p className="text-xs text-muted">
                    {c.by} · {new Date(c.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              No updates yet. Posting one keeps your listing marked as fresh.
            </p>
          )}
        </section>
      )}

      {tab === "listing" && (
        <>
          {reminder && (
            <div
              className="rounded-2xl bg-warn-soft p-4 text-sm text-warn"
              role="status"
            >
              <p className="font-semibold">Reminder from CFCI</p>
              <p>
                Please review your listing and post an update so reviewers see
                current progress.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { v: stats.views, l: "Views" },
              { v: stats.interested, l: "Interested" },
              { v: stats.evaluations.length, l: "Evaluations" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl bg-surface p-3 ring-1 ring-line"
              >
                <p className="font-display text-2xl font-bold tabular-nums text-navy">
                  {s.v}
                </p>
                <p className="text-xs text-muted">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="h-[28rem]">
            <ProductCard product={product} />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex-1 rounded-full bg-navy py-2.5 font-semibold text-white"
            >
              Update my product
            </button>
            <button
              type="button"
              onClick={() => setPreviewing(true)}
              className="flex-1 rounded-full py-2.5 font-semibold text-royal ring-1 ring-royal"
            >
              Preview overview
            </button>
          </div>
        </>
      )}

      {previewing && (
        <ProductInfoSheet
          product={product}
          onClose={() => setPreviewing(false)}
        />
      )}
      {showForm && (
        <Sheet title="Update my product" onClose={close}>
          <div className="p-5">
            <ProductForm
              product={product}
              askChangeNote
              initialNote={editNote ?? ""}
              submitLabel="Post update"
              onSubmit={(patch, note) => {
                dispatch({
                  type: "update_product",
                  productId: product.id,
                  patch,
                  note,
                });
                close();
              }}
            />
          </div>
        </Sheet>
      )}
    </div>
  );
}
