import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        subcategories: { orderBy: { sortOrder: "asc" } },
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            subcategory: true,
          },
        },
        faqs: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    });

    if (!category) {
      return Response.json({ message: "Categoria não encontrada" }, { status: 404 });
    }

    return Response.json(category);
  } catch (error) {
    console.error("[GET /api/categories/:slug]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
