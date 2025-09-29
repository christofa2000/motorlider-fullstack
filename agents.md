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
