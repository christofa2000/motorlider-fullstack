import { buildAdminLoginResponse } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminToken = process.env.ADMIN_TOKEN;

  if (adminToken && password === adminToken) {
    return buildAdminLoginResponse();
  }

  return NextResponse.json(
    { ok: false, error: "Invalid password" },
    { status: 401 }
  );
}
