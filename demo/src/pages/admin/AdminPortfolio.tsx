import { useState, type ReactNode } from "react";
import { Icon } from "../../components/Icon";
import { Chip } from "../../components/Pill";
import { ProductInfoSheet } from "../../components/ProductInfoSheet";
import { directionLabel } from "../../data/dimensions";
import { freshnessLabel, isStale } from "../../lib/analytics";
import { isFeatured } from "../../lib/order";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";
import { FeaturePanel } from "./FeaturePanel";
import { UploadProjectSheet } from "./UploadProjectSheet";

type Filter = "all" | "draft" | "update" | "featured" | "archived";

const needsUpdate = (p: Product): boolean => p.status === "live" && isStale(p);

const MATCH: Record<Filter, (p: Product) => boolean> = {
  all: () => true,
  draft: (p) => p.status === "draft",
  update: needsUpdate,
  featured: (p) => p.status === "live" && isFeatured(p),
  archived: (p) => p.status === "archived",
};

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "update", label: "Needs update" },
  { key: "featured", label: "Featured" },
  { key: "archived", label: "Archived" },
];

const ORDER = { draft: 0, live: 1, archived: 2 } as const;

const dateShort = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function MenuItem({ onClick, danger = false, children }: { onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`block w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-canvas ${danger ? "text-danger" : "text-ink"}`}
    >
      {children}
    </button>
  );
}

export function AdminPortfolio() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [uploading, setUploading] = useState<Product | "new" | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [featuring, setFeaturing] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const setStatus = (id: string, status: "live" | "archived") => dispatch({ type: "set_listing_status", productId: id, status });
  const remind = (id: string) => dispatch({ type: "send_reminder", productId: id });

  const counts = Object.fromEntries(FILTERS.map((f) => [f.key, state.products.filter(MATCH[f.key]).length])) as Record<Filter, number>;
  const products = state.products
    .filter(MATCH[filter])
    .sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.daysSinceUpdate - a.daysSinceUpdate);

  const primary = (p: Product): ReactNode => {
    const base = "rounded-full px-4 py-2 text-sm font-semibold";
    if (p.status === "draft") {
      return (
        <button type="button" onClick={() => setUploading(p)} className={`${base} bg-navy text-white`}>
          Upload details
        </button>
      );
    }
    if (p.status === "archived") {
      return (
        <button type="button" onClick={() => setStatus(p.id, "live")} className={`${base} text-royal ring-1 ring-royal`}>
          Restore
        </button>
      );
    }
    if (isFeatured(p) && p.featuredUntil) {
      return (
        <button
          type="button"
          aria-expanded={featuring === p.id}
          onClick={() => setFeaturing(featuring === p.id ? null : p.id)}
          className={`${base} flex items-center gap-1.5 bg-interest text-white`}
        >
          <Icon name="star" className="size-4" />
          Until {dateShort(p.featuredUntil)}
        </button>
      );
    }
    if (isStale(p)) {
      const sent = !!state.reminders[p.id];
      return (
        <button type="button" disabled={sent} onClick={() => remind(p.id)} className={`${base} text-royal ring-1 ring-royal disabled:opacity-50`}>
          {sent ? "Reminder sent" : "Send reminder"}
        </button>
      );
    }
    return (
      <button
        type="button"
        aria-expanded={featuring === p.id}
        onClick={() => setFeaturing(featuring === p.id ? null : p.id)}
        className={`${base} flex items-center gap-1.5 text-royal ring-1 ring-royal`}
      >
        <Icon name="star" className="size-4" />
        Feature
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy">Portfolio</h1>
          <p className="text-sm text-muted">Every listing is uploaded by CFCI staff. All staff share this list.</p>
        </div>
        <button type="button" onClick={() => setUploading("new")} className="rounded-full bg-navy px-5 py-2.5 font-semibold text-white">
          Upload project
        </button>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filter listings">
        {FILTERS.map((f) => (
          <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label} <span className="opacity-70">{counts[f.key]}</span>
          </Chip>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {products.map((p) => {
          const stale = needsUpdate(p);
          return (
            <li key={p.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => setViewing(p)} className="flex max-w-full items-center gap-2 text-left">
                    {isFeatured(p) && (
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-interest text-white" role="img" aria-label="Featured">
                        <Icon name="star" className="size-3.5" />
                      </span>
                    )}
                    <span className="truncate font-display font-semibold text-navy underline-offset-2 hover:underline">{p.name}</span>
                  </button>
                  <p className="truncate text-sm text-muted">
                    {p.status === "draft" && <span className="font-semibold text-warn">Draft · </span>}
                    {p.status === "archived" && <span className="font-semibold">Archived · </span>}
                    {directionLabel(p.category)} ·{" "}
                    <span className={stale ? "font-semibold text-warn" : ""}>{freshnessLabel(p.daysSinceUpdate)}</span>
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {primary(p)}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`More actions for ${p.name}`}
                      aria-haspopup="menu"
                      aria-expanded={menuFor === p.id}
                      onClick={() => setMenuFor(menuFor === p.id ? null : p.id)}
                      className="grid size-10 place-items-center rounded-full text-lg font-bold text-muted ring-1 ring-line hover:text-ink"
                    >
                      ⋯
                    </button>
                    {menuFor === p.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} aria-hidden="true" />
                        <div role="menu" className="anim-fade absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl bg-surface shadow-xl ring-1 ring-line">
                          <MenuItem onClick={() => { setMenuFor(null); setViewing(p); }}>View details</MenuItem>
                          <MenuItem onClick={() => { setMenuFor(null); setUploading(p); }}>Edit listing</MenuItem>
                          {p.status === "live" && (
                            <MenuItem onClick={() => { setMenuFor(null); setFeaturing(p.id); }}>
                              {isFeatured(p) ? "Change feature" : "Feature"}
                            </MenuItem>
                          )}
                          {stale && !state.reminders[p.id] && (
                            <MenuItem onClick={() => { setMenuFor(null); remind(p.id); }}>Send reminder</MenuItem>
                          )}
                          {p.status === "live" && (
                            <MenuItem danger onClick={() => { setMenuFor(null); setStatus(p.id, "archived"); }}>Archive</MenuItem>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {featuring === p.id && <FeaturePanel product={p} onDone={() => setFeaturing(null)} />}
            </li>
          );
        })}
        {!products.length && (
          <li className="rounded-2xl bg-surface p-8 text-center text-muted ring-1 ring-line">Nothing here.</li>
        )}
      </ul>

      <p className="text-xs text-muted">
        Browse order for everyone: featured ventures first, then the viewer's interests, then everything else. Within each
        group, the most recently updated listing comes first.
      </p>

      {viewing && <ProductInfoSheet product={viewing} onClose={() => setViewing(null)} />}
      {uploading && (
        <UploadProjectSheet product={uploading === "new" ? undefined : uploading} onClose={() => setUploading(null)} />
      )}
    </div>
  );
}
