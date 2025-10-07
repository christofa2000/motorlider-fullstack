// scripts/seed-from-mock.ts
import { PrismaClient } from "@prisma/client";
// Si los alias "@/" no funcionan fuera de src, CAMBIAR estas importaciones a rutas relativas:
//   import { mockProducts } from "../src/data/products";
//   import { categories as uiCategories } from "../src/data/categories";
import { mockProducts } from "@/data/products";
import { categories as uiCategories } from "@/data/categories";

const prisma = new PrismaClient();

function toSlug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

async function main() {
  // 1) Asegurar categorías por slug (idempotente)
  const defaultCats = [
    { name: "Motor", slug: "motor" },
    { name: "Suspensión", slug: "suspension" },
    { name: "Frenos", slug: "frenos" },
  ];

  for (const c of defaultCats) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
  }

  // 2) Mapa id->slug desde las categorías del front
  const idToSlug = new Map<string, string>();
  for (const c of uiCategories) {
    idToSlug.set(c.id, c.slug);
  }

  // 3) Upsert de productos mock
  for (const p of mockProducts) {
    const slug = p.slug ? toSlug(p.slug) : toSlug(p.name);
    const image =
      (p as any).image && String((p as any).image).trim().length > 0
        ? String((p as any).image).trim()
        : "/images/prueba.jpeg";

    // Determinar el categoryId REAL en base al slug mapeado
    let categoryId: string | undefined = undefined;
    const catSlug = idToSlug.get(p.categoryId); // p.categoryId es el ID usado en el front
    if (catSlug) {
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (cat) categoryId = cat.id;
    }

    await prisma.product.upsert({
      where: { slug },
      update: {
        name: p.name,
        brand: p.brand ?? null,
        price: p.price, // ya está en centavos
        stock: p.stock ?? 0,
        image,
        ...(categoryId ? { categoryId } : {}),
      },
      create: {
        name: p.name,
        slug,
        brand: p.brand ?? null,
        price: p.price,
        stock: p.stock ?? 0,
        image,
        ...(categoryId ? { categoryId } : {}),
      },
    });
  }

  console.log("✅ Seed desde mock completado.");
}

main()
  .catch((e) => {
    console.error("❌ Seed falló:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
