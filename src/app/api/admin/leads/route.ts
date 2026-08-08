import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computePageRange } from "@/lib/pagination";
import { LeadStatus } from "@prisma/client";
import { requireT1Admin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const statusParam = req.nextUrl.searchParams.get("status");
    const rawPage = Number(req.nextUrl.searchParams.get("page") ?? 1);
    const rawPageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? 20);

    const validStatuses = Object.values(LeadStatus) as string[];
    if (statusParam !== null && !validStatuses.includes(statusParam)) {
      return Response.json(
        { message: "Status inválido" },
        { status: 400 }
      );
    }

    const status = statusParam as LeadStatus | null;
    const where = status ? { status } : undefined;

    const total = await prisma.lead.count({ where });
    const pg = computePageRange(total, rawPage, rawPageSize);

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pg.offset,
      take: pg.pageSize,
    });

    return Response.json({ data: leads, total, page: pg.page, pageSize: pg.pageSize });
  } catch (error) {
    console.error("[GET /api/admin/leads]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
