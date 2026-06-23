import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";

const FaqSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const categoryId = req.nextUrl.searchParams.get("categoryId");

    const faqs = await prisma.faq.findMany({
      where: categoryId ? { categoryId } : { categoryId: null },
      orderBy: { sortOrder: "asc" },
      include: { category: { select: { slug: true, name: true } } },
    });

    return Response.json(faqs);
  } catch (error) {
    console.error("[GET /api/admin/faqs]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = FaqSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { message: "Dados inválidos", errors: validated.error.issues },
        { status: 400 }
      );
    }

    const faq = await prisma.faq.create({ data: validated.data });

    return Response.json(faq, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return Response.json(
        { message: "Categoria não encontrada" },
        { status: 404 }
      );
    }
    console.error("[POST /api/admin/faqs]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
