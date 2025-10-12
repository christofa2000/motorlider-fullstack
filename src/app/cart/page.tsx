"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import ConfirmDialog from "@/components/ConfirmDialog";
import ProductImage from "@/components/ProductImage";
import { getMockProductById } from "@/data";
import { formatCurrency } from "@/lib/format";
import {
  useCartCount,
  useCartIsHydrated,
  useCartItems,
  useCartProducts,
  useCartStore,
  useCartTotal,
} from "@/store/cart";
import type { Product } from "@/types";

const quantityOptions = Array.from({ length: 10 }, (_, index) => index + 1);

type CartDisplayItem = {
  product: Product;
  qty: number;
  subtotal: number;
};

type PendingAction =
  | { type: "remove"; productId: string; name: string }
  | { type: "clear" };

function QtyStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const dec = () => onChange(Math.max(1, value - 1));
  const inc = () => onChange(Math.min(10, value + 1));

  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Disminuir cantidad"
        onClick={dec}
        className="icon-btn"
        title="Disminuir"
      >
        <Minus className="w-4 h-4" aria-hidden="true" />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        pattern="[0-9]*"
        min={1}
        max={10}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(Math.min(10, Math.max(1, n)));
        }}
      />
      <button
        type="button"
        aria-label="Aumentar cantidad"
        onClick={inc}
        className="icon-btn"
        title="Aumentar"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const CartHeader = () => (
  <header className="z-30 bg-[var(--color-neutral-800)] text-[var(--color-contrast)] border-b border-white/10 lg:sticky lg:top-0">
    <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6">
      <h1 className="flex items-center gap-3 py-6 md:py-8 text-2xl font-bold md:text-3xl">
        <ShoppingCart className="h-7 w-7 text-[var(--color-accent)]" aria-hidden />
        <span>Carrito</span>
      </h1>
      <Link
        href="/"
        prefetch={false}
        className="btn btn-secondary w-full md:w-auto"
      >
        Volver al inicio
      </Link>
    </div>
  </header>
);

export default function CartPage() {
  const isHydrated = useCartIsHydrated();
  const items = useCartItems();
  const productsMap = useCartProducts();
  const count = useCartCount();
  const total = useCartTotal();
  const removeItem = useCartStore((state) => state.remove);
  const setQty = useCartStore((state) => state.setQty);
  const clearCart = useCartStore((state) => state.clear);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );

  const enrichedItems = useMemo<CartDisplayItem[]>(
    () =>
      items
        .map((item) => {
          const product =
            productsMap[item.productId] ?? getMockProductById(item.productId);
          if (!product) return null;
          return {
            product,
            qty: item.qty,
            subtotal: item.qty * product.price,
          };
        })
        .filter((e): e is CartDisplayItem => e !== null),
    [items, productsMap]
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
    if (!pendingAction) return;
    if (pendingAction.type === "remove") removeItem(pendingAction.productId);
    else clearCart();
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
      ? "Esta acciÃƒÂ³n eliminarÃƒÂ¡ todos los productos del carrito."
      : pendingAction?.name
      ? `Ã‚Â¿QuerÃƒÂ©s eliminar Ã¢â‚¬Å“${pendingAction.name}Ã¢â‚¬Â del carrito?`
      : undefined;
  const dialogConfirmLabel =
    pendingAction?.type === "clear" ? "Vaciar" : "Eliminar";

  const cartDescription = "RevisÃƒÂ¡ tus productos antes de finalizar la compra.";

  // Skeleton / Empty state usan el tema oscuro
  if (!isHydrated) {
    return (
      <>
        <CartHeader />
        <main className="min-h-[60vh]">
          <div className="container pt-12 pb-10 md:pt-16 px-6">
            <p className="muted mb-4">{cartDescription}</p>
            <div className="card p-8 text-center">
              <p className="muted">Cargando carritoÃ¢â‚¬Â¦</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (count === 0 || enrichedItems.length === 0) {
    return (
      <>
        <CartHeader />
        <main className="min-h-[60vh]">
          <div className="container pt-12 pb-10 md:pt-16 px-6">
            <p className="muted mb-4">{cartDescription}</p>
            <div className="card empty">
              <ShoppingCart
                className="w-10 h-10 mx-auto text-[var(--brand-warm)]"
                aria-hidden
              />
              <div className="title">Tu carrito estÃƒÂ¡ vacÃƒÂ­o</div>
              <p className="mt-2">
                ExplorÃƒÂ¡ nuestras categorÃƒÂ­as y encontrÃƒÂ¡ lo que necesitÃƒÂ¡s.
              </p>
              <Link
                href="/"
                prefetch={false}
                className="btn btn-secondary mt-4 inline-flex"
              >
                Ver productos
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <CartHeader />
      <main className="min-h-[60vh]">
        <div className="container pt-10 pb-12 md:pt-14 px-6">
          <p className="muted mb-6">{cartDescription}</p>

          <div className="card card--flat p-6 lg:p-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* ====== LISTA (Mobile: cards / Desktop: tabla) ====== */}
            <section aria-labelledby="cart-items-heading" className="space-y-4">
              <header>
                <h2 id="cart-items-heading" className="text-lg font-bold">
                  Productos ({count})
                </h2>
              </header>

              {/* Mobile cards */}
              <div className="space-y-4 md:hidden">
                {enrichedItems.map(({ product, qty, subtotal }) => (
                  <article key={product.id} className="card card--flat p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="media"
                        style={{ width: 80, aspectRatio: "4 / 3" }}
                      >
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          width={80}
                          height={60}
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Link
                          href={`/products/${product.id}`}
                          prefetch={false}
                          className="title text-sm"
                        >
                          {product.name}
                        </Link>
                        <p className="muted text-sm">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <label
                          className="sr-only"
                          htmlFor={`qty-m-${product.id}`}
                        >
                          Cantidad para {product.name}
                        </label>
                        <QtyStepper
                          value={qty}
                          onChange={(v) => setQty(product.id, v)}
                          label={`Cantidad para ${product.name}`}
                        />
                      </div>
                      <p className="text-lg font-extrabold">
                        {formatCurrency(subtotal)}
                      </p>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveRequest(product)}
                        aria-label={`Eliminar ${product.name}`}
                        className="icon-btn"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="cell-right">Precio unitario</th>
                      <th className="cell-center">Cantidad</th>
                      <th className="cell-right">Subtotal</th>
                      <th className="cell-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedItems.map(({ product, qty, subtotal }) => (
                      <tr key={product.id}>
                        <td>
                          <div className="flex items-center gap-4">
                            <div
                              className="media"
                              style={{ width: 72, aspectRatio: "4 / 3" }}
                            >
                              <ProductImage
                                src={product.image}
                                alt={product.name}
                                width={72}
                                height={54}
                                sizes="72px"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/products/${product.id}`}
                                prefetch={false}
                                className="title text-sm"
                              >
                                {product.name}
                              </Link>
                              <p className="muted text-sm">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="cell-right nowrap">
                          {formatCurrency(product.price)}
                        </td>

                        <td className="cell-center">
                          <div className="flex items-center justify-center gap-3">
                            <QtyStepper
                              value={qty}
                              onChange={(v) => setQty(product.id, v)}
                              label={`Cantidad para ${product.name}`}
                            />
                          </div>
                        </td>

                        <td className="cell-right nowrap text-base font-extrabold">
                          {formatCurrency(subtotal)}
                        </td>

                        <td className="cell-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRequest(product)}
                            aria-label={`Eliminar ${product.name}`}
                            className="icon-btn"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ====== RESUMEN ====== */}
            <aside className="lg:sticky lg:top-[96px]">
              <div className="card card--flat p-5 lg:p-6">
                <h2 className="text-lg font-bold">Resumen</h2>
                <p className="muted">
                  Total ({count} {count === 1 ? "item" : "items"})
                </p>
                <p className="text-2xl font-extrabold mt-1">
                  {formatCurrency(total)}
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-4 w-full"
                  onClick={() => {}}
                >
                  Finalizar compra
                </button>
                <Link href="/" prefetch={false} className="btn btn-secondary mt-2 w-full">
                  Seguir comprando
                </Link>
                <button type="button" className="btn mt-2 w-full" onClick={handleClearRequest}>
                  Vaciar carrito
                </button>
              </div>

              <div className="card card--flat p-5 mt-4">
                <p className="muted text-sm">
                  Ã‚Â¿NecesitÃƒÂ¡s ayuda? Escribinos y nuestro equipo te acompaÃƒÂ±a en
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
}
