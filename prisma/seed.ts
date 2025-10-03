import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

type CategorySeed = {
  name: string;
  slug: string;
};

type ProductSeed = {
  name: string;
  slug: string;
  brand?: string;
  price: number;
  image: string;
  stock: number;
  categorySlug: CategorySeed["slug"];
};

const categories: CategorySeed[] = [
  { name: "Motor", slug: "motor" },
  { name: "Suspension", slug: "suspension" },
  { name: "Frenos", slug: "frenos" },
];

const products: ProductSeed[] = [
  {
    name: "Filtro de aceite sintetico",
    slug: "filtro-aceite-sintetico",
    brand: "Bosch",
    price: 15999,
    image: "/images/products/filtro-aceite-sintetico.jpg",
    stock: 40,
    categorySlug: "motor",
  },
  {
    name: "Kit distribucion completo",
    slug: "kit-distribucion-completo",
    brand: "Gates",
    price: 75999,
    image: "/images/products/kit-distribucion-completo.jpg",
    stock: 15,
    categorySlug: "motor",
  },
  {
    name: "Bomba de agua reforzada",
    slug: "bomba-agua-reforzada",
    brand: "SKF",
    price: 48999,
    image: "/images/products/bomba-agua-reforzada.jpg",
    stock: 12,
    categorySlug: "motor",
  },
  {
    name: "Bujias iridio premium",
    slug: "bujias-iridio-premium",
    brand: "NGK",
    price: 32999,
    image: "/images/products/bujias-iridio-premium.jpg",
    stock: 60,
    categorySlug: "motor",
  },
  {
    name: "Amortiguador delantero gas",
    slug: "amortiguador-delantero-gas",
    brand: "Monroe",
    price: 62999,
    image: "/images/products/amortiguador-delantero-gas.jpg",
    stock: 20,
    categorySlug: "suspension",
  },
  {
    name: "Amortiguador trasero heavy duty",
    slug: "amortiguador-trasero-heavy-duty",
    brand: "KYB",
    price: 58999,
    image: "/images/products/amortiguador-trasero-heavy-duty.jpg",
    stock: 18,
    categorySlug: "suspension",
  },
  {
    name: "Barra estabilizadora reforzada",
    slug: "barra-estabilizadora-reforzada",
    brand: "Moog",
    price: 41999,
    image: "/images/products/barra-estabilizadora-reforzada.jpg",
    stock: 10,
    categorySlug: "suspension",
  },
  {
    name: "Kit bujes suspension poliuretano",
    slug: "kit-bujes-suspension-poliuretano",
    brand: "Lemforder",
    price: 25999,
    image: "/images/products/kit-bujes-suspension-poliuretano.jpg",
    stock: 25,
    categorySlug: "suspension",
  },
  {
    name: "Pastillas freno ceramicas",
    slug: "pastillas-freno-ceramicas",
    brand: "Brembo",
    price: 36999,
    image: "/images/products/pastillas-freno-ceramicas.jpg",
    stock: 50,
    categorySlug: "frenos",
  },
  {
    name: "Discos freno ventilados",
    slug: "discos-freno-ventilados",
    brand: "TRW",
    price: 55999,
    image: "/images/products/discos-freno-ventilados.jpg",
    stock: 35,
    categorySlug: "frenos",
  },
  {
    name: "Kit frenos ABS completo",
    slug: "kit-frenos-abs-completo",
    brand: "Bosch",
    price: 129999,
    image: "/images/products/kit-frenos-abs-completo.jpg",
    stock: 5,
    categorySlug: "frenos",
  },
  {
    name: "Liquido frenos dot4",
    slug: "liquido-frenos-dot4",
    brand: "Motul",
    price: 6999,
    image: "/images/products/liquido-frenos-dot4.jpg",
    stock: 120,
    categorySlug: "frenos",
  },
];

const log = (message: string) => console.info(`[seed] ${message}`);

async function main(): Promise<void> {
  log("Starting database seed");

  log("Upserting categories");
  const categoryRecords = await Promise.all(
    categories.map(async (category) => {
      const record = await prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
      });
      log(`Category ready: ${record.slug}`);
      return record;
    })
  );

  const categoryBySlug = new Map(
    categoryRecords.map((category) => [category.slug, category.id] as const)
  );

  log("Upserting products");
  for (const product of products) {
    const categoryId = categoryBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category with slug ${product.categorySlug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        brand: product.brand ?? null,
        price: product.price,
        image: product.image,
        stock: product.stock,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        brand: product.brand ?? null,
        price: product.price,
        image: product.image,
        stock: product.stock,
        categoryId,
      },
    });
    log(`Product ready: ${product.slug}`);
  }

  log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error("[seed] Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
