import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

interface SheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Two-column layout on larger screens, for sheets that show a reference beside a form. */
  wide?: boolean;
}

const CLOSE_MS = 260;
const DRAG_CLOSE_PX = 120;

// Slides up with a soft spring, slides back down on close, and can be dragged down by its header.
export function Sheet({ title, onClose, children, footer, wide = false }: SheetProps) {
  const [closing, setClosing] = useState(false);
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  }, [closing, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const dragging = startY.current !== null;
  const translate = closing ? "100%" : `${drag}px`;

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center sm:items-center ${closing ? "anim-backdrop-out" : "anim-backdrop"}`}
      style={{ backgroundColor: "color-mix(in srgb, var(--color-ink) 50%, transparent)" }}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${translate})`,
          transition: dragging ? "none" : `transform ${CLOSE_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
        className={`anim-sheet flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl ${wide ? "max-w-lg sm:h-[min(46rem,92dvh)] sm:max-w-5xl" : "max-w-lg"}`}
      >
        <div
          className="touch-none border-b border-line"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            startY.current = e.clientY;
          }}
          onPointerMove={(e) => {
            if (startY.current !== null) setDrag(Math.max(0, e.clientY - startY.current));
          }}
          onPointerUp={() => {
            startY.current = null;
            if (drag > DRAG_CLOSE_PX) close();
            else setDrag(0);
          }}
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
          <div className="flex items-center justify-between px-5 pb-2 pt-1">
            <h2 className="font-display text-base font-semibold text-navy">{title}</h2>
            <button
              type="button"
              onClick={close}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Close"
              className="grid size-9 place-items-center rounded-full text-muted hover:bg-canvas"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${wide ? "sm:overflow-hidden" : ""}`}>{children}</div>
        {footer && <div className="border-t border-line bg-surface px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
