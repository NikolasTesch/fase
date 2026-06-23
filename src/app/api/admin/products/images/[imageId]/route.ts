import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ imageId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { imageId } = await params;

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return Response.json(
        { message: "Imagem não encontrada" },
        { status: 404 }
      );
    }

    await prisma.productImage.delete({ where: { id: imageId } });

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Imagem não encontrada" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/admin/products/images/:imageId]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
