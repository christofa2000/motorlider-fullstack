"use client";

import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import useToast from "@/hooks/useToast";
import ProductImage from "./ProductImage";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.add);
  const { show } = useToast();

  const handleBuy = () => {
    addToCart(product.id, 1);
    show("Producto agregado al carrito");
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[var(--color-neutral-200)] bg-white transition hover:-translate-y-0.5 hover:border-[var(--color-neutral-700)] hover:shadow-md">
      <div className="relative aspect-square w-full bg-[var(--color-neutral-200)]">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{product.name}</h3>
        <p className="mt-auto text-lg font-semibold text-[var(--color-primary)]">
          {formatCurrency(product.price)}
        </p>
        <button
          type="button"
          onClick={handleBuy}
          aria-label={`Agregar ${product.name} al carrito`}
          className="btn btn-primary w-full hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
        >
          Comprar
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
