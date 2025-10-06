import { prisma } from "@/lib/db";
import ProductsPageClient from "./_components/products-page-client";

const ALLOWED_CATEGORY_SLUGS = ["motor", "suspension", "frenos"] as const;
const DEFAULT_CATEGORIES = [
  { name: "Motor", slug: "motor" },
  { name: "Suspensión", slug: "suspension" },
  { name: "Frenos", slug: "frenos" },
] as const;

export default async function ProductsPage() {
  // Seed idempotente con upsert (compatible con tu versión de Prisma)
  await Promise.all(
    DEFAULT_CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {}, // no cambiamos nada si ya existe
        create: { name: c.name, slug: c.slug },
      })
    )
  );

  // Solo trae categorías permitidas y ordenadas
  const categories = await prisma.category.findMany({
    where: { slug: { in: [...ALLOWED_CATEGORY_SLUGS] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto p-4">
      <ProductsPageClient categories={categories} />
    </div>
  );
}
