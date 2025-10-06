import { prisma } from "@/lib/db";
import ProductsPageClient from "./_components/products-page-client";
import { Suspense } from "react";

export default async function ProductsPage() {
  const categories = await prisma.category.findMany({
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
