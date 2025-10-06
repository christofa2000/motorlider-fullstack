import { prisma } from "@/lib/db";

const DEFAULT_CATEGORIES = [
  { name: "Motor", slug: "motor" },
  { name: "Suspension", slug: "suspension" },
  { name: "Frenos", slug: "frenos" },
] as const;

export async function ensureDefaultCategories() {
  await Promise.all(
    DEFAULT_CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: { name: c.name, slug: c.slug },
      })
    )
  );
}

