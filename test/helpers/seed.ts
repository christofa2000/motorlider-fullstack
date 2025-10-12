import { prisma } from "@/lib/db";

/**
 * Helper para crear datos básicos de test
 * Útil cuando los tests necesitan categorías y productos específicos
 */
export async function seedBasic() {
  // Crear categoría de motor
  const motorCategory = await prisma.category.upsert({
    where: { slug: "motor" },
    create: {
      name: "Motor",
      slug: "motor",
    },
    update: {},
  });

  // Crear categoría de frenos
  const frenosCategory = await prisma.category.upsert({
    where: { slug: "frenos" },
    create: {
      name: "Frenos",
      slug: "frenos",
    },
    update: {},
  });

  // Crear producto de ejemplo
  const testProduct = await prisma.product.upsert({
    where: { slug: "filtro-de-aceite-test" },
    create: {
      name: "Filtro de aceite",
      slug: "filtro-de-aceite-test",
      brand: "ACME",
      price: 1000, // en centavos
      stock: 5,
      categoryId: motorCategory.id,
      image: "/images/products/placeholder.png",
    },
    update: {},
  });

  return {
    motorCategory,
    frenosCategory,
    testProduct,
  };
}

/**
 * Helper para limpiar todos los datos de test
 * Útil en beforeEach/afterEach
 */
export async function cleanupTestData() {
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
}

/**
 * Helper para crear un producto de test específico
 */
export async function createTestProduct(
  overrides: Partial<{
    name: string;
    slug: string;
    brand: string;
    price: number;
    stock: number;
    categoryId: string;
    image: string;
  }> = {}
) {
  const defaults = {
    name: "Producto de test",
    slug: "producto-test",
    brand: "Test Brand",
    price: 1000,
    stock: 1,
    categoryId: "",
    image: "/images/products/placeholder.png",
  };

  const productData = { ...defaults, ...overrides };

  return await prisma.product.create({
    data: productData,
  });
}

/**
 * Helper para crear una categoría de test específica
 */
export async function createTestCategory(
  overrides: Partial<{
    name: string;
    slug: string;
  }> = {}
) {
  const defaults = {
    name: "Categoría de test",
    slug: "categoria-test",
  };

  const categoryData = { ...defaults, ...overrides };

  return await prisma.category.create({
    data: categoryData,
  });
}
