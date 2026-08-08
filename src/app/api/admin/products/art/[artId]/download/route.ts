import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireT1Admin } from "@/lib/auth";
import { getClientIp } from "@/lib/ip";
import { streamRatelimit } from "@/lib/ratelimit";
import { errorResponse } from "@/lib/errors";
import { r2KeyFromUrl, streamFromR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // arquivos originais até 100 MB — timeout maior para o stream

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ artId: string }> }
) {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const { artId } = await ctx.params;

    const ip = getClientIp(req);
    const { success: allowed } = await streamRatelimit.limit(`stream:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const art = await prisma.artFile.findUnique({ where: { id: artId } });
    if (!art) return errorResponse("Arte não encontrada", 404);

    // Artes legadas do Drive não migraram para o R2 — sem key, sem download
    const origKey = r2KeyFromUrl(art.originalFileId);
    if (!origKey) return errorResponse("Arquivo original não disponível (migrado do armazenamento antigo).", 410);
    const stream = await streamFromR2(origKey);
    if (!stream) return errorResponse("Arquivo original não encontrado no armazenamento.", 404);

    return new Response(stream as ReadableStream, {
      headers: {
        "Content-Type": art.originalMimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(art.originalFileName)}`,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/products/art/:artId/download]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
