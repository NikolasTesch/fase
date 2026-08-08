import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireT1Admin } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { errorResponse } from "@/lib/errors";
import { deleteFromR2, r2KeyFromUrl } from "@/lib/r2";
import { revalidateCatalog } from "@/lib/revalidate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ artId: string }> }
) {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { artId } = await ctx.params;

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const art = await prisma.artFile.findUnique({ where: { id: artId } });
    if (!art) return errorResponse("Arte não encontrada", 404);

    // Desvincula do produto antes de apagar — evita P2003/P2025 no delete
    const product = await prisma.product.findUnique({ where: { artId } });
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { artId: null },
      });
    }

    const r2Key = r2KeyFromUrl(art.previewUrl);
    if (r2Key) {
      try {
        await deleteFromR2(r2Key);
      } catch {
        // best-effort: remove o registro mesmo se a exclusão no R2 falhar
      }
    }

    // Artes legadas do Drive não têm key R2 (r2KeyFromUrl null) — ficam órfãs
    const origKey = r2KeyFromUrl(art.originalFileId);
    if (origKey) {
      try {
        await deleteFromR2(origKey);
      } catch {
        // best-effort: remove o registro mesmo se a exclusão no R2 falhar
      }
    }

    await prisma.artFile.delete({ where: { id: artId } });

    revalidateCatalog();

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return errorResponse("Arte não encontrada", 404);
    }
    console.error("[DELETE /api/admin/products/art/:artId]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
