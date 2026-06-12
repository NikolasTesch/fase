import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadNotification(lead: {
  id: string;
  name: string;
  email: string;
  phone: string;
  sport: string;
  quantity?: number | null;
  details?: string | null;
  city?: string | null;
  productSlug?: string | null;
}) {
  const to = process.env.EMAIL_TO_SALES ?? "contato@fasesport.com";
  const from = process.env.EMAIL_FROM ?? "noreply@fasesport.com";

  await resend.emails.send({
    from,
    to,
    subject: `Novo orçamento de ${lead.name} — ${lead.sport}`,
    html: `
      <h2>Novo lead de orçamento</h2>
      <table>
        <tr><td><strong>Nome</strong></td><td>${lead.name}</td></tr>
        <tr><td><strong>E-mail</strong></td><td>${lead.email}</td></tr>
        <tr><td><strong>Telefone</strong></td><td>${lead.phone}</td></tr>
        <tr><td><strong>Cidade</strong></td><td>${lead.city ?? "—"}</td></tr>
        <tr><td><strong>Modalidade</strong></td><td>${lead.sport}</td></tr>
        <tr><td><strong>Quantidade</strong></td><td>${lead.quantity ?? "—"}</td></tr>
        <tr><td><strong>Produto</strong></td><td>${lead.productSlug ?? "—"}</td></tr>
        <tr><td><strong>Detalhes</strong></td><td>${lead.details ?? "—"}</td></tr>
      </table>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/leads">Ver no painel</a></p>
    `,
  });
}
