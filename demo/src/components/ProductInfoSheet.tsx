import { useEffect, useState, type ReactNode } from "react";
import { DIMENSIONS } from "../data/dimensions";
import { isFeatured } from "../lib/order";
import { useStore } from "../store/StoreContext";
import type { DimensionKey, Product } from "../types";
import { Celebration } from "./Celebration";
import { CoverArt } from "./CoverArt";
import { FeedbackBanner, FeedbackFinish, LensControl } from "./FeedbackSections";
import { Icon } from "./Icon";
import { ProductOverview } from "./ProductOverview";
import { Sheet } from "./Sheet";
import { useEvaluation } from "./useEvaluation";

interface Props {
  product: Product;
  onClose: () => void;
  footer?: ReactNode;
  /** Ask for feedback beside each section (investors and alumni only). */
  feedback?: boolean;
  /** Scroll to the first feedback question on open. */
  focusFeedback?: boolean;
  onShared?: () => void;
}

function FeedbackOverview({
  product,
  focus,
  onShared,
  onClose,
}: {
  product: Product;
  focus: boolean;
  onShared?: () => void;
  onClose: () => void;
}) {
  const { state } = useStore();
  const form = useEvaluation(product);
  const [celebrating, setCelebrating] = useState(false);
  const helped = state.evaluations.filter((e) => !e.partial).length;

  useEffect(() => {
    if (!focus) return;
    const t = window.setTimeout(
      () => document.getElementById("dim-problem")?.scrollIntoView({ behavior: "smooth", block: "center" }),
      450,
    );
    return () => window.clearTimeout(t);
  }, [focus]);

  const lens = (key: DimensionKey) => {
    const dim = DIMENSIONS.find((d) => d.key === key);
    return dim ? <LensControl dim={dim} form={form} flagged={false} /> : null;
  };

  return (
    <>
      <FeedbackBanner product={product} form={form} />
      <ProductOverview product={product} lens={lens} />
      <FeedbackFinish form={form} onSubmitted={() => setCelebrating(true)} />
      {celebrating && (
        <Celebration
          teamName={product.name}
          helped={helped}
          onDone={() => {
            setCelebrating(false);
            onShared?.();
            onClose();
          }}
        />
      )}
    </>
  );
}

export function ProductInfoSheet({ product, onClose, footer, feedback = false, focusFeedback = false, onShared }: Props) {
  const { state } = useStore();
  const [playing, setPlaying] = useState(false);
  const uploaded = state.session?.persona === "admin" ? product.uploadedBy : undefined;
  const asks = feedback && state.session?.persona === "external";
  return (
    <Sheet title={product.name} onClose={onClose} footer={footer}>
      <div className="relative">
        <CoverArt product={product} featured={isFeatured(product)} className="h-40 w-full" />
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
        {asks ? (
          <FeedbackOverview product={product} focus={focusFeedback} onShared={onShared} onClose={onClose} />
        ) : (
          <ProductOverview product={product} />
        )}
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
