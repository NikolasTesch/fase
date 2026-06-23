import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { uploadToR2, convertToWebP, MAX_FILE_SIZE } from "@/lib/r2";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;

    if (!file || !categoryId) {
      return Response.json(
        { message: "Arquivo e categoryId são obrigatórios" },
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
    const key = `categories/${categoryId}/size-table-${timestamp}.webp`;

    const url = await uploadToR2(key, buffer, mimeType);

    await prisma.category.update({
      where: { id: categoryId },
      data: { sizeTableUrl: url },
    });

    return Response.json({ url }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Categoria não encontrada" },
        { status: 404 }
      );
    }
    console.error("[POST /api/admin/categories/size-table]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
