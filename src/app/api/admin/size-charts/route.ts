import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const RowSchema = z.object({
  label: z.string().min(1),
  values: z.array(z.string()),
});

const UpsertSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  columns: z.array(z.string()).min(1),
  rows: z.array(RowSchema).min(1),
});

export async function GET() {
  try {
    const charts = await prisma.sizeChart.findMany({
      orderBy: { type: "asc" },
    });
    return Response.json(charts);
  } catch (error) {
    console.error("[GET /api/admin/size-charts]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = UpsertSchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { message: "Dados inválidos", errors: validated.error.issues },
        { status: 400 }
      );
    }

    const { type, title, columns, rows } = validated.data;

    // Validate that each row has the same number of values as columns
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

    const chart = await prisma.sizeChart.upsert({
      where: { type },
      update: { title, columns, rows },
      create: { type, title, columns, rows },
    });

    return Response.json(chart, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/size-charts]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
