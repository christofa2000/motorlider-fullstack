# Motorlider E-commerce Starter

Base para un e-commerce de repuestos construido con **Next.js 15**, **React 19**, **TypeScript** y **TailwindCSS**. Incluye panel de administracion, API protegida y configuracion lista para desplegar en Vercel con Postgres administrado.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript (`strict: true`) + Jest/ts-jest
- TailwindCSS 4
- Prisma ORM + Postgres remoto
- Zod para validaciones
- Zustand para estado del carrito

## Caracteristicas destacadas

### Storefront

- Home renderizada en el servidor consumiendo `/api/products` con fallback a mocks si la API falla.
- Busqueda por `?q=` y filtro por categoria `?cat=` directamente desde el servidor.
- Utilidad `formatCurrency` que opera en centavos para evitar errores de coma flotante.

### Backend & API

- Modelos `Category` y `Product` definidos en `prisma/schema.prisma`.
- Endpoints REST en `/api/products` con respuestas `{ ok, data?, error? }`.
- Validaciones con Zod en `lib/validators/product.ts`.
- Seed (`tsx prisma/seed.ts`) que hace `upsert` de las categorias base: Motor, Suspension y Frenos.
- Ruta `/api/upload` que sube imagenes a Cloudinary y devuelve `secure_url` + `public_id`.

### Panel de administracion

- Middleware (`src/middleware.ts`) que exige cookie `admin_token` para `/admin/**` y mutaciones.
- Login en `/admin/login` que guarda cookie httpOnly comparando contra `ADMIN_TOKEN`.
- Listado `/admin/products` con filtros, paginacion, edicion y borrado.
- Formularios reutilizables con React Hook Form, toasts y carga de imagenes a Cloudinary.

### Carrito

- Manejo en centavos, persistencia en `localStorage` y derivados memorizados.

## Estructura

```text
src/
|- app/
|  |- api/products/route.ts       # GET + POST
|  |- api/products/[id]/route.ts  # GET + PATCH + DELETE
|  |- api/upload/route.ts         # Subida de imagenes (Cloudinary)
|  |- admin/login/page.tsx        # Login protegido
|  |- admin/products/             # Listado + formularios
|  \- page.tsx                    # Home SSR
|- lib/
|  |- db.ts                       # PrismaClient singleton
|  |- products.ts                 # Fetch SSR + fallback
|  \- validators/product.ts       # Esquemas Zod
|- store/cart.ts                  # Store Zustand
\- prisma/schema.prisma           # Modelos
```

## Desarrollo

1. Copia `.env.example` a `.env.local` y completa las variables.
2. Instala dependencias: `npm install`.
3. Ejecuta migraciones: `npx prisma migrate dev`.
4. Poblado inicial: `npx prisma db seed` (categorias base).
5. Levanta el proyecto: `npm run dev`.

### Scripts utiles

- `npm run lint`
- `npm run test`
- `npx prisma studio`

## Variables de entorno

```text
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_TOKEN=...
```

Consulta `.env.example` para la version mas reciente y evita commitear secretos (`.env*` esta en `.gitignore`).

## QA local

- `npx prisma migrate dev`
- `npx prisma db seed`
- `npm run dev`

## Despliegue en Vercel

1. En Vercel > Settings > Environment Variables define:
   - `DATABASE_URL` (cadena de Neon o equivalente Postgres)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_TOKEN`
2. Build Command: `npm run build`
3. Output Directory: `.next`
4. Despliega normalmente (Vercel detectara Next.js).

## Notas

- Prisma se conecta a Postgres; en desarrollo puedes usar una base Neon gratuita.
- Todos los precios se guardan como enteros (centavos) y se convierten en el cliente.
- Usa `npm run build` antes de desplegar para correr `next build` y `prisma migrate deploy`.
