import { useCallback, useEffect, useRef, useState } from "react";
import { DIMENSIONS } from "../data/dimensions";
import { useStore } from "../store/StoreContext";
import type { DimensionKey, Evaluation, Product, ReactionKey } from "../types";

const EMPTY_REACTIONS: Record<ReactionKey, boolean> = { use: false, invest: false, intro: false };

/**
 * One viewer's take on one product. Every change is saved on its own as a partially completed take, which
 * the team and CFCI can already see. Submitting marks it complete; changing it later updates it in place.
 */
export function useEvaluation(product: Product) {
  const { state, dispatch } = useStore();
  const session = state.session;
  const existing = state.evaluations.find((e) => e.productId === product.id);
  const [ratings, setRatings] = useState<Partial<Record<DimensionKey, number>>>(existing?.ratings ?? {});
  const [unsure, setUnsure] = useState<Partial<Record<DimensionKey, boolean>>>(existing?.unsure ?? {});
  const [notes, setNotes] = useState<Partial<Record<DimensionKey, string>>>(existing?.notes ?? {});
  const [reactions, setReactions] = useState(existing?.reactions ?? EMPTY_REACTIONS);
  const [introNote, setIntroNote] = useState(existing?.introNote ?? "");
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [touched, setTouched] = useState(false);
  const id = useRef(existing?.id ?? `eval-${product.id}-${Date.now()}`);

  const wasComplete = existing ? !existing.partial : false;

  const build = useCallback(
    (partial: boolean): Evaluation => ({
      id: id.current,
      productId: product.id,
      viewerLabel: session?.roleLabel ?? "Viewer",
      ratings,
      unsure,
      notes,
      reactions,
      introNote: reactions.intro ? introNote.trim() : "",
      comment: comment.trim(),
      partial: partial || undefined,
      at: new Date().toISOString(),
    }),
    [product.id, session?.roleLabel, ratings, unsure, notes, reactions, introNote, comment],
  );

  useEffect(() => {
    if (!touched) return;
    dispatch({ type: "save_evaluation", evaluation: build(!wasComplete) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched, ratings, unsure, notes, reactions, introNote, comment]);

  const change = <T,>(set: (fn: (v: T) => T) => void, fn: (v: T) => T) => {
    setTouched(true);
    set(fn);
  };

  const isAnswered = (k: DimensionKey) => ratings[k] !== undefined || !!unsure[k];
  const missing = DIMENSIONS.filter((d) => d.required && !isAnswered(d.key));

  return {
    existing,
    status: wasComplete ? ("done" as const) : touched || existing ? ("partial" as const) : ("new" as const),
    ratings,
    unsure,
    notes,
    reactions,
    introNote,
    comment,
    isAnswered,
    missing,
    rate: (key: DimensionKey, n: number) => {
      change(setRatings, (r) => ({ ...r, [key]: n }));
      setUnsure((u) => ({ ...u, [key]: false }));
    },
    markUnsure: (key: DimensionKey) => {
      change(setRatings, (r) => {
        const next = { ...r };
        delete next[key];
        return next;
      });
      setNotes((n) => ({ ...n, [key]: "" }));
      setUnsure((u) => ({ ...u, [key]: true }));
    },
    setNote: (key: DimensionKey, text: string) => change(setNotes, (n) => ({ ...n, [key]: text })),
    toggleReaction: (key: ReactionKey) => change(setReactions, (s) => ({ ...s, [key]: !s[key] })),
    setIntroNote: (v: string) => change(setIntroNote, () => v),
    setComment: (v: string) => change(setComment, () => v),
    submit: () => dispatch({ type: "save_evaluation", evaluation: build(false) }),
  };
}

export type EvaluationForm = ReturnType<typeof useEvaluation>;
