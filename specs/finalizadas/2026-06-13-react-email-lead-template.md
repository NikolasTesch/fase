# React Email — Template de Notificação de Lead

> **Status:** `pendente`
> **ID:** `2026-06-13-react-email-lead-template`
> **Criada em:** 2026-06-13
> **Agente:** implementador

---

## Contexto

Quando um cliente envia um orçamento via `/orcamento`, a Fase Sport recebe um email de notificação. Atualmente o email é gerado como uma string HTML concatenada em `src/lib/resend.ts` — funcional, mas visualmente básico (tabela sem estilo, sem branding, sem CTA).

A equipe de vendas receberá dezenas de emails de leads por semana. Um email bem formatado reduz o tempo de análise: dados do lead organizados, botão de resposta rápida por WhatsApp e link direto para o painel admin. React Email (integração nativa com Resend) permite criar templates HTML robustos sem sair do TypeScript.

**Impacto de não fazer:** equipe de vendas lida com emails sem branding e sem CTA — perda de profissionalismo e atrito no workflow de resposta.

---

## Objetivos

- [ ] Instalar `@react-email/components` e `@react-email/render`
- [ ] Criar componente `LeadNotificationEmail` em `src/emails/`
- [ ] Atualizar `src/lib/resend.ts` para usar o componente React Email
- [ ] Email exibe: nome, telefone (clicável), email, cidade, esporte, quantidade, produto, detalhes
- [ ] Email exibe botão "Responder no WhatsApp" que abre conversa com o número do lead
- [ ] Email exibe botão "Ver no painel" que leva ao `/admin/leads`
- [ ] Identidade visual com cor brand (`#CD3438`), logo textual "FASE SPORT" e footer

## Fora de escopo

- Preview server do React Email (`email.react.email`) — não instalar o pacote de dev server
- Template de email para o cliente (confirmação de recebimento do orçamento) — pós-launch
- Internacionalização do template
- Testes unitários do template de email

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `package.json` | modificar | Adicionar `@react-email/components` e `@react-email/render` |
| `src/emails/LeadNotificationEmail.tsx` | criar | Componente React Email do template |
| `src/lib/resend.ts` | modificar | Usar `render()` do React Email em vez de string HTML |

### Estrutura do email

```
┌─────────────────────────────────────────────────┐
│  ██████ FASE SPORT                  [logo texto] │  ← header #CD3438
├─────────────────────────────────────────────────┤
│  Novo orçamento recebido                        │  ← título
│  João Silva quer uniforme de Futebol            │  ← subtítulo
├─────────────────────────────────────────────────┤
│  DADOS DO CONTATO                               │
│  Nome        João Silva                         │
│  Telefone    (27) 99999-9999  ← link tel:       │
│  E-mail      joao@email.com                     │
│  Cidade      Colatina - ES                      │
├─────────────────────────────────────────────────┤
│  PEDIDO                                         │
│  Modalidade  Futebol                            │
│  Quantidade  20 peças                           │
│  Produto     modelo-champions-pro               │
│  Detalhes    Quero em azul e branco...          │
├─────────────────────────────────────────────────┤
│  [Responder no WhatsApp]  [Ver no painel admin] │  ← CTAs
├─────────────────────────────────────────────────┤
│  Fase Sport · Colatina, ES · fasesport.com.br   │  ← footer
└─────────────────────────────────────────────────┘
```

### Instalação

```bash
npm install @react-email/components @react-email/render
```

### Implementação do componente

```tsx
// src/emails/LeadNotificationEmail.tsx
import {
  Body, Button, Container, Head, Heading, Hr,
  Html, Preview, Row, Section, Text,
} from '@react-email/components'

interface LeadNotificationEmailProps {
  lead: {
    name: string
    email?: string | null
    phone: string
    city?: string | null
    sport: string
    quantity?: number | null
    details?: string | null
    productSlug?: string | null
  }
  adminUrl: string
  whatsappUrl: string
}

export function LeadNotificationEmail({ lead, adminUrl, whatsappUrl }: LeadNotificationEmailProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Novo orçamento de {lead.name} — {lead.sport}</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'system-ui, sans-serif' }}>
        {/* Header */}
        <Section style={{ backgroundColor: '#CD3438', padding: '20px 24px' }}>
          <Text style={{ color: '#fff', fontWeight: 700, fontSize: '20px', margin: 0 }}>
            FASE SPORT
          </Text>
        </Section>

        <Container style={{ maxWidth: '560px', backgroundColor: '#fff', padding: '32px 24px' }}>
          {/* Título */}
          <Heading style={{ fontSize: '22px', margin: '0 0 8px' }}>
            Novo orçamento recebido
          </Heading>
          <Text style={{ color: '#71717a', margin: '0 0 24px' }}>
            {lead.name} quer uniforme de <strong style={{ textTransform: 'capitalize' }}>{lead.sport}</strong>
          </Text>

          {/* Dados do contato */}
          <Text style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', margin: '0 0 8px' }}>
            Dados do contato
          </Text>
          {/* ... rows ... */}

          <Hr style={{ borderColor: '#e4e4e7', margin: '20px 0' }} />

          {/* Pedido */}
          <Text style={{ fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a', margin: '0 0 8px' }}>
            Pedido
          </Text>
          {/* ... rows ... */}

          <Hr style={{ borderColor: '#e4e4e7', margin: '20px 0' }} />

          {/* CTAs */}
          <Row>
            <Button href={whatsappUrl} style={{ backgroundColor: '#25D366', color: '#fff', padding: '12px 20px', borderRadius: '8px', marginRight: '12px' }}>
              Responder no WhatsApp
            </Button>
            <Button href={adminUrl} style={{ backgroundColor: '#CD3438', color: '#fff', padding: '12px 20px', borderRadius: '8px' }}>
              Ver no painel
            </Button>
          </Row>
        </Container>

        {/* Footer */}
        <Section style={{ padding: '16px 24px', textAlign: 'center' }}>
          <Text style={{ fontSize: '12px', color: '#a1a1aa' }}>
            Fase Sport · Colatina, ES · fasesport.com.br
          </Text>
        </Section>
      </Body>
    </Html>
  )
}
```

### Atualização do resend.ts

```typescript
// src/lib/resend.ts — após a mudança
import { render } from '@react-email/render'
import { LeadNotificationEmail } from '@/emails/LeadNotificationEmail'

// dentro de sendLeadNotification():
const whatsappUrl = `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.name}, vi seu pedido de uniforme de ${lead.sport} pelo site!`)}`
const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads`

const html = await render(<LeadNotificationEmail lead={lead} adminUrl={adminUrl} whatsappUrl={whatsappUrl} />)

await resend.emails.send({ from, to, subject, html })
```

### Decisões técnicas (ADR)

**ADR-1 — `@react-email/render` gera string HTML, não JSX.**
O Resend `emails.send()` aceita `html: string`. O `render()` do React Email converte o componente JSX para HTML string compatível com email clients (inline styles, tabelas, etc.). Não é necessário configurar servidor de preview no projeto.

**ADR-2 — Número de WhatsApp do lead construído no servidor.**
O botão "Responder no WhatsApp" usa o telefone do próprio lead (não o número da Fase). Isso abre uma conversa pré-iniciada com uma mensagem amigável. O número é sanitizado (`replace(/\D/g, '')`) antes da URL.

**ADR-3 — Inline styles obrigatórios em email.**
React Email já usa inline styles na sua API (como o Gmail/Outlook exigem). Não usar classes Tailwind — o CSS não é injetado em email clients.

**ADR-4 — `@react-email/render` é async (`await render(...)`).**
Compatível com o contexto async de `sendLeadNotification`. Não muda o comportamento de "fire and forget" no `route.ts`.

---

## Checklist de Implementação

- [ ] 1. Instalar dependências:
  ```bash
  npm install @react-email/components @react-email/render
  ```

- [ ] 2. Criar diretório `src/emails/`

- [ ] 3. Criar `src/emails/LeadNotificationEmail.tsx`:
  - Header com fundo `#CD3438` e "FASE SPORT" em branco
  - Seção "Dados do contato": Nome, Telefone (link `tel:`), E-mail (se presente), Cidade
  - Seção "Pedido": Modalidade, Quantidade, Produto (se presente), Detalhes (se presente)
  - Separadores `<Hr>` entre seções
  - Botão "Responder no WhatsApp" (#25D366) abre `wa.me/{phone}?text=...`
  - Botão "Ver no painel" (#CD3438) aponta para `adminUrl`
  - Footer com "Fase Sport · Colatina, ES · fasesport.com.br"
  - Props: `lead`, `adminUrl`, `whatsappUrl`

- [ ] 4. Atualizar `src/lib/resend.ts`:
  - Adicionar import de `render` e `LeadNotificationEmail`
  - Construir `whatsappUrl` com telefone do lead sanitizado + mensagem pré-formatada
  - Construir `adminUrl` = `${process.env.NEXT_PUBLIC_APP_URL}/admin/leads`
  - Substituir a string HTML por `await render(<LeadNotificationEmail .../>)`
  - Remover a função `escapeHtml` (React Email lida com escape automaticamente)

- [ ] 5. Rodar `npm run type-check`

- [ ] 6. Testar localmente: submeter o formulário de orçamento em dev e verificar que o email enviado via Resend tem o template correto (usar o log do Resend dashboard ou um email de teste)

## Critérios de Aceitação

- [ ] `npm run type-check` limpo (sem erros de tipo no componente email)
- [ ] Email recebido após submit do formulário tem: nome do lead no subject, seções "Dados do contato" e "Pedido" visíveis, botões "Responder no WhatsApp" e "Ver no painel" funcionais
- [ ] Botão WhatsApp abre `wa.me/{telefone_do_lead}?text=...`
- [ ] Campos opcionais (email, cidade, produto, detalhes) não aparecem quando ausentes (conditional rendering)
- [ ] `npm run build` passa sem erros

---

## Notas

- `@react-email/components` v0.x exporta `Body`, `Button`, `Container`, `Head`, `Heading`, `Hr`, `Html`, `Preview`, `Row`, `Section`, `Text` — verificar nomes exatos na versão instalada
- Testar no Litmus ou Mail Tester após deploy para confirmar renderização no Gmail/Outlook
- Se `NEXT_PUBLIC_APP_URL` não estiver definido em dev, usar `http://localhost:3000` como fallback para o `adminUrl`
- O `render()` retorna `Promise<string>` no React Email v0.x — usar `await`
