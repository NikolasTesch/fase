import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateCsrf } from "@/lib/csrf";
import { getClientIp } from "@/lib/ip";
import { adminRatelimit } from "@/lib/ratelimit";
import { formatZodError, errorResponse } from "@/lib/errors";

interface Params {
  params: Promise<{ type: string }>;
}

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  columns: z.array(z.string()).min(1).optional(),
  rows: z
    .array(z.object({ label: z.string().min(1), values: z.array(z.string()) }))
    .min(1)
    .optional(),
});

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { type } = await params;
    const chart = await prisma.sizeChart.findUnique({ where: { type } });

    if (!chart) {
      return Response.json(
        { message: "Tabela de medidas não encontrada" },
        { status: 404 }
      );
    }

    return Response.json(chart);
  } catch (error) {
    console.error("[GET /api/admin/size-charts/:type]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { type } = await params;
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

    const { columns, rows, ...rest } = validated.data;

    if (columns && rows) {
      for (const row of rows) {
        if (row.values.length !== columns.length) {
          return Response.json(
            {
              message: `A linha "${row.label}" tem ${row.values.length} valores, mas deveria ter ${columns.length}`,
            },
            { status: 400 }
          );
        }
      }
    }

    const chart = await prisma.sizeChart.update({
      where: { type },
      data: { ...rest, ...(columns !== undefined && { columns }), ...(rows !== undefined && { rows }) },
    });

    return Response.json(chart);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Tabela de medidas não encontrada" },
        { status: 404 }
      );
    }
    console.error("[PATCH /api/admin/size-charts/:type]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { type } = await params;

    // CSRF check
    const csrf = validateCsrf(req);
    if (!csrf.valid) return errorResponse(csrf.reason ?? "Requisição rejeitada", 400);

    // Rate limit
    const ip = getClientIp(req);
    const { success: allowed } = await adminRatelimit.limit(`admin:${ip}`);
    if (!allowed) return errorResponse("Muitas requisições. Tente novamente.", 429);

    await prisma.sizeChart.delete({ where: { type } });
    return Response.json({ message: "Removida com sucesso" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "Tabela de medidas não encontrada" },
        { status: 404 }
      );
    }
    console.error("[DELETE /api/admin/size-charts/:type]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
