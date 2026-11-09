import { useCallback, useEffect, useRef, useState } from "react";
import { DIMENSIONS } from "../data/dimensions";
import { useStore } from "../store/StoreContext";
import type { DimensionKey, Evaluation, Product, ReactionKey } from "../types";

const EMPTY_REACTIONS: Record<ReactionKey, boolean> = { use: false, invest: false, intro: false };

/**
 * One viewer's take on one product. It works like a shared doc: every change is saved on its own, the team and
 * CFCI can already see it, and coming back later updates the same take. It counts as partially completed until
 * the three core lenses have an answer (a score or "not sure").
 */
export function useEvaluation(product: Product) {
  const { state, dispatch } = useStore();
  const session = state.session;
  const existing = state.evaluations.find((e) => e.productId === product.id);
  const productVersion = product.version ?? 1;
  // The team has updated since this viewer last gave scores: the new scores start blank and the old ones become "last".
  const stale = !!existing && (existing.version ?? 1) < productVersion;
  const last = useRef(
    stale && existing
      ? { version: existing.version ?? 1, ratings: existing.ratings, unsure: existing.unsure ?? {}, notes: existing.notes }
      : existing?.last,
  );
  const [ratings, setRatings] = useState<Partial<Record<DimensionKey, number>>>(stale ? {} : (existing?.ratings ?? {}));
  const [unsure, setUnsure] = useState<Partial<Record<DimensionKey, boolean>>>(stale ? {} : (existing?.unsure ?? {}));
  const [notes, setNotes] = useState<Partial<Record<DimensionKey, string>>>(stale ? {} : (existing?.notes ?? {}));
  const [reactions, setReactions] = useState(existing?.reactions ?? EMPTY_REACTIONS);
  const [introNote, setIntroNote] = useState(existing?.introNote ?? "");
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [touched, setTouched] = useState(false);
  const id = useRef(existing?.id ?? `eval-${product.id}-${Date.now()}`);

  const build = useCallback(
    (): Evaluation => ({
      id: id.current,
      productId: product.id,
      viewerLabel: session?.roleLabel ?? "Viewer",
      ratings,
      unsure,
      notes,
      reactions,
      introNote: reactions.intro ? introNote.trim() : "",
      comment: comment.trim(),
      partial: DIMENSIONS.some((d) => d.required && ratings[d.key] === undefined && !unsure[d.key]) || undefined,
      version: productVersion,
      last: last.current,
      at: new Date().toISOString(),
    }),
    [product.id, productVersion, session?.roleLabel, ratings, unsure, notes, reactions, introNote, comment],
  );

  useEffect(() => {
    if (!touched) return;
    dispatch({ type: "save_evaluation", evaluation: build() });
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
    status: touched || existing ? ("saved" as const) : ("new" as const),
    partial: !!existing?.partial,
    /** The viewer's scores from before the team's last update, shown beside the new ones. */
    last: last.current,
    hasContent:
      (!stale || touched) &&
      (Object.keys(ratings).length > 0 ||
      Object.values(unsure).some(Boolean) ||
      Object.values(notes).some((t) => !!t?.trim()) ||
      Object.values(reactions).some(Boolean) ||
      comment.trim() !== ""),
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
  };
}

export type EvaluationForm = ReturnType<typeof useEvaluation>;
