import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "../types";
import { Icon } from "./Icon";
import { ProductCard } from "./ProductCard";

const THRESHOLD = 110;

interface Props {
  products: Product[];
  onSwipe: (product: Product, direction: "left" | "right") => void;
  onOpen: (product: Product) => void;
  paused: boolean;
  featured: ReadonlySet<string>;
  /** When set, replaces the action buttons for a moment. */
  notice?: ReactNode;
}

export function SwipeDeck({
  products,
  onSwipe,
  onOpen,
  paused,
  featured,
  notice,
}: Props) {
  const [dx, setDx] = useState(0);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const top = products[0];
  const next = products[1];

  const commit = useCallback(
    (direction: "left" | "right") => {
      if (!top || exiting) return;
      setExiting(direction);
      window.setTimeout(() => {
        onSwipe(top, direction);
        setExiting(null);
        setDx(0);
      }, 220);
    },
    [top, exiting, onSwipe],
  );

  useEffect(() => {
    if (paused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") commit("left");
      if (e.key === "ArrowRight") commit("right");
      if (e.key === "Enter" && top) onOpen(top);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, commit, onOpen, top]);

  if (!top) return null;

  const offset = exiting === "left" ? -600 : exiting === "right" ? 600 : dx;
  const rotate = offset / 22;
  const interest = Math.min(1, Math.max(0, offset / THRESHOLD));
  const skip = Math.min(1, Math.max(0, -offset / THRESHOLD));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="relative min-h-0 flex-1">
        {next && (
          <div
            className="absolute inset-0 scale-[0.95] opacity-80"
            aria-hidden="true"
          >
            <ProductCard product={next} featured={featured.has(next.id)} />
          </div>
        )}
        <div
          key={top.id}
          className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{
            transform: `translateX(${offset}px) rotate(${rotate}deg)`,
            transition: start.current ? "none" : "transform 0.22s ease-out",
            opacity: exiting ? 0.4 : 1,
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            start.current = { x: e.clientX, y: e.clientY, moved: false };
          }}
          onPointerMove={(e) => {
            if (!start.current) return;
            const d = e.clientX - start.current.x;
            if (Math.abs(d) > 6) start.current.moved = true;
            setDx(d);
          }}
          onPointerUp={() => {
            const s = start.current;
            start.current = null;
            if (!s) return;
            if (!s.moved) {
              setDx(0);
              onOpen(top);
            } else if (dx > THRESHOLD) commit("right");
            else if (dx < -THRESHOLD) commit("left");
            else setDx(0);
          }}
          onPointerCancel={() => {
            start.current = null;
            setDx(0);
          }}
        >
          <ProductCard product={top} featured={featured.has(top.id)} />
          <div
            className="pointer-events-none absolute left-5 top-5 rounded-lg border-2 border-interest bg-surface/90 px-3 py-1 font-display text-lg font-bold uppercase tracking-wider text-interest-deep"
            style={{ opacity: interest, transform: "rotate(-8deg)" }}
          >
            Interested
          </div>
          <div
            className="pointer-events-none absolute right-5 top-5 rounded-lg border-2 border-muted bg-surface/90 px-3 py-1 font-display text-lg font-bold uppercase tracking-wider text-muted"
            style={{ opacity: skip, transform: "rotate(8deg)" }}
          >
            Skip
          </div>
        </div>
      </div>

      {notice ? (
        <div className="flex min-h-16 items-center justify-center">
          {notice}
        </div>
      ) : (
        <div className="flex min-h-16 items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => commit("left")}
            aria-label="Skip"
            className="grid size-14 place-items-center rounded-full bg-surface text-muted shadow-md ring-1 ring-line hover:text-ink"
          >
            <Icon name="close" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => onOpen(top)}
            aria-label="Open overview"
            className="grid size-11 place-items-center rounded-full bg-surface text-royal shadow-md ring-1 ring-line"
          >
            <Icon name="info" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => commit("right")}
            aria-label="Interested"
            className="grid size-14 place-items-center rounded-full bg-interest text-white shadow-md hover:brightness-95"
          >
            <Icon name="heart" className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
}
