import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productUpdateSchema } from "@/lib/validators/product";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = productUpdateSchema.parse(body);

    if (data.slug) {
      const existingProduct = await db.product.findFirst({
        where: { slug: data.slug, NOT: { id: params.id } },
      });

      if (existingProduct) {
        return NextResponse.json(
          { ok: false, error: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    const product = await db.product.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ ok: true, data: product });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { ok: false, error: error.errors },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}