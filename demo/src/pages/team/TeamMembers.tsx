import { useState } from "react";
import { REGISTERED_STUDENTS } from "../../data/users";
import { useStore } from "../../store/StoreContext";
import type { Product } from "../../types";
import { Pill } from "../../components/Pill";

export function TeamMembers({ product }: { product: Product }) {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState("");
  const owners = product.ownerIds ?? [];
  const q = query.trim().toLowerCase();
  const candidates = REGISTERED_STUDENTS.filter(
    (u) => !owners.includes(u.id) && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-semibold text-navy">Project leads</h2>
        <ul className="flex flex-col gap-2">
          {product.team.map((t) => {
            const user = REGISTERED_STUDENTS.find((u) => u.name === t.name);
            const isLead = !!user && owners.includes(user.id);
            return (
              <li key={t.name} className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3 ring-1 ring-line">
                <div className="min-w-0">
                  <p className="font-semibold text-navy">
                    {t.name}
                    {user?.id === state.session?.userId && <span className="font-normal text-muted"> (you)</span>}
                  </p>
                  <p className="truncate text-sm text-muted">{isLead ? user.email : t.role}</p>
                </div>
                {isLead ? <Pill tone="good">Can edit</Pill> : <Pill>View only</Pill>}
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted">Project leads can update the listing and see all feedback and connections.</p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
        <h2 className="font-display text-lg font-semibold text-navy">Add a teammate</h2>
        <p className="text-sm text-muted">
          Only registered students can be added. This product then appears in their account.
        </p>
        <input
          id="teammate-search"
          type="search"
          aria-label="Search registered students"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-xl border border-line px-3 py-2 text-[0.95rem]"
        />
        <ul className="flex flex-col gap-2">
          {candidates.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{u.name}</p>
                <p className="truncate text-sm text-muted">{u.email}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "add_owner", productId: product.id, userId: u.id })}
                className="shrink-0 rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white"
              >
                Add
              </button>
            </li>
          ))}
          {!candidates.length && <li className="text-sm text-muted">No registered students match.</li>}
        </ul>
      </section>
    </div>
  );
}
