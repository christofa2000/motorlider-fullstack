"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import {
  CategoryBar,
  Footer,
  Navbar,
  ProductCard,
  SearchBar,
} from "../components";
import {
  categories,
  categoryBySlug,
} from "../data/categories";
import { products } from "../data/products";

const normalize = (value: string) => value.trim().toLowerCase();

const HomePageContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const categorySlug = searchParams.get("cat") ?? "";
  const selectedCategory = categorySlug ? categoryBySlug[categorySlug] : undefined;
  const selectedCategoryId = selectedCategory?.id;

  const normalizedQuery = normalize(query);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategoryId) {
      result = result.filter((product) => product.categoryId === selectedCategoryId);
    }

    if (!normalizedQuery) {
      return result;
    }

    return result.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(normalizedQuery);
      const brandMatch = product.brand?.toLowerCase().includes(normalizedQuery) ?? false;
      return nameMatch || brandMatch;
    });
  }, [normalizedQuery, selectedCategoryId]);

  const hasQuery = normalizedQuery.length > 0;
  const hasCategory = Boolean(selectedCategoryId);

  const headingText = (() => {
    if (hasQuery && hasCategory && selectedCategory) {
      return (
        <>
          Resultados para <span className="font-medium">&quot;{query}&quot;</span> en {selectedCategory.name}
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
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="bg-[var(--color-primary)] px-4 pb-3 pt-2 md:hidden">
        <SearchBar className="max-w-none" initialValue={query} />
      </div>
      <CategoryBar items={categories} />
      <main className="py-8">
        <section className="container flex flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">{headingText}</h1>
            {hasQuery || hasCategory ? (
              <p className="text-sm text-slate-600">
                Encontramos {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"} que coinciden con tu búsqueda.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Descubrí los repuestos más buscados por nuestros clientes.
              </p>
            )}
          </header>

          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-[var(--color-primary)]">
                No encontramos resultados para <span className="font-medium">&quot;{query}&quot;</span>
                {hasCategory && selectedCategory ? (
                  <span>
                    {" "}en {selectedCategory.name.toLowerCase()}.
                  </span>
                ) : (
                  "."
                )}
              </p>
              <p className="mt-2 text-sm text-[var(--color-neutral-700)]">
                Revisa la ortografía o probá con otra búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

const HomePage = () => (
  <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
    <HomePageContent />
  </Suspense>
);

export default HomePage;
