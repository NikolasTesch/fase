import sharp from "sharp";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { uploadToR2, convertToWebP, MAX_FILE_SIZE } from "@/lib/r2";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { uploadRatelimit } from "@/lib/ratelimit";
import { errorResponse } from "@/lib/errors";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await uploadRatelimit.limit(`upload:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;
    const categoryId = formData.get("categoryId") as string | null;
    const isPrimary = formData.get("isPrimary") === "true";
    const altText = (formData.get("altText") as string) || null;

    if (!file) {
      return Response.json({ message: "Arquivo não enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { message: "Tipo de arquivo não permitido. Use JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { message: "Arquivo muito grande. Máximo 10 MB." },
        { status: 400 }
      );
    }

    const chunks: Uint8Array[] = [];
    const reader = file.stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const raw = Buffer.concat(chunks);

    // Validação de magic bytes via sharp — rejeita arquivos que não são imagens reais
    try {
      const metadata = await sharp(raw).metadata();
      if (!metadata.format) {
        return Response.json(
          { message: "Arquivo inválido ou corrompido. Envie uma imagem JPG, PNG ou WebP válida." },
          { status: 400 }
        );
      }
    } catch {
      return Response.json(
        { message: "Arquivo não é uma imagem válida." },
        { status: 400 }
      );
    }

    const { buffer, mimeType } = await convertToWebP(raw, file.type);

    const timestamp = Date.now();
    let key = `uploads/${timestamp}.webp`;
    if (productId) {
      key = `products/${productId}/${timestamp}.webp`;
    } else if (categoryId) {
      key = `categories/${categoryId}/${timestamp}.webp`;
    }

    const url = await uploadToR2(key, buffer, mimeType);

    if (productId && categoryId) {
      return Response.json(
        { message: "Envie apenas productId ou categoryId, não ambos." },
        { status: 400 }
      );
    }

    if (productId) {
      const currentCount = await prisma.productImage.count({
        where: { productId },
      });
      const image = await prisma.productImage.create({
        data: { url, altText, isPrimary, productId, sortOrder: currentCount },
      });

      return Response.json({ url, imageId: image.id }, { status: 201 });
    }

    if (categoryId) {
      await prisma.category.update({
        where: { id: categoryId },
        data: { imageUrl: url },
      });

      return Response.json({ url }, { status: 201 });
    }

    return Response.json({ url }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2003" || error.code === "P2025")
    ) {
      return Response.json(
        { message: "Produto ou categoria não encontrado" },
        { status: 404 }
      );
    }
    console.error("[POST /api/admin/upload]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
