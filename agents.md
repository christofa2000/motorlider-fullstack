# agents.md

## 🎯 Contexto del Proyecto

- E-commerce de repuestos de autos.
- Tecnologías principales: Next.js (App Router), TypeScript, TailwindCSS.
- Librerías de apoyo: Zustand (estado), React Query (fetching), Zod (validación).
- Objetivo: generar código limpio, modular y escalable.

## 🛠️ Estilo de Código

- Siempre usar componentes funcionales (React).
- Tipado estricto en TypeScript (`strict: true`).
- Estilos solo con Tailwind (no CSS inline).
- Nombres de variables y funciones claros en inglés.
- Buenas prácticas de accesibilidad (alt en imágenes, labels en inputs, aria-\*).

## 🔐 Seguridad

- No exponer secretos en el cliente.
- Manejo de auth con JWT + refresh tokens.
- Validar inputs del usuario con Zod.

## ⚡ Rendimiento

- Lazy loading y code splitting en componentes pesados.
- Reutilizar hooks para fetching con React Query.
- Evitar renders innecesarios (memoización si es necesario).

## ✅ Testing

- Jest + React Testing Library.
- Tests unitarios para componentes críticos.
- Tests de integración para flujos de compra.

## Backend (Prisma + SQLite/Postgres)

- Usar Prisma como ORM.
- En dev usar SQLite (`file:./dev.db`), en producción Postgres.
- Definir schema con modelos `Category` y `Product` con relaciones 1:N.
- Usar migraciones con `npx prisma migrate dev`.
- Crear `lib/db.ts` con PrismaClient singleton.
- Validar datos con Zod antes de persistir (crear/editar).
- Formato de respuesta API: `{ ok: boolean, data?: any, error?: string }`.
- Proteger rutas de administración (`/admin/**`) con middleware y token en `.env` o NextAuth credentials.
- Manejar precios en centavos (int).
- Proveer scripts: `db:push`, `db:studio`, `db:seed`.
- No usar `any`. Tipar con `Prisma.Product` y helpers.
- Seguridad: nunca exponer secretos al cliente, validar siempre inputs, controlar errores.
