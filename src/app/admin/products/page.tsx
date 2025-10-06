import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { ensureDefaultCategories } from "@/lib/ensureDefaultCategories";
import ProductsPageClient from "./_components/products-page-client";

const ALLOWED_CATEGORY_SLUGS = ["motor", "suspension", "frenos"] as const;

export default async function ProductsPage() {
  await ensureDefaultCategories();

  const categories = await prisma.category.findMany({
    where: { slug: { in: [...ALLOWED_CATEGORY_SLUGS] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-4 py-10">
      <Suspense fallback={<div className="py-10 text-center text-sm text-gray-500">Loading products...</div>}>
        <ProductsPageClient categories={categories} />
      </Suspense>
    </div>
  );
}
