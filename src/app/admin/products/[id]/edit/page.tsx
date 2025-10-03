import { prisma } from "@/lib/db";
import ProductForm from "../../_components/product-form";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  // Ensure default categories exist
  const existing = await prisma.category.findMany();
  if (existing.length === 0) {
    await prisma.category.createMany({
      data: [
        { name: "Motor", slug: "motor" },
        { name: "Suspensión", slug: "suspension" },
        { name: "Frenos", slug: "frenos" },
      ],
      skipDuplicates: true,
    });
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <a href="/" className="btn">Back to Home</a>
        </div>
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-sm">
            <ProductForm categories={categories} product={product} />
        </div>
      </div>
    </div>
  );
}