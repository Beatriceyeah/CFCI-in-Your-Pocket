import type { ProductCard } from "../api/types";
import { DIRECTION_LABELS } from "./labels";

interface Props {
  product: ProductCard;
  onOpen: (id: string) => void;
}

export function GalleryCard({ product, onOpen }: Props) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product.id)}
      className="group bg-surface rounded-card w-full overflow-hidden text-left shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
    >
      <div className="bg-canvas aspect-[4/3] overflow-hidden">
        <img
          src={product.cover_image_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <span className="text-royal text-xs font-semibold tracking-wide uppercase">
          {DIRECTION_LABELS[product.category]}
        </span>
        <span className="text-lg font-bold">{product.name}</span>
        <span className="text-muted text-sm">{product.one_liner}</span>
      </div>
    </button>
  );
}
