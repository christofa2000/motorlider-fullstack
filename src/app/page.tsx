import {
  CategoryBar,
  Footer,
  Navbar,
  ProductCard,
  SearchBar,
} from "../components";
import { categories, categoryBySlug } from "../data/categories";
import { fetchProducts } from "../lib/products";

const normalize = (value: string) => value.trim().toLowerCase();

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
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
  const params = searchParams ?? {};

  const getParamValue = (value: string | string[] | undefined): string =>
    Array.isArray(value) ? value[0] ?? "" : value ?? "";

  const query = getParamValue(params["q"]);
  const categorySlug = getParamValue(params["cat"]);
  const normalizedQuery = normalize(query);
  const selectedCategory = categorySlug
    ? categoryBySlug[categorySlug]
    : undefined;
  const selectedCategoryId = selectedCategory?.id;

  const products = await fetchProducts({
    q: query,
    cat: categorySlug,
    pageSize: 100,
  });

  const hasQuery = normalizedQuery.length > 0;
  const hasCategory = Boolean(selectedCategoryId);
  const headingText = getHeading(query, normalizedQuery, categorySlug);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url(/images/fondo5.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Navbar />
      <div className="bg-[var(--color-primary)] px-4 pb-3 pt-2 md:hidden">
        <SearchBar className="max-w-none" initialValue={query} />
      </div>
      <CategoryBar items={categories} />
      <main className="py-8">
        <section className="container flex flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              {headingText}
            </h1>
            {hasQuery || hasCategory ? (
              <p className="text-sm text-slate-600">
                Encontramos {products.length}{" "}
                {products.length === 1 ? "producto" : "productos"} que
                coinciden con tu búsqueda.
              </p>
            ) : (
              <p className="text-sm text-slate-600">
                Descubrí los repuestos más buscados por nuestros clientes.
              </p>
            )}
          </header>

          {products.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-8 text-center shadow-sm">
              {getEmptyStateDescription(query, selectedCategory?.name)}
              <p className="mt-2 text-sm text-[var(--color-neutral-700)]">
                Revisa la ortografía o probá con otra búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {products.map((product) => (
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

export default HomePage;