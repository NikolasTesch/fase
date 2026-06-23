import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";

interface Params {
  params: Promise<{ id: string }>;
}

const UpdateSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1).max(5000).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const validated = UpdateSchema.safeParse(body);

    if (!validated.success) {
      return formatZodError(validated.error);
    }

    const faq = await prisma.faq.update({
      where: { id },
      data: validated.data,
    });

    return Response.json(faq);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "FAQ não encontrada" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/faqs/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    await prisma.faq.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "FAQ não encontrada" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/admin/faqs/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
