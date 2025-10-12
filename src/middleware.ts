
import { buildAdminUnauthorizedResponse, isAdminAuthenticated } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/admin/:path*",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Si está en login y ya está autenticado, redirigir al dashboard
  if (pathname.startsWith("/admin/login") && isAdminAuthenticated(req)) {
    return NextResponse.redirect(new URL("/admin/products", req.url));
  }

  // Si no está en login y no está autenticado, redirigir al login
  if (!pathname.startsWith("/admin/login") && !isAdminAuthenticated(req)) {
    return buildAdminUnauthorizedResponse(req);
  }

  return NextResponse.next();
}
