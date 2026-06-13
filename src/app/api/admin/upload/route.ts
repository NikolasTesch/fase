import { NextRequest } from "next/server";
import { uploadToR2, MAX_FILE_SIZE } from "@/lib/r2";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;
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

    const ext = file.type.split("/")[1];
    const timestamp = Date.now();
    const key = productId
      ? `products/${productId}/${timestamp}.${ext}`
      : `uploads/${timestamp}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(key, buffer, file.type);

    // Se veio com productId, salva o registro de imagem no banco
    if (productId) {
      const image = await prisma.productImage.create({
        data: { url, altText, isPrimary, productId },
      });

      return Response.json({ url, imageId: image.id }, { status: 201 });
    }

    return Response.json({ url }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/upload]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
