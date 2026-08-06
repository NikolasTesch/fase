import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;

    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "GET")) {
      return errorResponse("Acesso negado", 403);
    }

    const q = req.nextUrl.searchParams.get("q")?.trim();
    const tagId = req.nextUrl.searchParams.get("tagId");

    const arts = await prisma.artFile.findMany({
      where: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(tagId ? { tags: { some: { id: tagId } } } : {}),
      },
      include: {
        tags: true,
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(arts);
  } catch (error) {
    console.error("[GET /api/admin/arts]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
