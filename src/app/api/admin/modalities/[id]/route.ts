import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { errorResponse } from "@/lib/errors";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const body = await req.json();

    const item = await prisma.modalityItem.update({
      where: { id },
      data: {
        ...(body.imageUrl !== undefined && {
          imageUrl: body.imageUrl || null,
        }),
      },
    });

    return Response.json(item);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Item não encontrado" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/modalities/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
