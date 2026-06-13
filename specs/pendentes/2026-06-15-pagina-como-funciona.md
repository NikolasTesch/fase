# Página "Como Funciona"

> **Status:** `pendente`
> **ID:** `2026-06-15-pagina-como-funciona`
> **Criada em:** 2026-06-12
> **Agente:** arquiteto

---

## Contexto

O PRD §4.1.3 prevê uma página de processo que reduz a fricção do comprador (prazo, quantidade mínima, formas de pagamento) — ausente hoje. É linkada pelo Footer (spec `2026-06-13-layout-publico`) e por CTAs da homepage. Combina conteúdo estático (etapas) com FAQ dinâmica vinda do banco (`Faq` com `categoryId = null`).

## Objetivos

- [ ] Criar `src/app/(marketing)/como-funciona/page.tsx` (Server Component)
- [ ] Seção de processo em 4 etapas com ícones lucide
- [ ] FAQ global em acordeão (Prisma: `categoryId: null, isActive: true`, ordenada por `sortOrder`)
- [ ] CTA final para `/orcamento`
- [ ] `metadata` estático para SEO

## Fora de escopo

- FAQ por modalidade (fica nas páginas de categoria — iteração futura)
- CMS da FAQ (admin já existe em `/admin/faqs`)
- Mapa/embed Google Maps

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(marketing)/como-funciona/page.tsx` | criar | Server Component. Exporta `const metadata`. Query `prisma.faq.findMany`. Monta Hero + `ProcessSteps` + `FaqAccordion` + CTA |
| `src/components/sections/ProcessSteps.tsx` | criar | Server Component. Array estático de 4 etapas (ícone lucide + número + título + texto), layout horizontal desktop / vertical mobile |
| `src/components/sections/FaqAccordion.tsx` | criar | `"use client"`. Acordeão acessível (expand/collapse, navegável por teclado). Recebe `faqs: { question: string; answer: string }[]`. Usar `@base-ui/react` Accordion se disponível; fallback `<details>/<summary>` nativo |

### Decisões técnicas (ADR)

**Acordeão como ilha cliente.** Expandir/colapsar precisa de estado → `"use client"`. A page e os passos permanecem Server Components. Isolar o acordeão em `FaqAccordion` mantém o resto SSR.

**FAQ do banco, não hardcoded.** Permite a equipe Fase editar via `/admin/faqs` (filtro "Global", `categoryId = null`). Se vazio, a seção FAQ é omitida graciosamente (renderização condicional).

**`metadata` estático.** Conteúdo institucional fixo — basta exportar `const metadata: Metadata = { title: ..., description: ... }`. Sem `generateMetadata` dinâmico.

**4 etapas (não 3).** A homepage usa versão resumida de 3 passos. Esta página detalha o processo completo: Escolha o Modelo → Personalize → Confirme o Pedido → Receba.

**Usar `@base-ui/react` Accordion se exportado pelo pacote.** Verificar `node_modules/@base-ui/react` antes de implementar; se não tiver Accordion, usar `<details>/<summary>` que é acessível nativamente sem JS.

---

## Checklist de Implementação

- [ ] 1. Criar `src/components/sections/ProcessSteps.tsx` com array de 4 etapas e ícones lucide
- [ ] 2. Criar `src/components/sections/FaqAccordion.tsx` (`"use client"`, acessível por teclado, animação com `useReducedMotion`)
- [ ] 3. Criar `src/app/(marketing)/como-funciona/page.tsx`:
  - Exportar `const metadata` com título e descrição
  - Query `prisma.faq.findMany({ where: { categoryId: null, isActive: true }, orderBy: { sortOrder: 'asc' } })`
  - Renderizar: Hero estático → `ProcessSteps` → `FaqAccordion` (condicional) → CTA `/orcamento`
- [ ] 4. Tratar FAQ vazia: se `faqs.length === 0`, omitir seção inteiramente

## Critérios de Aceitação

- [ ] `/como-funciona` renderiza as 4 etapas do processo com ícones
- [ ] FAQs com `categoryId = null` e `isActive: true` aparecem no acordeão
- [ ] FAQs com `categoryId` preenchido ou `isActive: false` não aparecem
- [ ] Clicar numa pergunta expande a resposta; clicar novamente fecha
- [ ] Acordeão é navegável por teclado (Enter/Space para abrir/fechar)
- [ ] Com FAQ vazia no banco, a seção é omitida sem erro
- [ ] CTA final navega para `/orcamento`
- [ ] `<title>` e `<meta description>` definidos na página
- [ ] `npx tsc --noEmit` sem erros

---

## Notas

- Link esperado no Footer: "Como Funciona" → `/como-funciona`.
- Confirmar ícones disponíveis em `lucide-react@^1.17.0` (ex.: `Search`, `Palette`, `ClipboardCheck`, `Truck`).
- Verificar se `@base-ui/react` exporta `Accordion` antes de usá-lo; se não, `<details>` é a escolha segura.
