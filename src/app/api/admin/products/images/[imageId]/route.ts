import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { errorResponse } from "@/lib/errors";

interface Params {
  params: Promise<{ imageId: string }>;
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { imageId } = await params;

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return Response.json(
        { message: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Imagem não encontrada" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/admin/products/images/:imageId]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
