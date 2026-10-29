import { useState } from "react";
import { ownedProduct, useStore } from "../../store/StoreContext";

// Read-only. CFCI staff handle every introduction request and tell the team who was introduced.
export function ConnectionsSection() {
  const { state } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const product = ownedProduct(state);
  if (!product) return null;

  const introduced = state.connections.filter((c) => c.productId === product.id && c.status === "accepted");

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-surface p-5 ring-1 ring-line">
      <h2 className="font-display text-lg font-semibold text-navy">Introductions ({introduced.length})</h2>
      <p className="text-sm text-muted">
        People CFCI staff have introduced to the {product.name} team. Reach out by email from here.
      </p>
      {introduced.length ? (
        <ul className="flex flex-col gap-2">
          {introduced.map((c) => {
            const open = openId === c.id;
            return (
              <li key={c.id} className="rounded-xl ring-1 ring-line">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
                >
                  <span>
                    <span className="block font-semibold text-navy">{c.fromName}</span>
                    <span className="block text-sm text-muted">{c.fromRole}</span>
                  </span>
                  <span className="text-sm font-medium text-royal">{open ? "Hide" : "Details"}</span>
                </button>
                {open && (
                  <div className="anim-fade flex flex-col gap-1.5 border-t border-line px-3 py-3 text-sm">
                    <span className="select-all break-all text-royal">{c.fromEmail}</span>
                    {c.message && <p className="leading-snug text-muted">&ldquo;{c.message}&rdquo;</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted">No introductions yet.</p>
      )}
    </section>
  );
}
