import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  iconUrl: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = UpdateSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { message: "Dados inválidos", errors: validated.error.issues },
        { status: 400 }
      );
    }

    const { imageUrl, ...rest } = validated.data;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...rest,
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      },
    });

    return Response.json(category);
  } catch (error) {
    console.error("[PATCH /api/admin/categories/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
