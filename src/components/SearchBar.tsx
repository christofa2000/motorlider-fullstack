"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type SearchBarProps = {
  initialValue?: string;
  onSearch?: (value: string) => void;
  className?: string;
};

const MagnifierIcon = () => (
  <svg
    aria-hidden
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 3a7.5 7.5 0 1 0 4.743 13.356l3.7 3.701a.75.75 0 1 0 1.061-1.06l-3.7-3.702A7.5 7.5 0 0 0 10.5 3Zm0 1.5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"
    />
  </svg>
);

const DEBOUNCE_MS = 300;

const SearchBar = ({ initialValue = "", onSearch, className }: SearchBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const [query, setQuery] = useState(initialValue);
  const timeoutRef = useRef<number | null>(null);
  const lastNotifiedValue = useRef<string>(initialValue.trim());

  useEffect(() => {
    setQuery(initialValue);
    lastNotifiedValue.current = initialValue.trim();
  }, [initialValue]);

  const updateUrlAndNotify = useCallback(
    (term: string, { pushImmediately = false }: { pushImmediately?: boolean } = {}) => {
      const trimmed = term.trim();

      const params = new URLSearchParams(searchParamsString);
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const nextQuery = params.toString();
      const nextUrl = `${pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      const currentUrl = `${pathname}${searchParamsString ? `?${searchParamsString}` : ""}`;

      if (nextUrl !== currentUrl) {
        router.push(nextUrl, { scroll: false });
      }

      if (lastNotifiedValue.current !== trimmed || pushImmediately) {
        lastNotifiedValue.current = trimmed;
        onSearch?.(trimmed);
      }
    },
    [pathname, router, searchParamsString, onSearch]
  );

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      updateUrlAndNotify(query);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [query, updateUrlAndNotify]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    updateUrlAndNotify(query, { pushImmediately: true });
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`flex w-full items-center gap-2 ${className ?? ""}`.trim()}
    >
      <label htmlFor="global-search" className="sr-only">
        Buscar repuesto
      </label>
      <input
        id="global-search"
        aria-label="Buscar repuesto"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar repuesto..."
        className="w-full rounded-full border border-[var(--color-neutral-200)] bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
      />
      <button
        type="submit"
        className="flex items-center justify-center rounded-full bg-[var(--color-secondary)] p-2 text-[var(--color-contrast)] transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-white"
      >
        <span className="sr-only">Buscar</span>
        <MagnifierIcon />
      </button>
    </form>
  );
};

export default SearchBar;
