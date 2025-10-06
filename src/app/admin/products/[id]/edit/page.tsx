import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "../../_components/product-form";

interface EditProductPageProps {
  params: { id: string };
}

const ALLOWED_CATEGORY_SLUGS = ["motor", "suspension", "frenos"] as const;
const DEFAULT_CATEGORIES = [
  { name: "Motor", slug: "motor" },
  { name: "Suspensión", slug: "suspension" },
  { name: "Frenos", slug: "frenos" },
] as const;

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  // ✅ Seed idempotente sin skipDuplicates (compatible con tu versión de Prisma)
  await Promise.all(
    DEFAULT_CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: { name: c.name, slug: c.slug },
      })
    )
  );

  // Trae solo categorías permitidas (ordenadas)
  const categories = await prisma.category.findMany({
    where: { slug: { in: [...ALLOWED_CATEGORY_SLUGS] } },
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
