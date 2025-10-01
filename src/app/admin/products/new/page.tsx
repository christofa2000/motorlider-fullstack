import { db } from "@/lib/db";
import { ProductForm } from "../_components/product-form";

export default async function NewProductPage() {
  const categories = await db.category.findMany();

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">New Product</h1>
      <div className="bg-white border border-[var(--color-neutral-200)] rounded-xl p-5 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}