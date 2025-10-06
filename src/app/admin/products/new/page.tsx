import { prisma } from "@/lib/db";
import Link from "next/link";
import ProductForm from "../_components/product-form";

export default async function NewProductPage() {
  // ✅ Crear las categorías si no existen, sin usar skipDuplicates
  const DEFAULT_CATEGORIES = [
    { name: "Motor", slug: "motor" },
    { name: "Suspensión", slug: "suspension" },
    { name: "Frenos", slug: "frenos" },
  ];

  // Crea o mantiene existentes
  await Promise.all(
    DEFAULT_CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {}, // no cambia nada si ya existe
        create: { name: c.name, slug: c.slug },
      })
    )
  );

  // Trae todas las categorías ordenadas
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">New Product</h1>
          <Link href="/" className="btn">
            Back to Home
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-sm">
          <ProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
}
