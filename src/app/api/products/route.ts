import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { productCreateSchema } from "@/lib/validators/product";
import { z } from "zod";

export const runtime = "nodejs" as const;

const getProductsSchema = z.object({
  q: z.string().optional(),
  // AHORA 'cat' es el SLUG de la categoría, no el ID.
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

    // Filtramos por SLUG de categoría
    if (cat) {
      where.category = { slug: cat };
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

    // Sanitizar URL de imagen
    const imageUrl = parsedBody.data.image?.trim() || "/images/products/placeholder.png";

    const { categoryId, ...rest } = parsedBody.data;

    const product = await prisma.product.create({
      data: {
        ...rest,
        image: imageUrl,
        category: { connect: { id: categoryId } },
      },
      include: { category: true },
    });

    // Revalida la home para que aparezca al instante
    revalidatePath("/");

    return NextResponse.json({ ok: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
