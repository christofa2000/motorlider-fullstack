"use client";

import type { ComponentType, MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Car, Wrench, Octagon } from "lucide-react";

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
    "pill focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-neutral-700)]";

  const iconBySlug: Record<string, ComponentType<{ className?: string; size?: number }>> = {
    motor: Car,
    suspension: Wrench,
    frenos: Octagon,
  };

  return (
    <nav aria-label="Categorías destacadas" className="category-bar">
      <div className="category-scroller px-4 py-2 sm:px-6 sm:py-3 md:px-8">
        <button
          type="button"
          onClick={(event) => handleClick(event)}
          className={`${baseClasses} ${currentCategory === "" ? "pill--active" : ""}`}
          aria-pressed={currentCategory === ""}
        >
          <span>Todas</span>
        </button>
        {items.map((category) => {
          const active = category.slug === currentCategory;
          const Icon = iconBySlug[category.slug] ?? Car;
          return (
            <button
              key={category.id}
              type="button"
              onClick={(event) => handleClick(event, category.slug)}
              className={`${baseClasses} ${active ? "pill--active" : ""}`}
              aria-pressed={active}
            >
              <Icon size={16} aria-hidden className="mr-2 opacity-90" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryBar;
