import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  fabric: z.string().optional(),
  minQty: z.number().int().min(1).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  simulatorUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional().nullable(),
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

    const { simulatorUrl, ...rest } = validated.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(simulatorUrl !== undefined && {
          simulatorUrl: simulatorUrl || null,
        }),
      },
    });

    return Response.json(product);
  } catch (error) {
    console.error("[PATCH /api/admin/products/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // Soft delete
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return Response.json(product);
  } catch (error) {
    console.error("[DELETE /api/admin/products/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
