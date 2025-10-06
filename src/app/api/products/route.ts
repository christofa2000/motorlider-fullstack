import { prisma } from "@/lib/db";
import { productCreateSchema } from "@/lib/validators/product";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Removed invalid import: ProductWhereInput is not exported by @prisma/client

const getProductsSchema = z.object({
  q: z.string().optional(),
  cat: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsedQuery = getProductsSchema.safeParse(query);

    if (!parsedQuery.success) {
      return NextResponse.json(
        { ok: false, error: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const { q, cat, page, pageSize } = parsedQuery.data;

    const where: Prisma.ProductWhereInput = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ];
    }
    if (cat) {
      // cat debe ser el categoryId (string). Si mandaras slug, habría que joinear.
      where.categoryId = cat;
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    // 🔧 forma compatible con el cliente
    return NextResponse.json({
      ok: true,
      data: {
        items: products,
        total,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminToken = req.cookies.get("admin_token")?.value;
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsedBody = productCreateSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { ok: false, error: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { slug } = parsedBody.data;
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { ok: false, error: "A product with this slug already exists." },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: parsedBody.data,
    });

    return NextResponse.json({ ok: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
