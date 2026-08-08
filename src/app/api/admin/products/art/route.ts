import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import type { AdminUser } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireT1Admin } from "@/lib/auth";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { uploadRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";
import { convertToWebP, uploadToR2, deleteFromR2, r2KeyFromUrl } from "@/lib/r2";
import {
  ArtSchema,
  ART_PREVIEW_MIME,
  ART_ORIGINAL_EXTENSIONS,
  ART_MAX_PREVIEW_SIZE,
  ART_MAX_ORIGINAL_SIZE,
} from "@/lib/validations/art";
import { revalidateCatalog } from "@/lib/revalidate";

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
    const originalFileUrl = (formData.get("originalFileUrl") as string)?.trim() || null;
    const originalFileName = (formData.get("originalFileName") as string)?.trim() || null;
    const productId = (formData.get("productId") as string)?.trim() || null;

    if (!file || (!original && !originalFileUrl)) {
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

    const originalName = original ? original.name : (originalFileName ?? "");
    const ext = originalName.split(".").pop()?.toLowerCase() ?? "";
    // Originais não-imagem (.cdr/.ai/.eps/.svg/.pdf) não são validáveis por magic
    // bytes — força octet-stream em vez de confiar no MIME fornecido pelo cliente
    const isImageExt = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);

    let originalFileId: string | null = null;
    let originalMime = "application/octet-stream";
    let originalSize = 0;

    if (originalFileUrl) {
      // Upload direto via presigned URL já feito pelo browser — ext/tamanho foram
      // validados na geração da presigned; aqui só valida a URL e a guarda como referência
      if (!r2KeyFromUrl(originalFileUrl)) {
        return errorResponse("URL de arquivo original inválida.", 400);
      }
      originalFileId = originalFileUrl;
      if (isImageExt) {
        originalMime = `image/${ext === "jpg" ? "jpeg" : ext}`;
      }
      originalSize = Number(formData.get("sizeBytes")) || 0;
    } else if (original) {
      if (!(ART_ORIGINAL_EXTENSIONS as readonly string[]).includes(ext)) {
        return errorResponse("Extensão do arquivo original não permitida.", 400);
      }
      if (original.size > ART_MAX_ORIGINAL_SIZE) {
        return errorResponse("Arquivo original muito grande. Máximo 100 MB.", 400);
      }
      originalMime = isImageExt && original.type ? original.type : "application/octet-stream";
      originalSize = original.size;
    }

    const name = originalName.replace(/\.[^.]+$/, "");
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

    const originalBuf = original ? await fileToBuffer(original) : null;

    let previewUrl: string | null = null;
    try {
      const { buffer: webpBuf, mimeType: webpMime } = await convertToWebP(previewBuf, file.type);
      previewUrl = await uploadToR2(`arts/${Date.now()}-${name}.webp`, webpBuf, webpMime);
      if (originalBuf) {
        originalFileId = await uploadToR2(
          `arts/originals/${Date.now()}-${originalName}`,
          originalBuf,
          originalMime
        );
      }

      // Substitui a arte anterior do produto (arquivos + registro) — best-effort;
      // artes legadas do Drive não têm key R2 (r2KeyFromUrl null) e são ignoradas
      if (existingArt) {
        const oldKey = r2KeyFromUrl(existingArt.previewUrl);
        if (oldKey) {
          try {
            await deleteFromR2(oldKey);
          } catch {
            // ignora falha do cleanup
          }
        }
        const oldOriginalKey = r2KeyFromUrl(existingArt.originalFileId);
        if (oldOriginalKey) {
          try {
            await deleteFromR2(oldOriginalKey);
          } catch {
            // ignora falha do cleanup
          }
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
          originalFileId: originalFileId!,
          originalFileName: originalName,
          originalMimeType: originalMime,
          sizeBytes: originalSize,
          createdById: user.id,
        },
      });

      if (productId) {
        await prisma.product.update({
          where: { id: productId },
          data: { artId: art.id },
        });
      }

      revalidateCatalog();

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
      // best-effort: remove do R2 qualquer arquivo já enviado (inclui o caso
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
        const origKey = r2KeyFromUrl(originalFileId);
        if (origKey) {
          try {
            await deleteFromR2(origKey);
          } catch {
            // ignora falha do cleanup
          }
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("[POST /api/admin/products/art]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
