import { NextRequest } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  buildAdminLoginResponse,
  buildAdminLogoutResponse,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return Response.json(
      { ok: false, error: { message: "Invalid JSON payload" } },
      { status: 400 }
    );
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { token?: unknown }).token !== "string"
  ) {
    return Response.json(
      { ok: false, error: { message: "Token is required" } },
      { status: 400 }
    );
  }

  const { token } = payload as { token: string };
  const configuredToken = process.env.ADMIN_TOKEN ?? "";

  if (!configuredToken) {
    return Response.json(
      { ok: false, error: { message: "ADMIN_TOKEN is not configured" } },
      { status: 500 }
    );
  }

  if (token !== configuredToken) {
    return Response.json(
      { ok: false, error: { message: "Invalid token" } },
      { status: 401 }
    );
  }

  return buildAdminLoginResponse();
}

export function DELETE() {
  if (!process.env.ADMIN_TOKEN) {
    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax;` +
            (process.env.NODE_ENV === "production" ? " Secure" : ""),
        },
      }
    );
  }

  return buildAdminLogoutResponse();
}
