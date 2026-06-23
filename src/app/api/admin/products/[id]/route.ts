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
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  fabric: z.string().optional(),
  minQty: z.number().int().min(1).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  simulatorUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional().nullable(),
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

    const { simulatorUrl, ...rest } = validated.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(simulatorUrl !== undefined && {
          simulatorUrl: simulatorUrl || null,
        }),
      },
    });

    return Response.json(product);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/products/:id]", error);
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

    // Soft delete
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return Response.json(product);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Produto não encontrado" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/admin/products/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
