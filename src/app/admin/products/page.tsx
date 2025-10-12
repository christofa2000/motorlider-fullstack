// app/admin/products/page.tsx
import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { Suspense } from "react";
import ProductsPageClient from "./_components/products-page-client";

export const runtime = "nodejs"; // Prisma requiere Node.js (no Edge)
// export const dynamic = "force-dynamic"; // Alternativa a noStore(): descomenta si preferís

export default async function ProductsPage() {
  // Evita cache en Admin (siempre datos frescos)
  noStore();

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return (
      <section className="container px-6 py-8 lg:py-10">
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
  } catch (err) {
    console.error("[ADMIN_PRODUCTS_PAGE]", err);
    return (
      <section className="container px-6 py-8 lg:py-10">
        <div className="card p-6 lg:p-10">
          <p className="text-sm text-red-600">
            Ocurrió un error al cargar las categorías. Intenta nuevamente.
          </p>
        </div>
      </section>
    );
  }
}
