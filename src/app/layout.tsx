import type { ReactNode } from "react";
import "../styles/theme.css";
import "./globals.css";

import ToastProvider from "../components/ToastProvider";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <head />
      <body className="min-h-screen bg-cover bg-center font-sans text-gray-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}