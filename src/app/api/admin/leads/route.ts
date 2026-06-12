import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status") as LeadStatus | null;

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
