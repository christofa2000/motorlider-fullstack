"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Category, Product } from "@/generated/prisma";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/useToast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface ProductsPageClientProps {
  categories: Category[];
}

export function ProductsPageClient({ categories }: ProductsPageClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 10;

  useEffect(() => {
    const fetchProducts = async () => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.ok) {
        setProducts(data.data.products);
        setTotal(data.data.total);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    };

    fetchProducts();
  }, [searchParams, page, pageSize, toast]);

  const handleDelete = async () => {
    if (!productToDelete) return;

    const response = await fetch(`/api/products/${productToDelete.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.ok) {
      toast({ title: "Success", description: "Product deleted successfully" });
      setProducts(products.filter((p) => p.id !== productToDelete.id));
      setTotal(total - 1);
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }

    setProductToDelete(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products (Admin)</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          New Product
        </Link>
      </div>

      <div className="bg-white border border-[var(--color-neutral-200)] rounded-xl p-5 shadow-sm">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by name or brand..."
            defaultValue={searchParams.get("q") || ""}
            onChange={(e) => handleFilterChange("q", e.target.value)}
            className="input input-bordered w-full max-w-xs focus:ring-[var(--color-accent)]"
          />
          <select
            value={searchParams.get("cat") || ""}
            onChange={(e) => handleFilterChange("cat", e.target.value)}
            className="select select-bordered w-full max-w-xs focus:ring-[var(--color-accent)]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{formatCurrency(product.price / 100)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category?.name}</td>
                  <td className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="btn btn-sm btn-secondary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p>Total: {total}</p>
          <div className="btn-group">
            <button
              onClick={() => handleFilterChange("page", (page - 1).toString())}
              disabled={page <= 1}
              className="btn"
            >
              «
            </button>
            <button className="btn">Page {page}</button>
            <button
              onClick={() => handleFilterChange("page", (page + 1).toString())}
              disabled={page * pageSize >= total}
              className="btn"
            >
              »
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"?`}
      />
    </div>
  );
}