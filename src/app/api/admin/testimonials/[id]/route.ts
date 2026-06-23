import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

const UpdateSchema = z.object({
  clientName: z.string().min(1).max(100).optional(),
  teamName: z.string().optional().nullable(),
  sport: z.string().optional().nullable(),
  text: z.string().min(1).max(2000).optional(),
  photoUrl: z.url().optional().or(z.literal("")).nullable(),
  logoUrl: z.url().optional().or(z.literal("")).nullable(),
  materialImageUrl: z.url().optional().or(z.literal("")).nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
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

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: validated.data,
    });

    return Response.json(testimonial);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Depoimento não encontrado" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/testimonials/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.testimonial.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Depoimento não encontrado" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/admin/testimonials/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
