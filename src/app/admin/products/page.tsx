import { db } from "@/lib/db";
import { ProductsPageClient } from "./_components/products-page-client";

export default async function ProductsPage() {
  const categories = await db.category.findMany();

  return <ProductsPageClient categories={categories} />;
}