import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import type { AdminUser } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireApiAdmin, canAccessRoute } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { uploadRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";
import {
  ArtUploadSchema,
  ART_PREVIEW_MIME,
  ART_ORIGINAL_EXTENSIONS,
  ART_MAX_PREVIEW_SIZE,
  ART_MAX_ORIGINAL_SIZE,
} from "@/lib/validations/arts";
import { uploadArtFile, deleteDriveFile } from "@/lib/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function fileToBuffer(file: File): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = file.stream().getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (auth instanceof NextResponse) return auth;
    const user = auth as AdminUser;

    if (!canAccessRoute(user.role, req.nextUrl.pathname, "POST")) {
      return errorResponse("Acesso negado", 403);
    }

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await uploadRatelimit.limit(`upload:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const original = formData.get("original") as File | null;
    const name = (formData.get("name") as string)?.trim() ?? "";
    const description = (formData.get("description") as string)?.trim() || undefined;
    const rawTagIds = formData.get("tagIds") as string | null;

    if (!file || !original) {
      return errorResponse("Envie o preview e o arquivo original.", 400);
    }

    let tagIds: unknown = [];
    if (rawTagIds) {
      try {
        tagIds = JSON.parse(rawTagIds);
      } catch {
        return errorResponse("tagIds inválido.", 400);
      }
    }

    const validated = ArtUploadSchema.safeParse({ name, description, tagIds });
    if (!validated.success) return formatZodError(validated.error);

    if (!(ART_PREVIEW_MIME as readonly string[]).includes(file.type)) {
      return errorResponse("Tipo de preview não permitido. Use PNG, JPG, WebP ou GIF.", 400);
    }
    if (file.size > ART_MAX_PREVIEW_SIZE) {
      return errorResponse("Preview muito grande. Máximo 10 MB.", 400);
    }

    const previewBuf = await fileToBuffer(file);
    try {
      const metadata = await sharp(previewBuf).metadata();
      if (!metadata.format) {
        return errorResponse("Preview inválido ou corrompido. Envie uma imagem válida.", 400);
      }
    } catch {
      return errorResponse("Preview não é uma imagem válida.", 400);
    }

    const ext = original.name.split(".").pop()?.toLowerCase() ?? "";
    if (!(ART_ORIGINAL_EXTENSIONS as readonly string[]).includes(ext)) {
      return errorResponse("Extensão do arquivo original não permitida.", 400);
    }
    if (original.size > ART_MAX_ORIGINAL_SIZE) {
      return errorResponse("Arquivo original muito grande. Máximo 20 MB.", 400);
    }

    const existingTags = await prisma.artTag.findMany({
      where: { id: { in: validated.data.tagIds } },
    });

    const originalBuf = await fileToBuffer(original);
    const previewId = await uploadArtFile(previewBuf, `${name}-preview`, file.type);
    const originalId = await uploadArtFile(
      originalBuf,
      original.name,
      original.type || "application/octet-stream"
    );

    try {
      const art = await prisma.artFile.create({
        data: {
          name: validated.data.name,
          description: validated.data.description ?? null,
          previewFileId: previewId,
          previewMimeType: file.type,
          originalFileId: originalId,
          originalFileName: original.name,
          originalMimeType: original.type || "application/octet-stream",
          sizeBytes: original.size,
          createdById: user.id,
          tags: { connect: existingTags.map((t) => ({ id: t.id })) },
        },
      });

      return Response.json({ id: art.id, name: art.name }, { status: 201 });
    } catch (error) {
      try {
        await deleteDriveFile(previewId);
        await deleteDriveFile(originalId);
      } catch {
        // best-effort cleanup do Drive após falha no banco
      }
      throw error;
    }
  } catch (error) {
    console.error("[POST /api/admin/arts/upload]", error);
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
