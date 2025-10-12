// app/layout.tsx
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import ToastProvider from "../components/ToastProvider";
import "../styles/theme.css";
import "./globals.css";

// Fuente optimizada (evita FOIT y mejora CLS)
const inter = Inter({ subsets: ["latin"], display: "swap" });

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      {/* <head /> no es necesario en App Router moderno; Next lo gestiona */}
      <body
        className={[
          inter.className,
          // Modo performance: sombras/animaciones más livianas (definido en theme.css)
          "perf-lite",
          // Utilitarios de legibilidad
          "min-h-screen antialiased",
          // Evitamos forzar color de texto aquí; lo maneja theme.css (texto claro sobre fondo oscuro)
          // "text-gray-900" removido para respetar el tema oscuro
        ].join(" ")}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
