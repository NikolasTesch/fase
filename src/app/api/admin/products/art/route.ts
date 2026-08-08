import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import type { AdminUser } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireT1Admin } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { uploadRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";
import { convertToWebP, uploadToR2, deleteFromR2 } from "@/lib/r2";
import { uploadArtFile, deleteDriveFile } from "@/lib/drive";
import {
  ArtSchema,
  ART_PREVIEW_MIME,
  ART_ORIGINAL_EXTENSIONS,
  ART_MAX_PREVIEW_SIZE,
  ART_MAX_ORIGINAL_SIZE,
} from "@/lib/validations/art";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 segundos de timeout para uploads grandes

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

function r2KeyFromUrl(url: string): string | null {
  const baseUrl = process.env.NEXT_PUBLIC_R2_URL;
  if (!baseUrl) return null;
  return url.startsWith(`${baseUrl}/`) ? url.slice(baseUrl.length + 1) : null;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireT1Admin();
    if (auth instanceof NextResponse) return auth;
    const user = auth as AdminUser;

    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    const ip = getClientIp(req);
    const { success: allowed } = await uploadRatelimit.limit(`upload:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const original = formData.get("original") as File | null;
    const productId = (formData.get("productId") as string)?.trim() || null;

    if (!file || !original) {
      return errorResponse("Envie o preview e o arquivo original.", 400);
    }

    if (!(ART_PREVIEW_MIME as readonly string[]).includes(file.type)) {
      return errorResponse("Tipo de preview não permitido. Use PNG, JPG, WebP ou GIF.", 400);
    }
    if (file.size > ART_MAX_PREVIEW_SIZE) {
      return errorResponse("Preview muito grande. Máximo 25 MB.", 400);
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
      return errorResponse("Arquivo original muito grande. Máximo 100 MB.", 400);
    }

    const name = original.name.replace(/\.[^.]+$/, "");
    const validated = ArtSchema.safeParse({ name });
    if (!validated.success) return formatZodError(validated.error);

    // Valida existência do produto ANTES de subir arquivos — evita arte órfã
    // quando o productId aponta para nada; também captura a arte atual para
    // substituição sem acumular registros mortos
    let existingArt: { id: string; previewUrl: string; originalFileId: string } | null = null;
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { art: true },
      });
      if (!product) {
        return errorResponse("Produto não encontrado", 404);
      }
      existingArt = product.art;
    }

    const originalBuf = await fileToBuffer(original);
    // Originais não-imagem (.cdr/.ai/.eps/.svg/.pdf) não são validáveis por magic
    // bytes — força octet-stream em vez de confiar no MIME fornecido pelo cliente
    const isImageExt = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
    const originalMime =
      isImageExt && original.type ? original.type : "application/octet-stream";

    let previewUrl: string | null = null;
    let originalFileId: string | null = null;
    try {
      const { buffer: webpBuf, mimeType: webpMime } = await convertToWebP(previewBuf, file.type);
      previewUrl = await uploadToR2(`arts/${Date.now()}-${name}.webp`, webpBuf, webpMime);
      originalFileId = await uploadArtFile(originalBuf, original.name, originalMime);

      // Substitui a arte anterior do produto (arquivos + registro) — best-effort
      if (existingArt) {
        const oldKey = r2KeyFromUrl(existingArt.previewUrl);
        if (oldKey) {
          try {
            await deleteFromR2(oldKey);
          } catch {
            // ignora falha do cleanup
          }
        }
        try {
          await deleteDriveFile(existingArt.originalFileId);
        } catch {
          // ignora falha do cleanup
        }
        try {
          await prisma.artFile.delete({ where: { id: existingArt.id } });
        } catch {
          // ignora falha do cleanup
        }
      }

      const art = await prisma.artFile.create({
        data: {
          name: validated.data.name,
          previewUrl,
          previewMimeType: webpMime,
          originalFileId,
          originalFileName: original.name,
          originalMimeType: originalMime,
          sizeBytes: original.size,
          createdById: user.id,
        },
      });

      if (productId) {
        await prisma.product.update({
          where: { id: productId },
          data: { artId: art.id },
        });
      }

      return Response.json(
        {
          id: art.id,
          previewUrl: art.previewUrl,
          originalFileName: art.originalFileName,
          previewMimeType: art.previewMimeType,
        },
        { status: 201 }
      );
    } catch (error) {
      // best-effort: remove do R2/Drive qualquer arquivo já enviado (inclui o caso
      // de o 2º upload falhar após o 1º ter subido — evita arquivos órfãos)
      if (previewUrl) {
        const r2Key = r2KeyFromUrl(previewUrl);
        if (r2Key) {
          try {
            await deleteFromR2(r2Key);
          } catch {
            // ignora falha do cleanup
          }
        }
      }
      if (originalFileId) {
        try {
          await deleteDriveFile(originalFileId);
        } catch {
          // ignora falha do cleanup
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("[POST /api/admin/products/art]", error);
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
