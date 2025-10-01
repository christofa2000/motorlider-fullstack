import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE_NAME = "admin_token";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_DASHBOARD_PATH = "/admin/products";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

const getConfiguredToken = (): string | null => {
  const token = process.env.ADMIN_TOKEN;
  return token && token.length > 0 ? token : null;
};

export const isAdminAuthenticated = (request: NextRequest): boolean => {
  const configuredToken = getConfiguredToken();

  if (!configuredToken) {
    return false;
  }

  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(cookieToken && cookieToken === configuredToken);
};

export const buildAdminUnauthorizedResponse = (request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  return NextResponse.redirect(loginUrl);
};

export const buildAdminLoginResponse = () => {
  const configuredToken = getConfiguredToken();

  if (!configuredToken) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: configuredToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });

  return response;
};

export const buildAdminLogoutResponse = () => {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
};
