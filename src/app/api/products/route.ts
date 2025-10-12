// src/app/api/products/route.ts
import { prisma } from "@/lib/db";
import { productCreateSchema } from "@/lib/validators/product";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs"; // ✔️ App Router soportado. No usar `export const config = {...}`

const getProductsSchema = z.object({
  q: z.string().optional(),
  // `cat` llega como SLUG de categoría
  cat: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = getProductsSchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { q, cat, page, pageSize } = parsed.data;

    const where: Prisma.ProductWhereInput = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ];
    }
    if (cat) {
      where.category = { slug: cat };
    }

    const skip = (page - 1) * pageSize;

    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      ok: true,
      data: { items, total, page, pageSize },
    });
  } catch (err) {
    console.error("[PRODUCTS_GET]", err);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth simple por cookie
    const adminToken = req.cookies.get("admin_token")?.value;
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { slug, categoryId, image, ...rest } = parsed.data;

    // Slug único
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "SLUG_EXISTS" },
        { status: 409 }
      );
    }

    // Sanitiza imagen
    const imageUrl = image?.trim() || "/images/products/placeholder.png";

    const created = await prisma.product.create({
      data: {
        ...rest,
        slug,
        image: imageUrl,
        category: { connect: { id: categoryId } },
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    // Revalidar la home para que aparezca el nuevo producto
    revalidatePath("/");

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("[PRODUCTS_POST]", err);
    return NextResponse.json(
      { ok: false, error: "INVALID_BODY" },
      { status: 400 }
    );
  }
}
