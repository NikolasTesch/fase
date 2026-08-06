import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";
import { ArtTagSchema } from "@/lib/validations/arts";

export const dynamic = "force-dynamic";

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const body = await req.json();
    const validated = ArtTagSchema.partial().safeParse(body);

    if (!validated.success) {
      return formatZodError(validated.error);
    }

    const { name } = validated.data;
    if (!name) return errorResponse("Informe um nome", 400);

    const tag = await prisma.artTag.update({
      where: { id },
      data: { name, slug: makeSlug(name) },
    });

    return Response.json(tag);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return Response.json(
          { message: "Já existe uma tag com este nome." },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return Response.json({ message: "Tag não encontrada" }, { status: 404 });
      }
    }
    console.error("[PATCH /api/admin/art-tags/:id]", error);
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

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    await prisma.artTag.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json({ message: "Tag não encontrada" }, { status: 404 });
    }
    console.error("[DELETE /api/admin/art-tags/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
