"use client";

import { MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { categories as defaultCategories } from "../data/categories";
import type { Category } from "../types";

type CategoryBarProps = {
  items?: Category[];
};

const CategoryBar = ({ items = defaultCategories }: CategoryBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("cat") ?? "";

  const buildQueryString = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set("cat", slug);
    } else {
      params.delete("cat");
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>, slug?: string) => {
    event.preventDefault();
    const queryString = buildQueryString(slug);
    router.push(`${pathname}${queryString}`, { scroll: false });
  };

  const baseClasses =
    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-neutral-700)]";

  return (
    <nav
      aria-label="Categorías destacadas"
      className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-700)] text-[var(--color-contrast)]"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3">
        <button
          type="button"
          onClick={(event) => handleClick(event)}
          className={`${baseClasses} ${
            currentCategory === ""
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-contrast)]"
              : "border-transparent hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]"
          }`}
          aria-pressed={currentCategory === ""}
        >
          Todas
        </button>
        {items.map((category) => {
          const active = category.slug === currentCategory;
          return (
            <button
              key={category.id}
              type="button"
              onClick={(event) => handleClick(event, category.slug)}
              className={`${baseClasses} ${
                active
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-contrast)]"
                  : "border-transparent hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]"
              }`}
              aria-pressed={active}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryBar;
