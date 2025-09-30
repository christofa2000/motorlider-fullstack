"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { categories } from "@/data/categories";
import { SITE_NAME } from "@/lib/constants";
import { useCartCount, useCartIsHydrated } from "@/store/cart";
import { useIsClient } from "@/hooks/useIsClient";

import SearchBar from "./SearchBar";

const iconClasses = "h-5 w-5";

const HamburgerIcon = () => (
  <svg
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={iconClasses}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5m-16.5 10.5h16.5M3.75 12h16.5"
    />
  </svg>
);

const CartIcon = () => (
  <svg
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={iconClasses}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437m0 0 1.312 4.916a2.25 2.25 0 0 0 2.178 1.662h7.837a2.25 2.25 0 0 0 2.178-1.662l1.043-3.915a.563.563 0 0 0-.546-.71H6.375m-.27 0L5.25 4.5M9 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm8.25 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={iconClasses}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.933 17.933 0 0 1 12 21.75c-2.7 0-5.253-.59-7.5-1.632Z"
    />
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isClient = useIsClient();
  const cartCount = useCartCount();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const displayedCartCount = isClient ? cartCount : 0;

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-neutral-200)] bg-[var(--color-primary)] text-[var(--color-contrast)] shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Abrir menú de categorías"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-category-menu"
            className="inline-flex items-center justify-center rounded-full p-2 transition hover:bg-[var(--color-neutral-700)] hover:text-[var(--color-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary)] md:hidden"
          >
            <HamburgerIcon />
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 text-[var(--color-contrast)] transition hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary)]"
            aria-label={`Ir al inicio de ${SITE_NAME}`}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-base font-bold">
              ML
            </span>
            <span className="hidden text-lg font-semibold sm:inline">{SITE_NAME}</span>
          </Link>
        </div>
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar className="max-w-2xl" initialValue={searchQuery} />
        </div>
        <nav className="ml-auto flex items-center gap-2">
          <Link
            href="/cart"
            className="relative inline-flex items-center justify-center rounded-full p-2 transition hover:bg-[var(--color-neutral-700)] hover:text-[var(--color-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary)]"
            aria-label={`Ir al carrito (${displayedCartCount} artículos)`}
          >
            <CartIcon />
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-secondary)] px-1 text-xs font-semibold text-[var(--color-contrast)]">
              {displayedCartCount}
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 transition hover:bg-[var(--color-neutral-700)] hover:text-[var(--color-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary)]"
            aria-label="Iniciar sesión"
          >
            <UserIcon />
          </button>
        </nav>
      </div>
      {isMenuOpen ? (
        <nav id="mobile-category-menu" aria-label="Categorías" className="md:hidden">
          <ul className="space-y-1 border-t border-[var(--color-neutral-200)] bg-[var(--color-primary)] px-4 py-3">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categorias/${category.slug}`}
                  className="block rounded-md px-3 py-2 text-sm transition hover:bg-[var(--color-neutral-700)] hover:text-[var(--color-contrast)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-primary)]"
                  onClick={closeMenu}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
};

export default Navbar;
