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

export async function GET() {
  try {
    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;

    const tags = await prisma.artTag.findMany({
      include: { _count: { select: { arts: true } } },
      orderBy: { name: "asc" },
    });

    return Response.json(tags);
  } catch (error) {
    console.error("[GET /api/admin/art-tags]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;

    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "POST")) {
      return errorResponse("Acesso negado", 403);
    }

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const body = await req.json();
    const validated = ArtTagSchema.safeParse(body);

    if (!validated.success) {
      return formatZodError(validated.error);
    }

    const { name } = validated.data;

    const tag = await prisma.artTag.create({
      data: { name, slug: makeSlug(name) },
    });

    return Response.json(tag, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { message: "Já existe uma tag com este nome." },
        { status: 409 }
      );
    }
    console.error("[POST /api/admin/art-tags]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
