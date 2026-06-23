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
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  imageUrl: z.url().optional().or(z.literal("")),
  iconUrl: z.string().optional(),
  sizeTableUrl: z.url().optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
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

    const { imageUrl, sizeTableUrl, ...rest } = validated.data;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...rest,
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(sizeTableUrl !== undefined && { sizeTableUrl: sizeTableUrl || null }),
      },
    });

    return Response.json(category);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Categoria não encontrada" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/categories/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
