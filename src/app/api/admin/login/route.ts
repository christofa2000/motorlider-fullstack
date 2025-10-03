import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === process.env.ADMIN_TOKEN) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_token", process.env.ADMIN_TOKEN, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  }

  return NextResponse.json(
    { ok: false, error: "Invalid password" },
    { status: 401 }
  );
}