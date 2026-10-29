import { useState } from "react";
import { useStore } from "../store/StoreContext";
import type { Product } from "../types";

// Lets an investor or alum ask the team to connect. Shown only to external users.
export function ConnectBox({ product }: { product: Product }) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const session = state.session;
  if (!session || session.persona !== "external") return null;

  const existing = state.connections.find(
    (c) => c.productId === product.id && c.fromEmail === session.email,
  );

  if (existing) {
    const text =
      existing.status === "accepted"
        ? "Introduced. Check your email to take it from here."
        : existing.status === "pending"
          ? "Request sent. CFCI staff will introduce you to the team by email."
          : "CFCI is not able to make this introduction right now.";
    return <p className="rounded-xl bg-canvas px-3 py-2 text-sm text-muted">{text}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
      >
        Request an introduction
      </button>
    );
  }

  return (
    <div className="anim-fade flex flex-col gap-2 rounded-xl bg-canvas p-3">
      <label htmlFor="connect-message" className="text-sm font-semibold text-navy">
        Add a note for the introduction (optional)
      </label>
      <textarea
        id="connect-message"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Why you are interested, or how you could help"
        className="rounded-xl border border-line bg-surface px-3 py-2 text-sm"
      />
      <p className="text-xs text-muted">
        CFCI staff review this and introduce you to the team by email. You take it from there.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "request_connection",
              connection: {
                id: `conn-${Date.now()}`,
                productId: product.id,
                fromName: session.name,
                fromRole: session.roleLabel,
                fromEmail: session.email,
                message: message.trim(),
                status: "pending",
                at: new Date().toISOString(),
              },
            })
          }
          className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white"
        >
          Send request
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 text-sm font-medium text-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
