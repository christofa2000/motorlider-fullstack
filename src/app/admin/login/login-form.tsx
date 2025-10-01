"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PRODUCTS_PATH = "/admin/products";

const fetchJson = async (token: string) => {
  const response = await fetch("/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;

    const message = payload?.error?.message ?? "No se pudo iniciar sesi�n";
    throw new Error(message);
  }
};

export default function LoginForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await fetchJson(token);
      router.push(ADMIN_PRODUCTS_PATH);
      router.refresh();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "No se pudo iniciar sesi�n"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700" htmlFor="admin-token">
          Token administrador
        </label>
        <input
          id="admin-token"
          name="token"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          placeholder="Ingresa tu token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
