import { db } from "@/lib/db";
import { ProductForm } from "../../_components/product-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id: params.id } }),
    db.category.findMany(),
  ]);

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <div className="bg-white border border-[var(--color-neutral-200)] rounded-xl p-5 shadow-sm">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}