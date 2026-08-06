import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";
import { ArtUpdateSchema } from "@/lib/validations/arts";
import { deleteDriveFile } from "@/lib/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;

    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "PATCH")) {
      return errorResponse("Acesso negado", 403);
    }

    const art = await prisma.artFile.findUnique({ where: { id } });
    if (!art) return errorResponse("Arte não encontrada", 404);
    if (auth.role === "T2_VENDEDOR" && art.createdById !== auth.id) {
      return errorResponse("Você só pode editar/excluir suas próprias artes", 403);
    }

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const body = await req.json();
    const validated = ArtUpdateSchema.safeParse(body);
    if (!validated.success) return formatZodError(validated.error);

    const { name, description, tagIds } = validated.data;

    const data: Prisma.ArtFileUpdateInput = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (tagIds !== undefined) {
      const existing = await prisma.artTag.findMany({
        where: { id: { in: tagIds } },
        select: { id: true },
      });
      if (existing.length !== tagIds.length) {
        return errorResponse("Uma ou mais tags não existem.", 400);
      }
      data.tags = { set: existing.map((t) => ({ id: t.id })) };
    }

    const updated = await prisma.artFile.update({ where: { id }, data });
    return Response.json({ id: updated.id, name: updated.name });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ message: "Arte não encontrada" }, { status: 404 });
    }
    console.error("[PATCH /api/admin/arts/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;

    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "DELETE")) {
      return errorResponse("Acesso negado", 403);
    }

    const art = await prisma.artFile.findUnique({ where: { id } });
    if (!art) return errorResponse("Arte não encontrada", 404);
    if (auth.role === "T2_VENDEDOR" && art.createdById !== auth.id) {
      return errorResponse("Você só pode editar/excluir suas próprias artes", 403);
    }

    try {
      await deleteDriveFile(art.previewFileId);
      await deleteDriveFile(art.originalFileId);
    } catch {
      // best-effort: remove do banco mesmo se a exclusão no Drive falhar
    }

    await prisma.artFile.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ message: "Arte não encontrada" }, { status: 404 });
    }
    console.error("[DELETE /api/admin/arts/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
