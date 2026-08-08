import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";
import { requireT1Admin } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2";

interface Params {
  params: Promise<{ imageId: string }>;
}

const UpdateImageSchema = z.object({
  isPrimary: z.boolean(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { imageId } = await params;
    const body = await req.json();

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const validated = UpdateImageSchema.safeParse(body);
    if (!validated.success) return formatZodError(validated.error);

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return errorResponse("Imagem não encontrada", 404);
    }

    if (validated.data.isPrimary) {
      // Garante exatamente uma imagem primária por produto
      await prisma.$transaction([
        prisma.productImage.updateMany({
          where: { productId: image.productId, isPrimary: true },
          data: { isPrimary: false },
        }),
        prisma.productImage.update({
          where: { id: imageId },
          data: { isPrimary: true },
        }),
      ]);
    } else {
      await prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: false },
      });
    }

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
    console.error("[PATCH /api/admin/products/images/:imageId]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

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

    const baseUrl = process.env.NEXT_PUBLIC_R2_URL;
    const r2Key =
      baseUrl && image.url.startsWith(`${baseUrl}/`)
        ? image.url.slice(baseUrl.length + 1)
        : null;

    if (r2Key) {
      try {
        await deleteFromR2(r2Key);
      } catch {
        // best-effort: remove o registro mesmo se a exclusão no R2 falhar
      }
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
