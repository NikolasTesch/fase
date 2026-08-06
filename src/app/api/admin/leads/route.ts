import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";
import { requireT1Admin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const statusParam = req.nextUrl.searchParams.get("status");

    const validStatuses = Object.values(LeadStatus) as string[];
    if (statusParam !== null && !validStatuses.includes(statusParam)) {
      return Response.json(
        { message: "Status inválido" },
        { status: 400 }
      );
    }

    const status = statusParam as LeadStatus | null;

    const leads = await prisma.lead.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return Response.json(leads);
  } catch (error) {
    console.error("[GET /api/admin/leads]", error);
    return Response.json({ message: "Erro interno" }, { status: 500 });
  }
}
