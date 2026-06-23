import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";

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

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    const validated = UpdateSchema.safeParse(body);

    if (!validated.success) {
      return formatZodError(validated.error);
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: validated.data,
    });

    return Response.json(lead);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Lead não encontrado" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/leads/:id]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
