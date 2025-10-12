import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="container px-6 py-6">
      <header className="card card--flat p-3 md:p-4 mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold">Panel de administración</h1>
          <div className="flex items-center gap-2">
            <input className="input w-64" placeholder="Buscar..." aria-label="Buscar" />
            {/* Acciones globales según la page */}
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}

