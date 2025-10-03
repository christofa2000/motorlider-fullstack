import { cache } from "react";

import { categories } from "@/data/categories";
import { mockProducts } from "@/data/products";
import type { Product } from "@/types";

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
};

type ApiProduct = Product & {
  category: {
    id: string;
    name: string;
    slug: string;
  };
};

type ProductsApiResponse = {
  ok: boolean;
  data?: ApiProduct[];
  total?: number;
  page?: number;
  pageSize?: number;
};

const buildFallbackProducts = (): ApiProduct[] => {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  return mockProducts.map((product) => ({
    ...product,
    category: categoryMap.get(product.categoryId) ?? {
    id: product.categoryId,
    name: "Sin categoría",
    slug: "sin-categoria",
    },
  }));
};

const fallbackProducts = buildFallbackProducts();

export const fetchProducts = cache(
  async (params?: { q?: string; cat?: string; page?: number; pageSize?: number }) => {
    const url = new URL("/api/products", getBaseUrl());
    const searchParams = url.searchParams;

    if (params?.q) {
      searchParams.set("q", params.q);
    }

    if (params?.cat) {
      searchParams.set("cat", params.cat);
    }

    if (params?.page) {
      searchParams.set("page", params.page.toString());
    }

    if (params?.pageSize) {
      searchParams.set("pageSize", params.pageSize.toString());
    }

    try {
      const response = await fetch(url.toString(), {
        cache: "no-store",
      });

      const payload = (await response.json()) as ProductsApiResponse;

      if (response.ok && payload.ok && Array.isArray(payload.data)) {
        return payload.data;
      }
    } catch (error) {
      console.warn("Falling back to mock products", error);
    }

    return fallbackProducts;
  }
);

export const fetchProductById = cache(async (id: string) => {
  const products = await fetchProducts();
  return products.find((product) => product.id === id);
});
