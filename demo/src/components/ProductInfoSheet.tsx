import { useState, type ReactNode } from "react";
import type { Product } from "../types";
import { ConnectBox } from "./ConnectBox";
import { CoverArt } from "./CoverArt";
import { Icon } from "./Icon";
import { ProductOverview } from "./ProductOverview";
import { Sheet } from "./Sheet";
import { isFeatured } from "../lib/order";
import { useStore } from "../store/StoreContext";

interface Props {
  product: Product;
  onClose: () => void;
  footer?: ReactNode;
}

export function ProductInfoSheet({ product, onClose, footer }: Props) {
  const { state } = useStore();
  const [playing, setPlaying] = useState(false);
  const uploaded = state.session?.persona === "admin" ? product.uploadedBy : undefined;
  return (
    <Sheet title={product.name} onClose={onClose} footer={footer}>
      <div className="relative">
        <CoverArt product={product} featured={isFeatured(product)} className="h-48 w-full" />
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="absolute inset-0 grid place-items-center"
          aria-label={playing ? "Stop demo video" : "Play demo video"}
        >
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-navy shadow-lg">
            <Icon name="play" className="size-6" />
          </span>
        </button>
        {playing && (
          <p className="absolute inset-x-0 bottom-0 bg-navy/85 px-4 py-2 text-center text-sm text-white">
            Demo video plays here. The sample listings do not have video files yet.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5 p-5">
        <ProductOverview product={product} />
        <ConnectBox product={product} />
        {state.session?.persona === "admin" && (
          <p className="rounded-xl bg-canvas px-3 py-2 text-sm text-muted">
            {uploaded
              ? `Uploaded by ${uploaded.name} · ${new Date(uploaded.at).toLocaleDateString()}`
              : "Not uploaded yet. Upload the details to publish."}
          </p>
        )}
      </div>
    </Sheet>
  );
}
