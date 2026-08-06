import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { streamDriveFile } from "@/lib/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;

    if (!canAccessRoute(auth.role, req.nextUrl.pathname, "GET")) {
      return errorResponse("Acesso negado", 403);
    }

    const art = await prisma.artFile.findUnique({ where: { id } });
    if (!art) return errorResponse("Arte não encontrada", 404);
    if (auth.role === "T2_VENDEDOR" && art.createdById !== auth.id) {
      return errorResponse("Você só pode acessar suas próprias artes", 403);
    }

    const stream = await streamDriveFile(art.originalFileId);
    return new Response(stream as ReadableStream, {
      headers: {
        "Content-Type": art.originalMimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(art.originalFileName)}`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/arts/:id/download]", error);
    if (
      error instanceof Error &&
      typeof error.message === "string" &&
      error.message.includes("GOOGLE_")
    ) {
      return errorResponse(error.message, 500);
    }
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
