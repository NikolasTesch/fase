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

    const stream = await streamDriveFile(art.previewFileId);
    return new Response(stream as ReadableStream, {
      headers: {
        "Content-Type": art.previewMimeType,
        "Cache-Control": "private, max-age=300",
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
