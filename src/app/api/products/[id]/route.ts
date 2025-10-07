import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { productUpdateSchema } from "@/lib/validators/product";
import { Prisma } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminToken = req.cookies.get("admin_token")?.value;
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
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
      const existingProduct = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existingProduct) {
        return NextResponse.json(
          { ok: false, error: "A product with this slug already exists." },
          { status: 409 }
        );
      }
    }

    const { categoryId, ...rest } = parsedBody.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId !== undefined
          ? categoryId
            ? { category: { connect: { id: categoryId } } }
            : { category: { disconnect: true } }
          : {}),
      },
      include: { category: true },
    });

    return NextResponse.json({ ok: true, data: product });
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    // Prisma's P2025 is for record not found on update
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const adminToken = req.cookies.get("admin_token")?.value;
    if (adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    // Prisma's P2025 is for record not found on delete
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
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
