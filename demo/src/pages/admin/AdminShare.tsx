import { useState } from "react";
import { Chip } from "../../components/Pill";
import { directionLabel } from "../../data/dimensions";
import { FRESH_DAYS, freshnessLabel } from "../../lib/analytics";
import { useStore } from "../../store/StoreContext";

export function AdminShare() {
  const { state, dispatch } = useStore();
  const live = state.products.filter((p) => p.status === "live");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [recipients, setRecipients] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const valid = name.trim() !== "" && selected.length > 0;

  const create = () => {
    dispatch({
      type: "create_list",
      list: {
        id: `list-${Date.now()}`,
        name: name.trim(),
        note: note.trim(),
        productIds: selected,
        recipients: recipients.trim() || "Anyone with the link",
        createdAt: new Date().toISOString(),
      },
    });
    setSelected([]);
    setName("");
    setNote("");
    setRecipients("");
  };

  const copy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`https://cfci-pocket.example/lists/${id}`);
    } catch {
      // The link is a placeholder in the demo, so a failed copy is harmless.
    }
    setCopied(id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Share for feedback</h1>
        <p className="text-sm text-muted">
          Pick a subset of the portfolio and send it to a group. They see it as a collection in Browse.
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5 ring-1 ring-line">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Quick picks">
          <Chip active={false} onClick={() => setSelected(live.filter((p) => p.daysSinceUpdate <= FRESH_DAYS).map((p) => p.id))}>
            Updated in the last 30 days
          </Chip>
          <Chip active={false} onClick={() => setSelected(live.filter((p) => p.category === "health").map((p) => p.id))}>
            All health
          </Chip>
          <Chip active={false} onClick={() => setSelected([])}>
            Clear
          </Chip>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {live.map((p) => (
            <li key={p.id}>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset ${selected.includes(p.id) ? "bg-navy/5 ring-navy" : "ring-line"}`}>
                <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} className="size-4 accent-navy" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block text-xs text-muted">
                    {directionLabel(p.category)} · {freshnessLabel(p.daysSinceUpdate)}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold text-navy" htmlFor="sh-name">
            Collection name
            <input id="sh-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-line px-3 py-2 font-normal text-ink" placeholder="Spring investor preview" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-navy" htmlFor="sh-to">
            Send to
            <input id="sh-to" value={recipients} onChange={(e) => setRecipients(e.target.value)} className="rounded-xl border border-line px-3 py-2 font-normal text-ink" placeholder="Group name or emails" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold text-navy" htmlFor="sh-note">
          Message to viewers
          <textarea id="sh-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="rounded-xl border border-line px-3 py-2 font-normal text-ink" placeholder="What you would like their feedback on" />
        </label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={create} disabled={!valid} className="rounded-full bg-navy px-6 py-2.5 font-semibold text-white disabled:opacity-40">
            Share {selected.length ? `${selected.length} products` : ""}
          </button>
          <p className="text-sm text-muted">Sharing is simulated in this demo.</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-navy">Shared collections</h2>
        <ul className="flex flex-col gap-2">
          {state.lists.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-display font-semibold text-navy">{l.name}</p>
                <p className="text-sm text-muted">
                  {l.productIds.length} products · {l.recipients}
                </p>
              </div>
              <button type="button" onClick={() => copy(l.id)} className="rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal">
                {copied === l.id ? "Link copied" : "Copy link"}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
