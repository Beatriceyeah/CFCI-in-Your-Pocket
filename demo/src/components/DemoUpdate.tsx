import { useState } from "react";
import { pickDemoUpdate } from "../lib/demoUpdate";
import { useStore } from "../store/StoreContext";
import type { Product } from "../types";

// Demo only: acts as if a team had just posted an update to a venture the viewer follows (reviewed first, then
// saved, then passed on). It sits where the update will show up, so a demo viewer can find it.
export function DemoUpdate({ onPosted, explain = false }: { onPosted?: (product: Product) => void; explain?: boolean }) {
  const { state, dispatch } = useStore();
  const [note, setNote] = useState<string | null>(null);

  const simulate = () => {
    const update = pickDemoUpdate(state);
    if (!update) {
      setNote("Save, review or pass on a venture first, then try again.");
      return;
    }
    dispatch({ type: "update_product", productId: update.product.id, patch: update.patch, note: update.note });
    setNote(`${update.product.name} just posted an update. Look for the green "Recently updated" mark.`);
    onPosted?.(update.product);
  };

  return (
    <div className="flex flex-col gap-2">
      {explain && (
        <p className="text-sm text-muted">
          In a real listing, a team posts an update and the ventures you follow get a "Recently updated" mark. To see
          that now, pretend one of your ventures just got an update.
        </p>
      )}
      <button
        type="button"
        onClick={simulate}
        className="self-start rounded-full px-4 py-2 text-sm font-semibold text-royal ring-1 ring-royal"
      >
        Simulate a team update
      </button>
      {note && (
        <p role="status" className="text-sm text-navy">
          {note}
        </p>
      )}
    </div>
  );
}
