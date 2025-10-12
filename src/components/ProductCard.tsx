"use client";

import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/types";
import useToast from "@/hooks/useToast";
import Link from "next/link";
import ProductImage from "./ProductImage";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

const transformCloudinary = (src: string, w: number, h: number) => {
  if (!src?.startsWith("https://res.cloudinary.com/")) return src;
  const parts = src.split("/upload/");
  if (parts.length !== 2) return src;
  return `${parts[0]}/upload/f_auto,q_auto,c_fill,w_${w},h_${h}/${parts[1]}`;
};

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const addToCart = useCartStore((state) => state.add);
  const { toast } = useToast();

  const handleBuy = () => {
    addToCart(product, 1);
    toast({ title: "Producto agregado al carrito" });
  };

  const stock = product.stock ?? 0;
  const stockLabel = stock <= 0 ? "Sin stock" : stock <= 10 ? "Stock bajo" : "Stock ok";
  const stockClass = stock <= 0 ? "badge-out" : stock <= 10 ? "badge-low" : "badge-ok";

  const imgSrc = transformCloudinary(product.image, 480, 360);

  return (
    <article className="card">
      <div className="media aspect-[4/3]">
        <ProductImage
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          priority={priority}
          className="object-cover"
        />

        <span className={["badge", stockClass].join(" ")}>{stockLabel}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="title line-clamp-2">{product.name}</h3>
        <p className="price mt-auto">{formatCurrency(product.price)}</p>

        <div className="flex gap-2">
          <Link
            href={`/products/${product.id}`}
            prefetch={false}
            aria-label={`Ver detalle de ${product.name}`}
            className="btn w-1/2"
          >
            Ver detalle
          </Link>
          <button
            type="button"
            onClick={handleBuy}
            aria-label={`Agregar ${product.name} al carrito`}
            className="btn btn-primary w-1/2 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
          >
            Comprar
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

