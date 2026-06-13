import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface Lead {
  name: string;
  email?: string | null;
  phone: string;
  city?: string | null;
  sport: string;
  quantity?: number | null;
  details?: string | null;
  productSlug?: string | null;
}

interface LeadNotificationEmailProps {
  lead: Lead;
  adminUrl: string;
  whatsappUrl: string;
}

const SPORT_LABELS: Record<string, string> = {
  futebol: "Futebol",
  volei: "Vôlei",
  basquete: "Basquete",
  handebol: "Handebol",
  passeio: "Passeio / Comissão",
  agasalho: "Agasalho",
  colete: "Colete",
  acessorios: "Acessórios",
};

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <Section style={{ marginBottom: "12px" }}>
      <Text
        style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#71717a",
          margin: "0 0 2px",
        }}
      >
        {label}
      </Text>
      <Text style={{ fontSize: "14px", color: "#18181b", margin: 0 }}>
        {value}
      </Text>
    </Section>
  );
}

export function LeadNotificationEmail({
  lead,
  adminUrl,
  whatsappUrl,
}: LeadNotificationEmailProps) {
  const sportLabel = SPORT_LABELS[lead.sport] ?? lead.sport;

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>
        Novo orçamento de {lead.name} — {sportLabel}
      </Preview>
      <Body
        style={{
          backgroundColor: "#f4f4f5",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: "32px 16px",
        }}
      >
        {/* Header */}
        <Section
          style={{
            backgroundColor: "#CD3438",
            borderRadius: "12px 12px 0 0",
            padding: "20px 28px",
            maxWidth: "560px",
            margin: "0 auto",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "20px",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            FASE SPORT
          </Text>
        </Section>

        <Container
          style={{
            maxWidth: "560px",
            backgroundColor: "#fff",
            padding: "28px 28px 32px",
            borderRadius: "0 0 12px 12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {/* Título */}
          <Heading
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#18181b",
              margin: "0 0 6px",
            }}
          >
            Novo orçamento recebido
          </Heading>
          <Text style={{ color: "#71717a", fontSize: "14px", margin: "0 0 24px" }}>
            <strong style={{ color: "#18181b" }}>{lead.name}</strong> quer
            uniforme de <strong style={{ color: "#CD3438" }}>{sportLabel}</strong>
          </Text>

          {/* Seção: Contato */}
          <Text
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#a1a1aa",
              margin: "0 0 12px",
            }}
          >
            Dados do contato
          </Text>

          <DataRow label="Nome" value={lead.name} />
          <DataRow label="Telefone" value={lead.phone} />
          {lead.email && <DataRow label="E-mail" value={lead.email} />}
          {lead.city && <DataRow label="Cidade" value={lead.city} />}

          <Hr style={{ borderColor: "#e4e4e7", margin: "20px 0" }} />

          {/* Seção: Pedido */}
          <Text
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#a1a1aa",
              margin: "0 0 12px",
            }}
          >
            Pedido
          </Text>

          <DataRow label="Modalidade" value={sportLabel} />
          {lead.quantity && (
            <DataRow
              label="Quantidade"
              value={`${lead.quantity} ${lead.quantity === 1 ? "peça" : "peças"}`}
            />
          )}
          {lead.productSlug && (
            <DataRow label="Modelo de interesse" value={lead.productSlug} />
          )}
          {lead.details && <DataRow label="Detalhes" value={lead.details} />}

          <Hr style={{ borderColor: "#e4e4e7", margin: "20px 0" }} />

          {/* CTAs */}
          <Section style={{ textAlign: "center" }}>
            <Button
              href={whatsappUrl}
              style={{
                backgroundColor: "#25D366",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
                marginRight: "12px",
              }}
            >
              Responder no WhatsApp
            </Button>
            <Button
              href={adminUrl}
              style={{
                backgroundColor: "#CD3438",
                color: "#fff",
                padding: "12px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Ver no painel
            </Button>
          </Section>
        </Container>

        {/* Footer */}
        <Section style={{ maxWidth: "560px", margin: "0 auto", padding: "16px 0" }}>
          <Text
            style={{
              fontSize: "12px",
              color: "#a1a1aa",
              textAlign: "center",
              margin: 0,
            }}
          >
            Fase Sport · Teixeira de Freitas, BA ·{" "}
            <a href="https://fasesport.com.br" style={{ color: "#a1a1aa" }}>
              fasesport.com.br
            </a>
          </Text>
        </Section>
      </Body>
    </Html>
  );
}
