import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminToken = process.env.ADMIN_TOKEN;

  if (adminToken && password === adminToken) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_token", adminToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  return NextResponse.json(
    { ok: false, error: "Invalid password" },
    { status: 401 }
  );
}
