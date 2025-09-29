"use client";
import React from "react";
import Link from "next/link";

export default function CartPage() {
  return (
    <main className="min-h-[60vh] bg-[var(--color-neutral-200)]/30">
      <div className="container pt-20 md:pt-24 pb-10">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-primary)]">
            Carrito
          </h1>
          <p className="text-sm text-[var(--color-neutral-700)] mt-1">
            Revisá tus productos antes de finalizar la compra.
          </p>
        </div>
        <div className="mx-auto max-w-md text-center bg-white border border-[var(--color-neutral-200)] rounded-xl p-8 shadow-sm">
          <p className="text-[var(--color-neutral-700)]">
            (Contenido del carrito aquí)
          </p>
          <Link href="/" className="btn btn-primary mt-4 inline-flex">
            Ver productos
          </Link>
        </div>
      </div>
    </main>
  );
}
