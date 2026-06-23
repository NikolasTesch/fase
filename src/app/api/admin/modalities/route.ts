import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { uploadToR2, convertToWebP, MAX_FILE_SIZE } from "@/lib/r2";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { uploadRatelimit } from "@/lib/ratelimit";
import { errorResponse } from "@/lib/errors";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function GET() {
  try {
    const items = await prisma.modalityItem.findMany({
      orderBy: [{ sectionOrder: "asc" }, { sortOrder: "asc" }],
    });

    return Response.json(items);
  } catch (error) {
    console.error("[GET /api/admin/modalities]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

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
    const itemId = formData.get("itemId") as string | null;

    if (!file || !itemId) {
      return Response.json(
        { message: "Arquivo e itemId são obrigatórios" },
        { status: 400 }
      );
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
    const { buffer, mimeType } = await convertToWebP(raw, file.type);

    const timestamp = Date.now();
    const key = `modalities/${itemId}/${timestamp}.webp`;

    const url = await uploadToR2(key, buffer, mimeType);

    await prisma.modalityItem.update({
      where: { id: itemId },
      data: { imageUrl: url },
    });

    return Response.json({ url }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Item não encontrado" },
        { status: 404 }
      );
    }
    console.error("[POST /api/admin/modalities]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
