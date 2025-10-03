
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: "/admin/:path*",
};

export function middleware(req: NextRequest) {
  const adminToken = req.cookies.get("admin_token")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login") && adminToken === process.env.ADMIN_TOKEN) {
    return NextResponse.redirect(new URL("/admin/products", req.url));
  }

  if (!pathname.startsWith("/admin/login")) {
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}
