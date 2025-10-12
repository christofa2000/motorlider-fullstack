jest.mock("next/server", () => ({
  NextResponse: {
    json: (payload: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => payload,
    }),
  },
  NextRequest: class {},
}));

import { prisma } from "@/lib/db";
import type { Product } from "@/types";
import { cleanupTestData, createTestCategory } from "../helpers/seed";

type MockRequest = {
  json: () => Promise<unknown>;
  cookies: {
    get: (name: string) => { value: string } | undefined;
  };
};

const createRequest = (body?: unknown): MockRequest => ({
  json: async () => body,
  cookies: {
    get: (name: string) =>
      name === "admin_token" && process.env.ADMIN_TOKEN
        ? { value: process.env.ADMIN_TOKEN }
        : undefined,
  },
});

beforeAll(async () => {
  // Configurar token de admin para tests
  process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "test-admin-token";

  // Limpieza inicial usando helper
  await cleanupTestData();
});

afterAll(async () => {
  await prisma.$disconnect();
});

let motorCategoryId: string;
let frenosCategoryId: string;

beforeEach(async () => {
  // Limpiar datos de tests anteriores usando helper
  await cleanupTestData();

  // Crear categorías de test usando helper
  const motor = await createTestCategory({ name: "Motor", slug: "motor" });
  const frenos = await createTestCategory({ name: "Frenos", slug: "frenos" });

  motorCategoryId = motor.id;
  frenosCategoryId = frenos.id;
});

describe("/api/products", () => {
  it("creates a product", async () => {
    const { POST } = await import("@/app/api/products/route");

    const response = await POST(
      createRequest({
        name: "Producto de prueba",
        slug: "producto-prueba",
        brand: "Test",
        price: 1299900,
        image: "https://example.com/test.jpg",
        stock: 5,
        categoryId: motorCategoryId,
      }) as any
    );

    const payload = (await response.json()) as { ok: boolean; data: Product };
    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(payload.data.slug).toBe("producto-prueba");

    const stored = await prisma.product.findUnique({
      where: { slug: "producto-prueba" },
    });
    expect(stored).not.toBeNull();
    expect(stored?.price).toBe(1299900);
  });

  it("returns 409 when slug already exists", async () => {
    await prisma.product.create({
      data: {
        name: "Duplicado",
        slug: "duplicado",
        price: 1000,
        image: "https://example.com/test.jpg",
        stock: 1,
        categoryId: motorCategoryId,
      },
    });

    const { POST } = await import("@/app/api/products/route");

    const response = await POST(
      createRequest({
        name: "Duplicado",
        slug: "duplicado",
        price: 2000,
        image: "https://example.com/test.jpg",
        stock: 2,
        categoryId: motorCategoryId,
      }) as any
    );

    const errorPayload = await response.json();
    expect(response.status).toBe(409);
    expect(errorPayload.ok).toBe(false);
  });

  it("updates a product", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Producto",
        slug: "producto",
        price: 1000,
        image: "https://example.com/test.jpg",
        stock: 1,
        categoryId: motorCategoryId,
      },
    });

    const { PATCH } = await import("@/app/api/products/[id]/route");

    const response = await PATCH(
      createRequest({ price: 2500, stock: 4 }) as any,
      { params: { id: product.id } }
    );
    expect(response.status).toBe(200);

    const updated = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(updated?.price).toBe(2500);
    expect(updated?.stock).toBe(4);
  });

  it("deletes a product", async () => {
    const product = await prisma.product.create({
      data: {
        name: "Eliminar",
        slug: "eliminar",
        price: 1000,
        image: "https://example.com/test.jpg",
        stock: 1,
        categoryId: motorCategoryId,
      },
    });

    const { DELETE } = await import("@/app/api/products/[id]/route");

    const response = await DELETE(createRequest() as any, {
      params: { id: product.id },
    });
    expect(response.status).toBe(200);

    const exists = await prisma.product.findUnique({
      where: { id: product.id },
    });
    expect(exists).toBeNull();
  });
});
