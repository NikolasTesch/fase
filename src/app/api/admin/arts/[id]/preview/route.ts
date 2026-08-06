import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { errorResponse } from "@/lib/errors";
import { getClientIp } from "@/lib/ip";
import { streamRatelimit } from "@/lib/ratelimit";
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

    const ip = getClientIp(req);
    const { success: allowed } = await streamRatelimit.limit(`stream:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const stream = await streamDriveFile(art.previewFileId);
    return new Response(stream as ReadableStream, {
      headers: {
        "Content-Type": art.previewMimeType,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/arts/:id/preview]", error);
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
