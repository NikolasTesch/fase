import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

const UpdateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "CLOSED_WON", "CLOSED_LOST"]),
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

    const lead = await prisma.lead.update({
      where: { id },
      data: validated.data,
    });

    return Response.json(lead);
  } catch (error) {
    console.error("[PATCH /api/admin/leads/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
