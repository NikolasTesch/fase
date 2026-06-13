# Admin — WhatsApp Quick Reply e Ações Rápidas nos Leads

> **Status:** `pendente`
> **ID:** `2026-06-13-admin-whatsapp-quick-reply`
> **Criada em:** 2026-06-13
> **Agente:** implementador

---

## Contexto

A página `/admin/leads` tem um painel lateral que exibe os detalhes do lead. Atualmente, para responder a um lead, o vendedor precisa:
1. Copiar o telefone manualmente do painel
2. Abrir o WhatsApp Web
3. Colar o número
4. Digitar a mensagem

Esse atrito ocorre em 100% dos atendimentos. Um botão "Responder no WhatsApp" que abre o WhatsApp Web com número e mensagem pré-formatados reduz esse processo a 1 clique.

Adicionalmente, o telefone e o email no painel são texto estático — deveriam ser links clicáveis (`tel:`, `mailto:`) para facilitar uso em mobile.

**Impacto de não fazer:** equipe de vendas perde tempo a cada lead, aumentando o tempo de resposta ao cliente.

---

## Objetivos

- [ ] Adicionar botão "Responder no WhatsApp" no painel lateral do lead (abre `wa.me/` com mensagem pré-formatada)
- [ ] Tornar o telefone do lead um link `tel:` clicável
- [ ] Tornar o email do lead um link `mailto:` clicável (quando presente)
- [ ] Adicionar botão de cópia (clipboard) para telefone e email

## Fora de escopo

- Integração com WhatsApp Business API (envio de template messages) — V2
- Histórico de mensagens enviadas pelo admin
- Notificação em tempo real de novos leads (WebSocket/SSE)
- Múltiplos templates de mensagem configuráveis

---

## Abordagem Técnica

### Arquivo afetado

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(admin)/admin/leads/page.tsx` | modificar | Adicionar CTA WhatsApp, links clicáveis e botões de cópia no painel lateral |

### Botão WhatsApp

URL gerada no cliente:

```typescript
function buildLeadWhatsAppUrl(lead: Lead): string {
  const phone = lead.phone.replace(/\D/g, '')
  const message = encodeURIComponent(
    `Olá ${lead.name}! Recebemos seu pedido de orçamento de uniforme de ${lead.sport} pelo site da Fase Sport. Podemos conversar sobre os detalhes?`
  )
  return `https://wa.me/${phone}?text=${message}`
}
```

- Abre em nova aba (`target="_blank"`)
- Ícone WhatsApp (SVG inline simples, verde `#25D366`)
- Texto: "Responder no WhatsApp"

### Links clicáveis no painel

```tsx
// Telefone:
<a href={`tel:${lead.phone.replace(/\D/g, '')}`} className="text-foreground hover:underline">
  {lead.phone}
</a>

// E-mail (quando presente):
<a href={`mailto:${lead.email}`} className="text-foreground hover:underline">
  {lead.email}
</a>
```

### Botão de cópia (clipboard)

```tsx
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  
  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button onClick={handleCopy} title="Copiar" className="ml-1 text-muted-foreground hover:text-foreground">
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}
```

### Layout do painel lateral após a mudança

```
┌──────────────────────────────┐
│  João Silva          ● Novo  │  ← header (sem mudança)
│                          [X] │
├──────────────────────────────┤
│  E-MAIL                      │
│  joao@gmail.com [📋] ← link  │
│                              │
│  TELEFONE                    │
│  (27) 99999-9999 [📋] ← link │
│                              │
│  CIDADE                      │
│  Colatina - ES               │
│                              │
│  MODALIDADE                  │
│  Futebol                     │
│                              │
│  QUANTIDADE                  │
│  20                          │
│                              │
│  DETALHES                    │
│  Quero em azul e branco...   │
├──────────────────────────────┤
│  [🟢 Responder no WhatsApp]  │  ← NOVO
├──────────────────────────────┤
│  ALTERAR STATUS              │
│  [select dropdown]           │
└──────────────────────────────┘
```

### Decisões técnicas (ADR)

**ADR-1 — Gerar URL WhatsApp no cliente, não no servidor.**
A URL WhatsApp é gerada dinamicamente com base nos dados do lead já carregados no estado. Não requer chamada de API adicional — é uma transformação local.

**ADR-2 — `Copy` icon de `lucide-react`, já instalado.**
O projeto usa lucide-react (via shadcn). Importar `Copy` e `Check` de `lucide-react`.

**ADR-3 — Telefone sem formatação no `tel:` link.**
`tel:` links funcionam melhor sem espaços ou parênteses. Sanitizar: `lead.phone.replace(/\D/g, '')`. Exibir o número formatado como texto, mas usar o sanitizado no href.

---

## Checklist de Implementação

- [ ] 1. Em `src/app/(admin)/admin/leads/page.tsx`, criar função `buildLeadWhatsAppUrl(lead: Lead): string` (fora do componente)

- [ ] 2. Criar componente local `CopyButton({ value: string })` com:
  - Estado `copied` (boolean) com timeout de 2s
  - Ícone `Copy` (padrão) e `Check` (quando copied) de `lucide-react`
  - `navigator.clipboard.writeText(value)` no click

- [ ] 3. No painel lateral (seção `<dl>`), substituir os campos de E-mail e Telefone de texto simples para links clicáveis + botão de cópia:
  ```tsx
  // E-mail
  <a href={`mailto:${selected.email}`}>{ selected.email }</a>
  <CopyButton value={selected.email} />
  
  // Telefone
  <a href={`tel:${selected.phone.replace(/\D/g, '')}`}>{ selected.phone }</a>
  <CopyButton value={selected.phone} />
  ```

- [ ] 4. Adicionar botão "Responder no WhatsApp" **acima** do seletor de status:
  ```tsx
  <a
    href={buildLeadWhatsAppUrl(selected)}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 w-full justify-center rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1ebe59] transition-colors"
  >
    {/* SVG WhatsApp icon */}
    Responder no WhatsApp
  </a>
  ```
  SVG WhatsApp (24px, fill white):
  ```svg
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
  ```

- [ ] 5. Ajustar o `px-5 pb-5` do bloco de "Alterar status" para `px-5 pt-3 pb-5` (já que o botão WhatsApp está acima com seu próprio padding)

- [ ] 6. Rodar `npm run type-check`

## Critérios de Aceitação

- [ ] Clicar em "Responder no WhatsApp" abre `wa.me/{telefone_do_lead}?text=...` em nova aba
- [ ] A mensagem pré-formatada inclui o nome do lead e a modalidade
- [ ] Clicar no telefone no painel abre o discador (mobile) ou o app padrão de chamada
- [ ] Clicar no email abre o cliente de email com o campo "Para" preenchido
- [ ] Botões de cópia colocam o valor no clipboard e mostram ícone de check por 2s
- [ ] `npm run type-check` limpo

---

## Notas

- O `lead.phone` salvo no banco pode ter formatação variada (usuário digitou "(27) 99999-9999"). Sanitizar sempre com `replace(/\D/g, '')` antes de usar em URLs
- Verificar se `navigator.clipboard` está disponível (requer HTTPS ou localhost) — em produção no Vercel é HTTPS por padrão
- A cor `#25D366` é a cor oficial do WhatsApp; `#1ebe59` para hover
- `rel="noopener noreferrer"` obrigatório em links `target="_blank"` (segurança)
