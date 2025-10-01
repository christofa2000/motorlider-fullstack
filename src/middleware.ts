import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_DASHBOARD_PATH,
  ADMIN_LOGIN_PATH,
  buildAdminUnauthorizedResponse,
  isAdminAuthenticated,
} from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname.startsWith(ADMIN_LOGIN_PATH);
  const isProductsApi = pathname.startsWith("/api/products");

  if (!isAdminRoute && !isProductsApi) {
    return NextResponse.next();
  }

  const authenticated = isAdminAuthenticated(request);

  if (isAdminRoute && isAdminLogin && authenticated) {
    return NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url));
  }

  const requiresAuth =
    (isAdminRoute && !isAdminLogin) ||
    (isProductsApi && request.method !== "GET");

  if (requiresAuth && !authenticated) {
    return buildAdminUnauthorizedResponse(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/products/:path*"],
};
