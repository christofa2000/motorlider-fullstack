// src/app/api/products/[id]/route.ts
import { prisma } from "@/lib/db";
import { productUpdateSchema } from "@/lib/validators/product";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/** Contexto que Next 15 espera: params es una Promise */
type Ctx = { params: Promise<{ id: string }> };

/** Normaliza params.id a string (maneja Promise en Next 15) */
async function getIdFromCtx(ctx: Ctx): Promise<string> {
  const { id } = await ctx.params;
  return Array.isArray(id) ? String(id[0]) : String(id);
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const id = await getIdFromCtx(ctx);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: product });
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const id = await getIdFromCtx(ctx);

    const adminToken = req.cookies.get("admin_token")?.value;
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsedBody = productUpdateSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { slug } = parsedBody.data;
    if (slug) {
      const exists = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (exists) {
        return NextResponse.json(
          { ok: false, error: "A product with this slug already exists." },
          { status: 409 }
        );
      }
    }

    const { categoryId, ...rest } = parsedBody.data;

    if (categoryId === null) {
      return NextResponse.json(
        { ok: false, error: "categoryId cannot be null: required relation." },
        { status: 400 }
      );
    }

    const data: Prisma.ProductUpdateInput = {
      ...rest,
      ...(categoryId !== undefined
        ? { category: { connect: { id: categoryId } } }
        : {}),
    };

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json({ ok: true, data: product });
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  try {
    const id = await getIdFromCtx(ctx);

    const adminToken = req.cookies.get("admin_token")?.value;
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { ok: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
