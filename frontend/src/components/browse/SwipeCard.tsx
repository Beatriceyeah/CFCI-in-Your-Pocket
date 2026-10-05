import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { ProductCard as ProductCardData } from "../../api/types";
import { CategoryChip } from "../CategoryChip";

const SWIPE_THRESHOLD = 100;
const TAP_THRESHOLD = 6;

interface SwipeCardProps {
  product: ProductCardData;
  onSwipe: (direction: "left" | "right") => void;
  onTap: () => void;
  isTop: boolean;
}

export function SwipeCard({ product, onSwipe, onTap, isTop }: SwipeCardProps) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!isTop) return;
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDx(event.clientX - startX.current);
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      onSwipe(dx > 0 ? "right" : "left");
    } else if (Math.abs(dx) < TAP_THRESHOLD) {
      onTap();
    }
    setDx(0);
  }

  const rotation = dx / 18;
  const style = isTop
    ? {
        transform: `translateX(${dx}px) rotate(${rotation}deg)`,
        transition: dragging ? "none" : "transform 200ms ease-out",
      }
    : { transform: "scale(0.96) translateY(10px)" };

  return (
    <div
      data-testid="swipe-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={style}
      className={`bg-surface rounded-card absolute inset-0 flex touch-none select-none flex-col overflow-hidden shadow-lg ${isTop ? "z-10 cursor-grab active:cursor-grabbing" : "z-0"}`}
    >
      <img
        src={product.cover_image_url}
        alt={product.name}
        className="h-2/3 w-full object-cover"
        draggable={false}
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-ink text-xl font-bold">{product.name}</h2>
          <CategoryChip category={product.category} />
        </div>
        <p className="text-muted text-sm">{product.one_liner}</p>
      </div>

      {isTop && dx > 30 && (
        <span className="border-interest text-interest absolute top-6 left-6 rounded-md border-2 px-2 py-1 text-sm font-bold">
          INTERESTED
        </span>
      )}
      {isTop && dx < -30 && (
        <span className="text-muted absolute top-6 right-6 rounded-md border-2 border-current px-2 py-1 text-sm font-bold">
          PASS
        </span>
      )}
    </div>
  );
}
