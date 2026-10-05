import type { Product } from "../../api/types";
import { CategoryChip } from "../CategoryChip";

interface ProductInfoSheetProps {
  product: Product | null;
  loading: boolean;
  readOnly?: boolean;
  onClose: () => void;
  onSwipe?: (direction: "left" | "right") => void;
}

export function ProductInfoSheet({
  product,
  loading,
  readOnly,
  onClose,
  onSwipe,
}: ProductInfoSheetProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="bg-surface rounded-card relative flex h-[92vh] w-full max-w-md flex-col overflow-hidden sm:h-[85vh]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="bg-surface/90 text-ink absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow"
        >
          ×
        </button>

        {loading || !product ? (
          <div className="text-muted flex flex-1 items-center justify-center">Loading…</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <video
                src={product.demo_video_url}
                poster={product.cover_image_url}
                controls
                autoPlay
                muted
                className="aspect-video w-full bg-black"
              />
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-navy text-2xl font-bold">{product.name}</h2>
                  <CategoryChip category={product.category} />
                </div>
                <p className="text-ink font-medium">{product.one_liner}</p>
                <p className="text-muted text-sm whitespace-pre-line">{product.brief}</p>
                <p className="text-muted text-xs">Built by {product.team_name}</p>
              </div>
            </div>

            {!readOnly && onSwipe && (
              <div className="bg-surface flex gap-3 border-t border-black/5 p-4">
                <button
                  type="button"
                  onClick={() => onSwipe("left")}
                  className="rounded-card border-muted/30 text-muted flex-1 border py-3 font-semibold"
                >
                  Not interested
                </button>
                <button
                  type="button"
                  onClick={() => onSwipe("right")}
                  className="rounded-card bg-interest flex-1 py-3 font-semibold text-white"
                >
                  Interested
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
