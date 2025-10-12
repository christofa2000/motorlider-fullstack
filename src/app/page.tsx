export const revalidate = 60;

import type { Product } from "@/types";
import { headers } from "next/headers";
import { CategoryBar, Footer, Navbar, ProductCard, SearchBar } from "../components";
import { categories, categoryBySlug } from "../data/categories";
import { mockProducts } from "../data/products";

type ApiProduct = Product & {
  category?: {
    id: string;
    name: string;
    slug: string;
  };
};

const fallbackProducts: ApiProduct[] = mockProducts.map((product) => {
  const category = categories.find((item) => item.id === product.categoryId);

  return {
    ...product,
    category: category ?? {
      id: product.categoryId,
      name: "Sin categoria",
      slug: "sin-categoria",
    },
  };
});

const normalize = (value: string) => value.trim().toLowerCase();

type HomePageProps = {
  searchParams?:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
};

const getHeading = (
  query: string,
  normalizedQuery: string,
  categorySlug: string
) => {
  const selectedCategory = categorySlug
    ? categoryBySlug[categorySlug]
    : undefined;
  const hasQuery = normalizedQuery.length > 0;
  const hasCategory = Boolean(selectedCategory);

  if (hasQuery && hasCategory && selectedCategory) {
    return (
      <>
        Resultados para <span className="font-medium">&quot;{query}&quot;</span>{" "}
        en {selectedCategory.name}
      </>
    );
  }

  if (hasQuery) {
    return (
      <>
        Resultados para <span className="font-medium">&quot;{query}&quot;</span>
      </>
    );
  }

  if (hasCategory && selectedCategory) {
    return `Repuestos de ${selectedCategory.name}`;
  }

  return "Repuestos destacados";
};

const getEmptyStateDescription = (
  query: string,
  selectedCategoryName?: string
) => (
  <p className="text-lg font-semibold text-[var(--color-primary)]">
    No encontramos resultados para{" "}
    <span className="font-medium">&quot;{query}&quot;</span>
    {selectedCategoryName ? (
      <span> en {selectedCategoryName.toLowerCase()}.</span>
    ) : (
      "."
    )}
  </p>
);

const HomePage = async ({ searchParams }: HomePageProps) => {
  const resolvedSearchParams =
    searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const params = resolvedSearchParams;

  const getParamValue = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] ?? "" : value ?? "";

  const query = getParamValue(params["q"]);
  const categorySlug = getParamValue(params["cat"]); // ← usamos SLUG desde la URL
  const normalizedQuery = normalize(query);
  const selectedCategory = categorySlug
    ? categoryBySlug[categorySlug]
    : undefined;

  const searchQuery = new URLSearchParams({ pageSize: "100" });
  if (query) searchQuery.set("q", query);
  if (categorySlug) searchQuery.set("cat", categorySlug); // ← enviamos SLUG a la API

  let products: ApiProduct[] = [];
  try {
    let base = process.env.NEXT_PUBLIC_SITE_URL;
    if (!base) {
      const h = await (headers() as unknown as Promise<Headers>);
      const host = h.get("x-forwarded-host") ?? h.get("host");
      const proto = h.get("x-forwarded-proto") ?? "http";
      base = host ? `${proto}://${host}` : "http://localhost:3000";
    }

    const res = await fetch(`${base}/api/products?${searchQuery.toString()}`, {
      cache: "force-cache",
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const payload = (await res.json()) as {
        ok: boolean;
        data?: { items: ApiProduct[] };
      };
      if (payload.ok && payload.data?.items) {
        products = payload.data.items;
      }
    }
  } catch (error) {
    console.error("[HOME_FETCH_PRODUCTS]", error);
  }

  // Fallback a mock sólo si no hay nada desde la API
  if (products.length === 0) {
    const normalizedBrand = (value: string | undefined | null) =>
      value?.toLowerCase() ?? "";

    const selectedCategoryId = categorySlug
      ? categoryBySlug[categorySlug]?.id
      : undefined;

    products = fallbackProducts.filter((product) => {
      const matchesCategory = selectedCategoryId
        ? product.categoryId === selectedCategoryId
        : true;
      const matchesQuery =
        normalizedQuery.length > 0
          ? product.name.toLowerCase().includes(normalizedQuery) ||
            normalizedBrand(product.brand).includes(normalizedQuery)
          : true;

      return matchesCategory && matchesQuery;
    });
  }

  const hasQuery = normalizedQuery.length > 0;
  const headingText = getHeading(query, normalizedQuery, categorySlug);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-[var(--color-primary)] px-4 pb-3 pt-2 md:hidden">
        <SearchBar className="max-w-none" initialValue={query} />
      </div>
      <CategoryBar items={categories} />
      <main className="py-8">
        <section className="container flex flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-[var(--color-contrast)]">
              {headingText}
            </h1>
            {hasQuery || categorySlug ? (
              <p className="text-sm text-[var(--color-neutral-300)]">
                Encontramos {products.length}{" "}
                {products.length === 1 ? "producto" : "productos"} que coinciden
                con tu busqueda.
              </p>
            ) : (
              <p className="text-sm text-[var(--color-neutral-300)]">
                Descubri los repuestos mas buscados por nuestros clientes.
              </p>
            )}
          </header>

          {products.length === 0 ? (
            <div className="card card--flat p-8 text-center">
              {getEmptyStateDescription(query, selectedCategory?.name)}
              <p className="mt-2 text-sm text-[var(--color-neutral-300)]">
                Revisa la ortografia o proba con otra busqueda.
              </p>
            </div>
          ) : (
            <div className="grid-products">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index === 0}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage as unknown as (props: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) => ReturnType<typeof HomePage>;
