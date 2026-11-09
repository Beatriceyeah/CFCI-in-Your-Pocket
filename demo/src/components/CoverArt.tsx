import type { Direction, Product } from "../types";
import { Icon } from "./Icon";

const GRADIENT: Record<Direction, string> = {
  health: "from-navy via-royal to-royal",
  software: "from-navy via-accent-purple to-accent-purple",
  hardware: "from-royal via-navy to-navy",
};

// Placeholder cover until teams upload real images.
export function CoverArt({ product, className = "", featured = false }: { product: Product; className?: string; featured?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${GRADIENT[product.category]} ${className}`}
      role="img"
      aria-label={`${product.name} cover`}
    >
      <svg className="absolute inset-0 size-full text-white/10" aria-hidden="true">
        <defs>
          <pattern id={`g-${product.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#g-${product.id})`} />
      </svg>
      {featured && (
        <span
          className="absolute left-4 top-4 grid size-8 place-items-center rounded-full bg-interest text-white shadow"
          role="img"
          aria-label="Featured by CFCI"
        >
          <Icon name="star" className="size-4.5" />
        </span>
      )}
    </div>
  );
}
