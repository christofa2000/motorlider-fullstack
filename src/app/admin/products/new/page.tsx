import { prisma } from "@/lib/db";
import { ensureDefaultCategories } from "@/lib/ensureDefaultCategories";
import Link from "next/link";
import ProductForm from "../_components/product-form";

const ALLOWED_CATEGORY_SLUGS = ["motor", "suspension", "frenos"] as const;

export default async function NewProductPage() {
  await ensureDefaultCategories();

  const categories = await prisma.category.findMany({
    where: { slug: { in: [...ALLOWED_CATEGORY_SLUGS] } },
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
