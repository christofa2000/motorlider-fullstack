// src/app/products/[id]/edit/page.tsx
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const runtime = "nodejs"; // usando Prisma en Server Component

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, slug: true },
  });

  if (!product) {
    return { title: "Producto no encontrado | Motorlider" };
  }

  return {
    title: `${product.name} | Motorlider`,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      brand: true,
      price: true, // en centavos
      image: true,
      stock: true,
      category: { select: { id: true, name: true, slug: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="w-72 h-72 object-cover rounded-xl border"
        />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          {product.brand && (
            <p className="text-sm text-gray-500">Marca: {product.brand}</p>
          )}
          <p className="text-lg">
            Precio:{" "}
            {(product.price / 100).toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
          </p>
          <p className="text-sm text-gray-500">
            Categoría: {product.category?.name ?? "—"}
          </p>
          <p className="text-sm">Stock: {product.stock}</p>
        </div>
      </div>
    </main>
  );
}
