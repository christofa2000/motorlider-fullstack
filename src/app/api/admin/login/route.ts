
import { NextRequest, NextResponse } from "next/server";
import { buildAdminLoginResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === process.env.ADMIN_TOKEN) {
    return buildAdminLoginResponse();
  } else {
    return NextResponse.json(
      { ok: false, error: "Invalid password" },
      { status: 401 }
    );
  }
}
