// scripts/seed-from-mock.ts
import { PrismaClient } from "@prisma/client";

// ⛔️ Si el alias "@/..." no te funciona fuera de src/, cambiá a rutas relativas:
// import { mockProducts } from "../src/data/products";
// import { categories as uiCategories } from "../src/data/categories";
import { categories as uiCategories } from "@/data/categories";
import { mockProducts } from "@/data/products";

const prisma = new PrismaClient();

function toSlug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function main() {
  // 1) Asegurar categorías base + una "Otros" para fallback
  const baseCats = [
    { name: "Motor", slug: "motor" },
    { name: "Suspensión", slug: "suspension" },
    { name: "Frenos", slug: "frenos" },
    { name: "Otros", slug: "otros" }, // fallback para productos sin mapeo
  ];

  await Promise.all(
    baseCats.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { name: c.name, slug: c.slug },
      })
    )
  );

  // 2) Crear un mapa slug->id de categorías reales en DB
  const dbCats = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const slugToId = new Map<string, string>(dbCats.map((c) => [c.slug, c.id]));

  // 3) Mapa id(front) -> slug(front) (de tus categorías del UI)
  const idToSlugFront = new Map<string, string>();
  for (const c of uiCategories) {
    idToSlugFront.set(c.id, c.slug);
  }

  const fallbackCatId = slugToId.get("otros")!; // siempre debería existir

  // 4) Upsert de productos mock
  for (const p of mockProducts) {
    const slug = p.slug ? toSlug(p.slug) : toSlug(p.name);
    const image =
      (p as any).image && String((p as any).image).trim().length > 0
        ? String((p as any).image).trim()
        : "/images/prueba.jpeg";

    // Mapeo: id(front) -> slug(front) -> id(DB)
    const frontSlug = idToSlugFront.get(p.categoryId);
    const categoryId = (frontSlug && slugToId.get(frontSlug)) || fallbackCatId;

    await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        brand: p.brand ?? null,
        price: p.price, // ya en centavos
        stock: p.stock ?? 0,
        image,
        // ❗️ relación requerida: siempre conectamos a alguna categoría
        category: { connect: { id: categoryId } },
      },
      create: {
        slug,
        name: p.name,
        brand: p.brand ?? null,
        price: p.price,
        stock: p.stock ?? 0,
        image,
        category: { connect: { id: categoryId } },
      },
    });
  }

  console.log("✅ Seed desde mock completado sin disconnect.");
}

main()
  .catch((e) => {
    console.error("❌ Seed falló:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
