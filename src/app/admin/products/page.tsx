import { db } from "@/lib/db";
import ProductsPageClient from "./_components/products-page-client";

export default async function ProductsPage() {
  // Ensure default categories exist
  const existing = await db.category.findMany();
  if (existing.length === 0) {
    await db.category.createMany({
      data: [
        { name: "Motor", slug: "motor" },
        { name: "Suspensión", slug: "suspension" },
        { name: "Frenos", slug: "frenos" },
      ],
      skipDuplicates: true,
    });
  }

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container mx-auto p-4">
      <ProductsPageClient categories={categories} />
    </div>
  );
}