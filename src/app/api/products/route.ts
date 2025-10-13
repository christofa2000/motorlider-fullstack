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
        {
          ok: false,
          error: "No autorizado. Inicia sesión como administrador.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.format());
      return NextResponse.json(
        {
          ok: false,
          error: "Datos del producto inválidos",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { slug, categoryId, image, ...rest } = parsed.data;

    // Verificar que la categoría existe
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { ok: false, error: "La categoría seleccionada no existe" },
        { status: 400 }
      );
    }

    // Slug único
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Ya existe un producto con ese slug. Cambia el nombre del producto.",
        },
        { status: 409 }
      );
    }

    // Sanitiza imagen - el validador ya maneja el fallback
    const imageUrl = image || "/images/products/placeholder.png";

    console.log(`Creating product: ${rest.name} with image: ${imageUrl}`);

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

    console.log(`Product created successfully: ${created.id}`);

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("[PRODUCTS_POST]", err);

    // Manejar errores específicos de Prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return NextResponse.json(
          { ok: false, error: "Ya existe un producto con ese nombre o slug" },
          { status: 409 }
        );
      }
      if (err.code === "P2003") {
        return NextResponse.json(
          { ok: false, error: "La categoría seleccionada no existe" },
          { status: 400 }
        );
      }
    }

    const message =
      err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json(
      { ok: false, error: `Error al crear producto: ${message}` },
      { status: 500 }
    );
  }
}
