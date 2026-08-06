import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireT1Admin } from "@/lib/auth";

export async function GET() {
  const auth = await requireT1Admin();
  if (auth instanceof NextResponse) return auth;

  try {
    const totalSessions = await prisma.chatSession.count();
    const totalMessages = await prisma.chatMessage.count();

    const chatLeadsCount = await prisma.lead.count({
      where: {
        OR: [
          { source: "chat_fabi" },
          { source: "chat_fabi_tool" },
        ],
      },
    });

    const positiveFeedback = await prisma.chatMessage.count({
      where: { feedback: 1 },
    });

    const negativeFeedback = await prisma.chatMessage.count({
      where: { feedback: -1 },
    });

    const recentSessions = await prisma.chatSession.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const conversionRate = totalSessions > 0 ? ((chatLeadsCount / totalSessions) * 100).toFixed(1) : "0.0";

    return Response.json({
      success: true,
      metrics: {
        totalSessions,
        totalMessages,
        chatLeadsCount,
        conversionRate: `${conversionRate}%`,
        positiveFeedback,
        negativeFeedback,
      },
      recentSessions,
    });
  } catch (error) {
    console.error("[GET /api/admin/chat-analytics]", error);
    return Response.json({ success: false, message: "Erro ao carregar métricas de chat." }, { status: 500 });
  }
}
