import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const statusParam = req.nextUrl.searchParams.get("status");

    if (statusParam !== null && !(statusParam in LeadStatus)) {
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
