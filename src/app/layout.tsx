import "./globals.css";
import "../styles/theme.css";
import type { ReactNode } from "react";

import ToastProvider from "../components/ToastProvider";

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <head />
      <body className="min-h-screen bg-white font-sans text-gray-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
