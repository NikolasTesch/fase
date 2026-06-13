import { Resend } from "resend";
import { render } from "@react-email/render";
import { LeadNotificationEmail } from "@/emails/LeadNotificationEmail";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendLeadNotification(lead: {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  sport: string;
  quantity?: number | null;
  details?: string | null;
  city?: string | null;
  productSlug?: string | null;
}) {
  const to = process.env.EMAIL_TO_SALES ?? "contato@fasesport.com";
  const from = process.env.EMAIL_FROM ?? "noreply@fasesport.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const phone = lead.phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá ${lead.name}! Recebemos seu pedido de orçamento de uniforme de ${lead.sport} pelo site da Fase Sport. Podemos conversar sobre os detalhes?`
  );
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
  const adminUrl = `${appUrl}/admin/leads`;

  const html = await render(
    LeadNotificationEmail({ lead, adminUrl, whatsappUrl })
  );

  const resend = getResend();
  await resend.emails.send({
    from,
    to,
    subject: `Novo orçamento de ${lead.name} — ${lead.sport}`,
    html,
  });
}
