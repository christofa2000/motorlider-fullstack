"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";

type ProductLike = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  categoryId: string;
};

type Props = {
  product: ProductLike;
  variant?: "inline" | "sticky";
};

export default function ProductActions({ product, variant = "inline" }: Props) {
  const [qty, setQty] = useState(1);
  const addToCart = useCartStore((s) => s.add);
  const router = useRouter();

  const dec = () => setQty((q) => Math.max(1, q - 1));
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const onChange = (v: string) => {
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) setQty(Math.min(99, Math.max(1, n)));
  };

  const handleAdd = () => {
    // Uses store to add item
    // @ts-expect-error product shape matches client Product partially
    addToCart(product, qty);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push("/cart");
  };

  const content = (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center rounded-md border border-[var(--color-neutral-300)]">
        <button
          type="button"
          aria-label="Disminuir cantidad"
          className="px-3 py-2"
          onClick={dec}
        >
          −
        </button>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="Cantidad"
          className="w-12 border-0 bg-transparent text-center outline-none"
          value={qty}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-label="Aumentar cantidad"
          className="px-3 py-2"
          onClick={inc}
        >
          +
        </button>
      </div>

      <button className="btn btn-primary flex-1" onClick={handleAdd}>
        Agregar al carrito
      </button>
      <button className="btn flex-1" onClick={handleBuyNow}>
        Comprar ahora
      </button>
    </div>
  );

  if (variant === "sticky") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-neutral-200)] bg-[var(--color-neutral-900)]/90 p-3 text-[var(--color-contrast)] backdrop-saturate-150 md:hidden">
        {content}
      </div>
    );
  }

  return <div className="flex flex-col gap-2">{content}</div>;
}

