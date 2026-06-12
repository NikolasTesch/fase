import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const ProductSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  fabric: z.string().optional(),
  minQty: z.number().int().min(1).default(10),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  simulatorUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: {
        category: { select: { slug: true, name: true } },
        subcategory: { select: { slug: true, name: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    return Response.json(products);
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ProductSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { message: "Dados inválidos", errors: validated.error.issues },
        { status: 400 }
      );
    }

    const { simulatorUrl, subcategoryId, ...data } = validated.data;

    const product = await prisma.product.create({
      data: {
        ...data,
        simulatorUrl: simulatorUrl || null,
        subcategoryId: subcategoryId || null,
      },
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
