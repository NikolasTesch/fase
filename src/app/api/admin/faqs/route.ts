import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";

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

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const validated = FaqSchema.safeParse(body);

    if (!validated.success) {
      return formatZodError(validated.error);
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
