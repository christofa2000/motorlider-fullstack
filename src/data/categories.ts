import type { Category } from "../types";

export const categories: Category[] = [
  {
    id: "cat_motor",
    name: "Motor",
    slug: "motor",
  },
  {
    id: "cat_suspension",
    name: "Suspensi\u00f3n",
    slug: "suspension",
  },
  {
    id: "cat_frenos",
    name: "Frenos",
    slug: "frenos",
  },
];

export const categorySlugById: Record<string, string> = categories.reduce(
  (accumulator, category) => {
    accumulator[category.id] = category.slug;
    return accumulator;
  },
  {} as Record<string, string>
);

export const categoryBySlug: Record<string, Category> = categories.reduce(
  (accumulator, category) => {
    accumulator[category.slug] = category;
    return accumulator;
  },
  {} as Record<string, Category>
);

export function getCategoryIdBySlug(slug: string): string | undefined {
  return categoryBySlug[slug]?.id;
}
