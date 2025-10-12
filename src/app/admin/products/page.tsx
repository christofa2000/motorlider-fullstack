// app/admin/products/page.tsx (o la ruta equivalente)
import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
import ProductsPageClient from "./_components/products-page-client";

export default async function ProductsPage() {
  // Evita cache en Admin (siempre datos frescos)
  noStore();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
  });

  return (
    <section className="container px-6 py-8 lg:py-10">
      {/* Topbar opcional (si no lo maneja el layout de Admin) */}
      {/* <header className="card card--flat p-3 md:p-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Productos</h1>
          <div className="flex items-center gap-2">
            <input className="input w-64" placeholder="Buscar productos…" aria-label="Buscar productos" />
            <Link href="/admin/products/new" prefetch={false} className="btn btn-primary">Nuevo producto</Link>
          </div>
        </div>
      </header> */}

      <Suspense
        fallback={
          <div className="card card--flat p-8 text-center">
            <p className="muted">Cargando productos…</p>
          </div>
        }
      >
        <div className="card p-6 lg:p-10">
          <ProductsPageClient categories={categories} />
        </div>
      </Suspense>
    </section>
  );
}
