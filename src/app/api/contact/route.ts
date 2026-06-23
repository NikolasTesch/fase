import { NextRequest } from "next/server";
import { validateCsrf } from "@/lib/csrf";
import { prisma } from "@/lib/db";
import { formatZodError } from "@/lib/errors";
import { getClientIp } from "@/lib/ip";
import { ratelimit } from "@/lib/ratelimit";
import { sendLeadNotification } from "@/lib/resend";
import { ContactSchema } from "@/lib/validations/contact";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { valid: csrfValid } = validateCsrf(req);
    if (!csrfValid) {
      return Response.json(
        { success: false, message: "Requisição rejeitada" },
        { status: 400 }
      );
    }
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return Response.json(
        {
          success: false,
          message: "Muitas tentativas. Tente novamente em 10 minutos.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = ContactSchema.safeParse(body);

    if (!validated.success) {
      return formatZodError(validated.error);
    }

    const lead = await prisma.lead.create({ data: validated.data });

    // Notificação por e-mail em background — não bloqueia a resposta
    sendLeadNotification(lead).catch((err) =>
      console.error("[sendLeadNotification]", err)
    );

    return Response.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/contact]", error);
    return Response.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
