import { SEED_PRODUCTS } from "../data/products";
import { ProductCard } from "./ProductCard";

const SHOWN = ["er-guide", "kinema", "falcon"];

// A small fan of real cards, so the login page shows what the product looks like.
export function CardPreview() {
  const products = SHOWN.map((id) =>
    SEED_PRODUCTS.find((p) => p.id === id),
  ).filter((p) => !!p);
  const pose = [
    "-translate-x-[55%] translate-y-5 -rotate-[8deg] scale-[0.52]",
    "translate-x-[55%] translate-y-5 rotate-[8deg] scale-[0.52]",
    "z-10 scale-[0.6]",
  ];
  return (
    <div
      className="pointer-events-none relative mx-auto h-[13rem] w-full select-none"
      aria-hidden="true"
    >
      {products.map((p, i) => (
        <div
          key={p.id}
          className={`absolute left-1/2 top-0 -ml-30 h-[22rem] w-60 origin-top drop-shadow-md ${pose[i] ?? ""}`}
        >
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}
