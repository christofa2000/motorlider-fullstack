import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "../../_components/product-form";

async function EditProductPage({
  params,
}: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = params instanceof Promise ? await params : params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <Link href="/admin/products" className="btn">
            Back to Products
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-sm">
          <ProductForm categories={categories} product={product} />
        </div>
      </div>
    </div>
  );
}

export default EditProductPage as unknown as (props: { params: Promise<{ id: string }> }) => ReturnType<typeof EditProductPage>;

