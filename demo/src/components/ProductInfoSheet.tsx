import { useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import { DIMENSIONS } from "../data/dimensions";
import { isFeatured } from "../lib/order";
import { useStore } from "../store/StoreContext";
import type { DimensionKey, Product } from "../types";
import { Celebration } from "./Celebration";
import { CoverArt } from "./CoverArt";
import { FeedbackFinish, LensComment } from "./FeedbackSections";
import { Icon } from "./Icon";
import { UpdateSummaryCard } from "./UpdateSummaryCard";
import { ProductOverview } from "./ProductOverview";
import { Sheet } from "./Sheet";
import { useEvaluation } from "./useEvaluation";

interface Props {
  product: Product;
  onClose: () => void;
  /** The bottom bar. A function gets `done`, the same action as the Done button (thank-you if anything was written). */
  footer?: ReactNode | ((done: () => void) => ReactNode);
  /** Takes the place of the Done button at the end of the feedback questions. Done then belongs in `footer`. */
  introAction?: ReactNode;
  /** Ask for feedback beside each section (investors and alumni only). */
  feedback?: boolean;
  /** Scroll to the first feedback question on open. */
  focusFeedback?: boolean;
}

function FeedbackOverview({
  product,
  focus,
  onClose,
  doneRef,
  introAction,
}: {
  product: Product;
  focus: boolean;
  onClose: () => void;
  doneRef: MutableRefObject<() => void>;
  introAction?: ReactNode;
}) {
  const { state, dispatch } = useStore();
  const form = useEvaluation(product);

  // Remember what this viewer had seen when the overview opened, so the summary stays put while they read.
  const seenAtOpen = useRef(state.seen[product.id] ?? form.existing?.version ?? state.swipes[product.id]?.version);
  const summary =
    product.updateSummary ?? (product.updateNote ? { headline: product.updateNote, points: [] } : undefined);
  // Anyone who has decided something about this venture (saved it, reviewed it or passed on it) is told what changed.
  const followed = !!form.existing || !!state.swipes[product.id];
  const hasChanged = followed && seenAtOpen.current !== undefined && seenAtOpen.current < (product.version ?? 1);

  // Closing the overview counts as having seen the latest version.
  useEffect(
    () => () => {
      dispatch({ type: "mark_seen", productId: product.id });
    },
    [dispatch, product.id],
  );
  const [celebrating, setCelebrating] = useState(false);
  const helped = state.evaluations.length;

  // Only an unfinished review opens a comment by itself: the first of the three core lenses that has no answer yet.
  const autoKey = useRef(focus && form.existing?.partial ? form.missing[0]?.key : undefined);

  useEffect(() => {
    const key = autoKey.current;
    if (!key) return;
    const t = window.setTimeout(
      () => document.getElementById(`dim-${key}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
      450,
    );
    return () => window.clearTimeout(t);
  }, []);

  // The Done button may live in the sheet's bottom bar, so hand its action up.
  doneRef.current = () => (form.hasContent ? setCelebrating(true) : onClose());

  const lens = (key: DimensionKey) => {
    const dim = DIMENSIONS.find((d) => d.key === key);
    return dim ? <LensComment dim={dim} form={form} defaultOpen={key === autoKey.current} /> : null;
  };


  return (
    <>
      {hasChanged && summary && <UpdateSummaryCard summary={summary} from={seenAtOpen.current ?? 1} to={product.version ?? 1} marked={!!product.updateChanges} />}
      <ProductOverview product={product} lens={lens} changes={hasChanged ? product.updateChanges : undefined} />
      <FeedbackFinish form={form} onDone={() => doneRef.current()} action={introAction} />
      {celebrating && (
        <Celebration
          teamName={product.name}
          helped={helped}
          onDone={() => {
            setCelebrating(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

export function ProductInfoSheet({
  product,
  onClose,
  footer,
  introAction,
  feedback = false,
  focusFeedback = false,
}: Props) {
  const { state } = useStore();
  const doneRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const uploaded = state.session?.persona === "admin" ? product.uploadedBy : undefined;
  const asks = feedback && state.session?.persona === "external";
  return (
    <Sheet
      title={product.name}
      onClose={onClose}
      footer={typeof footer === "function" ? footer(() => doneRef.current()) : footer}
    >
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
          <FeedbackOverview
            product={product}
            focus={focusFeedback}
            onClose={onClose}
            doneRef={doneRef}
            introAction={introAction}
          />
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
