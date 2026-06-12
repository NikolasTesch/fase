import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        category: true,
        subcategory: true,
      },
    });

    if (!product) {
      return Response.json({ message: "Produto não encontrado" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error("[GET /api/products/:slug]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
