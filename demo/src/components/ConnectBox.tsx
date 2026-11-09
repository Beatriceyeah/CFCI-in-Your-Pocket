import { useState } from "react";
import { useStore } from "../store/StoreContext";
import type { Product } from "../types";
import { Icon } from "./Icon";
import { Sheet } from "./Sheet";

/** Small icon-and-label button used beside Skip and Interested. */
export function IntroButton({
  product,
  onOpen,
  compact = false,
}: {
  product: Product;
  onOpen: () => void;
  compact?: boolean;
}) {
  const { state } = useStore();
  const sent = state.connections.some((c) => c.productId === product.id && c.fromEmail === state.session?.email);
  if (compact) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={sent ? "Introduction requested" : "Request an introduction"}
        className={`grid size-10 place-items-center rounded-full ring-1 ring-inset ${
          sent ? "bg-interest/15 text-interest-deep ring-interest/40" : "bg-surface text-royal ring-royal/40"
        }`}
      >
        <Icon name={sent ? "check" : "mail"} className="size-5" />
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-sm font-semibold ring-1 ring-inset ${
        sent ? "bg-interest/15 text-interest-deep ring-interest/40" : "text-royal ring-royal"
      }`}
    >
      <Icon name={sent ? "check" : "mail"} className="size-4" />
      {sent ? "Intro requested" : "Request an introduction"}
    </button>
  );
}

// Lets an investor or alum ask CFCI to introduce them to the team. Shown only to external users.
export function IntroSheet({ product, onClose }: { product: Product; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [message, setMessage] = useState("");
  const session = state.session;
  if (!session || session.persona !== "external") return null;
  const existing = state.connections.find((c) => c.productId === product.id && c.fromEmail === session.email);

  const text =
    existing?.status === "accepted"
      ? "Introduced. Check your email to take it from here."
      : existing?.status === "pending"
        ? "Request sent. CFCI staff will introduce you to the team by email."
        : "CFCI is not able to make this introduction right now.";

  return (
    <Sheet title="Request an introduction" onClose={onClose}>
      <div className="flex flex-col gap-3 p-5">
        <p className="font-display text-xl font-semibold text-navy">{product.name}</p>
        {existing ? (
          <p className="rounded-xl bg-canvas px-3 py-3 text-sm">{text}</p>
        ) : (
          <>
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
              className="self-start rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white"
            >
              Send request
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
