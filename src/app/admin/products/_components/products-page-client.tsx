"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/format";
import { Category, Product } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface ProductWithCategory extends Product {
  category: Category | null;
}

interface ProductsPageClientProps {
  categories: Category[];
}

export default function ProductsPageClient({
  categories,
}: ProductsPageClientProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [productToDelete, setProductToDelete] =
    useState<ProductWithCategory | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const q = searchParams.get("q") || "";
  // AHORA cat es SLUG, no id
  const cat = searchParams.get("cat") || "";
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/logout", { method: "POST" });
        if (res.ok) {
          toast({ title: "Logged out successfully" });
          router.push("/admin/login");
        } else {
          throw new Error("Logout failed");
        }
      } catch (error) {
        console.error("[ADMIN_LOGOUT]", error);
        toast({
          title: "Error",
          description: "Could not log out.",
          variant: "destructive",
        });
      }
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (q) params.set("q", q);
        if (cat) params.set("cat", cat); // slug

        const res = await fetch(`/api/products?${params.toString()}`);
        const payload = await res.json();

        const items = (
          Array.isArray(payload?.data?.items)
            ? payload.data.items
            : Array.isArray(payload?.data)
            ? payload.data
            : []
        ) as ProductWithCategory[];

        const totalFromApi =
          typeof payload?.data?.total === "number"
            ? payload.data.total
            : typeof payload?.total === "number"
            ? payload.total
            : items.length;

        if (!res.ok || !payload?.ok) {
          const msg =
            (payload && (payload.error || payload.message)) ||
            "Failed to fetch products";
          throw new Error(msg);
        }

        setProducts(items);
        setTotal(totalFromApi);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
        setProducts([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [q, cat, page, toast]);

  const handleFilterChange = (newFilters: { q?: string; cat?: string }) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (newFilters.q !== undefined) params.set("q", newFilters.q);
    if (newFilters.cat !== undefined) params.set("cat", newFilters.cat); // slug
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/products/${productToDelete.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete product");

        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
        setTotal((t) => Math.max(0, t - 1));
      } catch (error) {
        console.error("[ADMIN_PRODUCT_DELETE]", error);
        toast({
          title: "Error",
          description: "Could not delete product.",
          variant: "destructive",
        });
      } finally {
        setProductToDelete(null);
      }
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  const inputClass =
    "mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]";
  const selectClass = inputClass;

  const renderContent = () => {
    if (isLoading) return <p className="text-slate-700">Loading...</p>;

    if (error) {
      return (
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-2"
          >
            Retry
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center">
          <p className="text-slate-700">No products found.</p>
          <Link href="/admin/products/new" className="btn btn-primary mt-2">
            Create New Product
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {
                      formatCurrency(
                        product.price
                      ) /* product.price en centavos */
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.category?.name ?? "Sin categoría"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="ml-4 text-red-500 hover:text-red-400 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-[var(--color-neutral-700)]">
            Mostrando{" "}
            <span className="font-medium">{(page - 1) * pageSize + 1}</span> a{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, total)}
            </span>{" "}
            de <span className="font-medium">{total}</span> resultados
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                router.push(
                  `/admin/products?page=${page - 1}&q=${q}&cat=${cat}`
                )
              }
              disabled={page <= 1}
              className="btn btn-secondary"
            >
              Anterior
            </button>
            <button
              onClick={() =>
                router.push(
                  `/admin/products?page=${page + 1}&q=${q}&cat=${cat}`
                )
              }
              disabled={page >= totalPages}
              className="btn btn-secondary"
            >
              Siguiente
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">Productos (Admin)</h1>
        <div className="flex items-center gap-4">
          <Link href="/" className="btn btn-secondary">
            Volver al inicio
          </Link>
          <Link href="/admin/products/new" className="btn btn-primary">
            Nuevo Producto
          </Link>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="btn btn-secondary"
          >
            {isPending ? "Cerrando sesión..." : "Cerrar Sesión"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-neutral-200)] bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            defaultValue={q}
            onChange={(e) => handleFilterChange({ q: e.target.value })}
            className={inputClass}
          />
          <select
            value={cat}
            onChange={(e) => handleFilterChange({ cat: e.target.value })}
            className={selectClass}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug /* ✅ usar slug */}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {renderContent()}
      </div>

      {productToDelete && (
        <ConfirmDialog
          open={!!productToDelete}
          onCancel={() => setProductToDelete(null)}
          onConfirm={handleDelete}
          title="Delete Product"
          description={`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </div>
  );
}
