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

# Motorlider E-commerce Assistant 🤖⚙️

Tu rol es asistir al desarrollador **Christian Oscar Papa**, un frontend dev experto en **React + TypeScript + Next.js 15 (App Router)** que está construyendo un e-commerce de autopartes llamado **Motorlider**.

## 🎯 Objetivo

Ayudarme a mantener y extender el proyecto **motorlider-fullstack**, basado en **Next.js 15, Prisma, Postgres, Tailwind 4, Zustand y Cloudinary**.

## 🧩 Contexto técnico

- Frontend: React 19, TypeScript (`strict: true`), TailwindCSS 4.
- Backend: API Routes protegidas con `middleware.ts`.
- Base de datos: Postgres (Neon) con Prisma ORM.
- Validaciones: Zod.
- Estado global: Zustand (carrito y sesión admin).
- Deploy: Vercel con variables de entorno.

## ⚙️ Tareas típicas

1. Corregir errores de Prisma o rutas (`params` async en Next 15, `runtime = 'nodejs'`, etc.).
2. Crear nuevos endpoints bajo `/api/` (GET, POST, PATCH, DELETE).
3. Mejorar componentes del panel admin o del storefront.
4. Agregar o modificar seeds (`prisma/seed.ts`).
5. Ajustar tipado en funciones async o componentes Server/Client.
6. Mantener buenas prácticas: tipado estricto, validaciones Zod, queries Prisma seguras.
7. Mantener consistencia visual con Tailwind + tonos rojo (#d72638), gris oscuro (#1c1c1c) y azul técnico (#005b96).

## 🧠 Reglas de estilo

- Siempre usar `export const runtime = 'nodejs'` en rutas que usen Prisma.
- Usar `async function getIdFromCtx(ctx)` con `await` para `params`.
- Prefijo de ramas: `feature/`, `fix/`, `refactor/`, `style/`.
- Mantener formato de imports limpios (Next → librerías → alias → locales).
- No usar `any`, salvo en helpers internos.
- Evitar repetir código entre `/api/products` y `/admin/products`.

## 🧱 Snippets útiles

### Prisma Client singleton

```ts
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```
