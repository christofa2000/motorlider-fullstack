// src/app/products/[id]/page.tsx
import ProductActions from "@/components/ProductActions";
import SafeNextImage from "@/components/ui/SafeNextImage";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 90;

type PageProps = {
  // ✅ Next 15: params llega como Promise
  params: Promise<{ id: string }>;
};

const cloudinaryFill = (src: string, width: number, height: number) => {
  if (!src.startsWith("https://res.cloudinary.com/")) return src;
  const parts = src.split("/upload/");
  if (parts.length !== 2) return src;
  const base = parts[0];
  const rest = parts[1];
  return `${base}/upload/f_auto,q_auto,c_fill,w_${width},h_${height}/${rest}`;
};

export default async function ProductDetailPage(props: PageProps) {
  // ✅ Desestructurar esperando la Promise
  const { id } = await props.params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      brand: true,
      image: true,
      stock: true,
      categoryId: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) {
    return (
      <main className="container py-10">
        <p className="text-sm muted">Producto no encontrado.</p>
        <Link href="/" className="btn mt-4">
          Volver
        </Link>
      </main>
    );
  }

  const mainImg = cloudinaryFill(product.image, 720, 540);

  const DetailHeader = () => (
    <header className="card card--flat p-3 md:p-4 mb-4 sticky top-0 z-30">
      <div className="container flex items-center gap-3">
        <Link
          href="/"
          prefetch={false}
          className="btn btn-ghost flex items-center gap-2"
          aria-label="Volver al inicio"
          title="Volver al inicio"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          <span className="hidden sm:inline">Volver</span>
        </Link>
        <h1 className="text-lg md:text-xl font-bold ml-1">
          Detalle del producto
        </h1>
      </div>
    </header>
  );

  return (
    <>
      <DetailHeader />
      <main className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Galería */}
          <section
            aria-label="Galería de imágenes del producto"
            className="space-y-3"
          >
            <div className="media aspect-[4/3]">
              <SafeNextImage
                src={mainImg}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                className="object-cover"
                priority
                fallbackSrc="/images/products/placeholder.png"
              />
            </div>
            {/* Miniaturas (placeholder simple por ahora) */}
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-md bg-[var(--color-neutral-2
00)]"
                />
              ))}
            </div>
          </section>

          {/* Lado derecho: precio, CTA, disponibilidad */}
          <section
            aria-label="Información del producto"
            className="flex flex-col gap-4"
          >
            <header className="space-y-2">
              <h1 className="text-2xl font-semibold title">{product.name}</h1>
              {product.brand ? (
                <p className="text-sm muted">Marca: {product.brand}</p>
              ) : null}
            </header>

            <p className="price text-3xl">{formatCurrency(product.price)}</p>

            <div className="flex items-center gap-2">
              <span className="badge badge-ok" aria-live="polite">
                {product.stock <= 0
                  ? "Sin stock"
                  : product.stock <= 10
                  ? "Stock bajo"
                  : "Disponible"}
              </span>
              <span className="text-sm muted">{product.stock} unidades</span>
            </div>

            <ProductActions product={product as any} />

            <hr className="my-4 border-[var(--color-neutral-200)]" />

            {/* Ficha técnica / envío (placeholder) */}
            <section aria-label="Ficha técnica" className="space-y-2">
              <h2 className="text-lg font-semibold title">Ficha técnica</h2>
              <ul className="text-sm list-disc pl-5">
                <li>Categoría: {product.category?.name ?? "-"}</li>
                <li>SKU: {product.id}</li>
              </ul>
            </section>
          </section>
        </div>

        {/* Sticky action bar (mobile) */}
        <ProductActions product={product as any} variant="sticky" />

        {/* Relacionados (placeholder simple) */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold title">
            Productos relacionados
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card h-28" />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
