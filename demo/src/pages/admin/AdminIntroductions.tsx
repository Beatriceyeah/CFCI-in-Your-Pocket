import { useState } from "react";
import { Pill } from "../../components/Pill";
import { REGISTERED_STUDENTS } from "../../data/users";
import { useStore } from "../../store/StoreContext";
import type { Connection } from "../../types";

// Investors and alumni ask CFCI for an introduction. Staff make it, then both sides take it from there.
export function AdminIntroductions() {
  const { state, dispatch } = useStore();
  const [copied, setCopied] = useState<string | null>(null);
  const respond = (id: string, status: "accepted" | "declined") =>
    dispatch({ type: "respond_connection", id, status });

  const productOf = (c: Connection) => state.products.find((p) => p.id === c.productId);
  const teamEmails = (c: Connection): string[] =>
    (productOf(c)?.ownerIds ?? [])
      .map((id) => REGISTERED_STUDENTS.find((u) => u.id === id)?.email)
      .filter((e): e is string => !!e);

  const pending = state.connections.filter((c) => c.status === "pending");
  const done = state.connections.filter((c) => c.status === "accepted");

  const copy = async (c: Connection) => {
    try {
      await navigator.clipboard.writeText([c.fromEmail, ...teamEmails(c)].join(", "));
    } catch {
      // The emails are also shown on screen.
    }
    setCopied(c.id);
  };

  const card = (c: Connection) => {
    const emails = teamEmails(c);
    return (
      <li key={c.id} className="flex flex-col gap-3 rounded-2xl bg-surface p-4 ring-1 ring-line">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold text-navy">
              {c.fromName} <span className="font-normal text-muted">to</span> {productOf(c)?.name ?? "Unknown product"}
            </p>
            <p className="text-sm text-muted">
              {c.fromRole} · {new Date(c.at).toLocaleDateString()}
            </p>
          </div>
          {c.status === "accepted" && <Pill tone="good">Introduced</Pill>}
        </div>
        {c.message && <p className="text-sm leading-snug">&ldquo;{c.message}&rdquo;</p>}
        <dl className="grid gap-1 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Viewer email</dt>
            <dd className="select-all break-all text-royal">{c.fromEmail}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Team email</dt>
            <dd className="select-all break-all text-royal">
              {emails.length ? emails.join(", ") : <span className="text-muted">None on file. Add the team in the listing.</span>}
            </dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          {c.status === "pending" ? (
            <>
              <button type="button" onClick={() => respond(c.id, "accepted")} className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white">
                Make introduction
              </button>
              <button type="button" onClick={() => respond(c.id, "declined")} className="rounded-full px-5 py-2 text-sm font-semibold text-muted ring-1 ring-line">
                Decline
              </button>
            </>
          ) : (
            <button type="button" onClick={() => copy(c)} className="rounded-full px-5 py-2 text-sm font-semibold text-royal ring-1 ring-royal">
              {copied === c.id ? "Emails copied" : "Copy both emails"}
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Introductions</h1>
        <p className="text-sm text-muted">
          Investors and alumni ask for an introduction. Make it, then they take it from there by email. No
          scheduling happens in the app.
        </p>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-navy">Waiting ({pending.length})</h2>
        {pending.length ? <ul className="flex flex-col gap-3">{pending.map(card)}</ul> : <p className="rounded-2xl bg-surface p-5 text-sm text-muted ring-1 ring-line">No requests waiting.</p>}
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-navy">Introduced ({done.length})</h2>
        {done.length ? <ul className="flex flex-col gap-3">{done.map(card)}</ul> : <p className="rounded-2xl bg-surface p-5 text-sm text-muted ring-1 ring-line">Nothing yet.</p>}
      </section>
    </div>
  );
}
