import { NextRequest, NextResponse } from "next/server";
import { requireT1Admin } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { uploadRatelimit } from "@/lib/ratelimit";
import { errorResponse } from "@/lib/errors";
import { getPresignedUploadUrl } from "@/lib/r2";
import { ART_ORIGINAL_EXTENSIONS, ART_MAX_ORIGINAL_SIZE } from "@/lib/validations/art";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireT1Admin();
    if (auth instanceof NextResponse) return auth;

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await uploadRatelimit.limit(`upload:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const body = await req.json();
    const fileName = (body.fileName as string)?.trim() ?? "";
    const contentType = (body.contentType as string)?.trim() || "application/octet-stream";
    const fileSize = Number(body.fileSize) || 0;

    if (!fileName) {
      return errorResponse("Nome do arquivo não informado.", 400);
    }

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    if (!(ART_ORIGINAL_EXTENSIONS as readonly string[]).includes(ext)) {
      return errorResponse("Extensão do arquivo original não permitida.", 400);
    }

    if (fileSize > ART_MAX_ORIGINAL_SIZE) {
      return errorResponse("Arquivo original muito grande. Máximo 100 MB.", 400);
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `arts/originals/${Date.now()}-${safeName}`;

    const presigned = await getPresignedUploadUrl(key, contentType, 3600);

    return Response.json(presigned, { status: 200 });
  } catch (error) {
    console.error("[POST /api/admin/presigned-url]", error);
    return errorResponse("Erro interno ao gerar URL de upload", 500);
  }
}
