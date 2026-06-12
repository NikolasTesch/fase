import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category") ?? undefined;
    const subcategory = searchParams.get("subcategory") ?? undefined;
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: { slug: category } }),
        ...(subcategory && { subcategory: { slug: subcategory } }),
        ...(featured === "true" && { isFeatured: true }),
      },
      orderBy: { sortOrder: "asc" },
      take: limit ? parseInt(limit) : undefined,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { slug: true, name: true } },
        subcategory: { select: { slug: true, name: true } },
      },
    });

    return Response.json(products);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
