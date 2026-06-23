import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CategorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  imageUrl: z.url().optional().or(z.literal("")),
  iconUrl: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return Response.json(categories);
  } catch (error) {
    console.error("[GET /api/admin/categories]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CategorySchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { message: "Dados inválidos", errors: validated.error.issues },
        { status: 400 }
      );
    }

    const { imageUrl, ...data } = validated.data;

    const category = await prisma.category.create({
      data: { ...data, imageUrl: imageUrl || null },
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { message: "Já existe uma categoria com este slug." },
        { status: 409 }
      );
    }
    console.error("[POST /api/admin/categories]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
