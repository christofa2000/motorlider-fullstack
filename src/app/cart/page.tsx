"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  useCartCount,
  useCartIsHydrated,
  useCartItems,
  useCartStore,
  useCartTotal,
} from "@/store/cart";
import ConfirmDialog from "../../components/ConfirmDialog";
import ProductImage from "../../components/ProductImage";
import { getPriceById, getProductById } from "../../data/products";
import { formatCurrency } from "../../lib/format";
import type { Product } from "../../types";

const quantityOptions = Array.from({ length: 10 }, (_, index) => index + 1);

type CartDisplayItem = {
  product: Product;
  qty: number;
  subtotal: number;
};

type PendingAction =
  | { type: "remove"; productId: string; name: string }
  | { type: "clear" };

const CartPage = () => {
  const storeIsHydrated = useCartIsHydrated();
  const items = useCartItems();
  const count = useCartCount();
  const total = useCartTotal(getPriceById);
  const removeItem = useCartStore((state) => state.remove);
  const setQty = useCartStore((state) => state.setQty);
  const clearCart = useCartStore((state) => state.clear);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isHydrated = isClient && storeIsHydrated;

  const enrichedItems = useMemo<CartDisplayItem[]>(
    () =>
      items
        .map((item) => {
          const product = getProductById(item.productId);

          if (!product) {
            return null;
          }

          return {
            product,
            qty: item.qty,
            subtotal: item.qty * product.price,
          };
        })
        .filter((entry): entry is CartDisplayItem => entry !== null),
    [items]
  );

  const handleRemoveRequest = (product: Product) => {
    setPendingAction({
      type: "remove",
      productId: product.id,
      name: product.name,
    });
    setDialogOpen(true);
  };

  const handleClearRequest = () => {
    setPendingAction({ type: "clear" });
    setDialogOpen(true);
  };

  const handleDialogConfirm = () => {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "remove") {
      removeItem(pendingAction.productId);
    } else {
      clearCart();
    }

    setDialogOpen(false);
    setPendingAction(null);
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setPendingAction(null);
  };

  const dialogTitle =
    pendingAction?.type === "clear" ? "Vaciar carrito" : "Eliminar producto";
  const dialogDescription =
    pendingAction?.type === "clear"
      ? "Esta accion eliminara todos los productos del carrito."
      : pendingAction?.name
      ? `Queres eliminar "${pendingAction.name}" del carrito?`
      : undefined;
  const dialogConfirmLabel =
    pendingAction?.type === "clear" ? "Vaciar" : "Eliminar";

  if (!isHydrated) {
    return (
      <main className="min-h-[60vh] bg-[var(--color-neutral-200)]/30">
        <div className="container pt-20 pb-10 md:pt-24">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-[var(--color-primary)] md:text-3xl">
              Carrito
            </h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-700)]">
              Revisa tus productos antes de finalizar la compra.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-[var(--color-neutral-700)]">
              Cargando carrito...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (count === 0 || enrichedItems.length === 0) {
    return (
      <main className="min-h-[60vh] bg-[var(--color-neutral-200)]/30">
        <div className="container pt-20 pb-10 md:pt-24">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-[var(--color-primary)] md:text-3xl">
              Carrito
            </h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-700)]">
              Revisa tus productos antes de finalizar la compra.
            </p>
          </div>
          <div className="mx-auto max-w-md rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-[var(--color-primary)]">
              Tu carrito esta vacio
            </p>
            <p className="mt-2 text-sm text-[var(--color-neutral-700)]">
              Explora nuestros repuestos y agrega tus favoritos para continuar
              con la compra.
            </p>
            <Link
              href="/"
              className="btn btn-primary mt-4 inline-flex hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-[60vh] bg-[var(--color-neutral-200)]/30">
        <div className="container pt-20 pb-10 md:pt-24">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-[var(--color-primary)] md:text-3xl">
              Carrito
            </h1>
            <p className="mt-1 text-sm text-[var(--color-neutral-700)]">
              Revisa tus productos antes de finalizar la compra.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <section aria-labelledby="cart-items-heading" className="space-y-4">
              <header>
                <h2
                  id="cart-items-heading"
                  className="text-lg font-semibold text-[var(--color-primary)]"
                >
                  Productos ({count})
                </h2>
              </header>

              <div className="space-y-4 md:hidden">
                {enrichedItems.map(({ product, qty, subtotal }) => (
                  <article
                    key={product.id}
                    className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-[var(--color-neutral-200)]">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Link
                          href={`/product/${product.slug}`}
                          className="line-clamp-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-[var(--color-primary)]">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]">
                        Cantidad
                        <select
                          aria-label={`Cantidad para ${product.name}`}
                          className="w-16 rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                          value={qty}
                          onChange={(event) =>
                            setQty(product.id, Number(event.target.value))
                          }
                        >
                          {quantityOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <p className="text-lg font-semibold text-[var(--color-primary)]">
                        {formatCurrency(subtotal)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequest(product)}
                      aria-label={`Eliminar ${product.name}`}
                      className="btn mt-4 bg-[var(--color-neutral-200)] text-[var(--color-primary)] hover:brightness-95"
                    >
                      Eliminar
                    </button>
                  </article>
                ))}
              </div>

              <div className="hidden md:block">
                <table className="w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-sm font-semibold text-[var(--color-primary)]">
                      <th scope="col" className="px-4 py-2">
                        Producto
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Precio unitario
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Cantidad
                      </th>
                      <th scope="col" className="px-4 py-2">
                        Subtotal
                      </th>
                      <th scope="col" className="px-4 py-2 text-right">
                        Accion
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedItems.map(({ product, qty, subtotal }) => (
                      <tr
                        key={product.id}
                        className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <td className="rounded-l-xl px-4 py-3">
                          <div className="flex items-center gap-4">
                            <div className="relative h-[72px] w-[72px] overflow-hidden rounded-lg bg-[var(--color-neutral-200)]">
                              <ProductImage
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="72px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/product/${product.slug}`}
                                className="line-clamp-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
                              >
                                {product.name}
                              </Link>
                              <p className="mt-1 text-sm text-[var(--color-primary)]">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--color-primary)]">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-3">
                          <label
                            className="sr-only"
                            htmlFor={`qty-${product.id}`}
                          >
                            Cantidad para {product.name}
                          </label>
                          <select
                            id={`qty-${product.id}`}
                            aria-label={`Cantidad para ${product.name}`}
                            className="w-16 rounded-md border border-[var(--color-neutral-200)] px-2 py-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            value={qty}
                            onChange={(event) =>
                              setQty(product.id, Number(event.target.value))
                            }
                          >
                            {quantityOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-lg font-semibold text-[var(--color-primary)]">
                          {formatCurrency(subtotal)}
                        </td>
                        <td className="rounded-r-xl px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRequest(product)}
                            aria-label={`Eliminar ${product.name}`}
                            className="btn bg-[var(--color-neutral-200)] text-[var(--color-primary)] hover:brightness-95"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="lg:sticky lg:top-[120px]">
              <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--color-primary)]">
                  Resumen
                </h2>
                <p className="text-sm text-[var(--color-neutral-700)]">
                  Total ({count} {count === 1 ? "item" : "items"})
                </p>
                <p className="text-xl font-bold text-[var(--color-primary)]">
                  {formatCurrency(total)}
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-3 w-full hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
                  onClick={() => {}}
                >
                  Finalizar compra
                </button>
                <button
                  type="button"
                  className="btn mt-2 w-full bg-[var(--color-neutral-200)] text-[var(--color-primary)] hover:brightness-95"
                  onClick={handleClearRequest}
                >
                  Vaciar carrito
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 text-sm text-[var(--color-neutral-700)] shadow-sm">
                <p>
                  Necesitas ayuda? Escribinos y nuestro equipo te acompanara en
                  el proceso de compra.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={dialogOpen}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={dialogConfirmLabel}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </>
  );
};

export default CartPage;
