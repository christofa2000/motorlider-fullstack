import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productCreateSchema } from "@/lib/validators/product";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const cat = searchParams.get("cat");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  const where: any = {};
  if (q) {
    where.OR = [{ name: { contains: q } }, { brand: { contains: q } }];
  }
  if (cat) {
    where.categoryId = cat;
  }

  try {
    const [products, total] = await db.$transaction([
      db.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ ok: true, data: { products, total } });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = productCreateSchema.parse(body);

    const existingProduct = await db.product.findFirst({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { ok: false, error: "Slug already exists" },
        { status: 409 }
      );
    }

    const product = await db.product.create({ data });

    return NextResponse.json({ ok: true, data: product }, { status: 201 });
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