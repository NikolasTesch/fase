# Admin — Dashboard de Métricas de Leads

> **Status:** `pendente`
> **ID:** `2026-06-13-admin-metricas-leads`
> **Criada em:** 2026-06-13
> **Agente:** arquiteto → implementador

---

## Contexto

O dashboard admin atual (`/admin/dashboard`) mostra apenas cards de contagem simples: total de produtos, categorias, depoimentos e leads. Isso era adequado durante o desenvolvimento, mas após o lançamento a equipe da Fase Sport precisará entender:

- Quais modalidades esportivas geram mais leads (para focar conteúdo e estoque)
- Em que fase do funil os leads param (NEW vs CONTACTED vs CLOSED_WON)
- Volume de leads ao longo do tempo (crescimento pós-lançamento)

Todos esses dados já existem na tabela `Lead` do banco. A implementação requer apenas queries Prisma com `groupBy` e `count` — sem integrações externas ou dependências novas.

**Impacto de não fazer:** a equipe usa o CMS como "caixa preta", sem visibilidade para decisões comerciais. Perde-se o valor operacional do sistema.

---

## Objetivos

- [ ] Adicionar seção "Métricas" ao dashboard admin com dados dos últimos 30 dias
- [ ] Exibir leads por modalidade (ranking + contagem)
- [ ] Exibir funil de conversão por status (NEW → CONTACTED → IN_PROGRESS → CLOSED_WON)
- [ ] Exibir volume diário de novos leads nos últimos 14 dias (sparkline ou tabela)
- [ ] Manter os cards de contagem atuais (não remover)

## Fora de escopo

- Integração com Google Analytics (dados de comportamento de sessão — requer API GA4 Data)
- Gráficos interativos com biblioteca externa (Chart.js, Recharts) — usar barras CSS simples
- Filtros por período customizável (apenas últimos 30 dias na V1)
- Exportação de dados para CSV
- Notificações/alertas de novos leads em tempo real

---

## Abordagem Técnica

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---|---|---|
| `src/app/(admin)/admin/dashboard/page.tsx` | modificar | Adicionar fetch das métricas + renderizar seção de métricas |
| `src/app/(admin)/admin/dashboard/_components/DashboardCards.tsx` | modificar | Manter cards existentes (pode precisar de ajuste de props) |
| `src/app/(admin)/admin/dashboard/_components/LeadMetrics.tsx` | criar | Componente Server Component com os 3 painéis de métricas |

### Queries Prisma necessárias

```typescript
const thirtyDaysAgo = new Date()
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

const [leadsBySport, leadsByStatus, recentLeads] = await Promise.all([
  // Leads por modalidade (últimos 30 dias)
  prisma.lead.groupBy({
    by: ['sport'],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: { sport: true },
    orderBy: { _count: { sport: 'desc' } },
  }),

  // Funil por status (todos os leads — não filtrar por data para ver funil completo)
  prisma.lead.groupBy({
    by: ['status'],
    _count: { status: true },
  }),

  // Últimos 14 dias: leads agrupados por data (PostgreSQL: DATE_TRUNC)
  // Usar query raw para agrupamento por dia:
  prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*) AS count
    FROM "Lead"
    WHERE "createdAt" >= NOW() - INTERVAL '14 days'
    GROUP BY 1
    ORDER BY 1 ASC
  `,
])
```

### Design dos componentes

**Leads por Modalidade** — lista ranqueada:
```
Modalidade       Leads (30 dias)   Barra visual
─────────────────────────────────────────────
Futebol          ████████████ 24   ████
Vôlei            ████████     16   ███
Basquete         ████         8    ██
...
```

**Funil de Conversão** — contagem por status:
```
● NOVOS          45   (100%)
● CONTATADOS     28    (62%)
● EM ANDAMENTO   12    (27%)
● GANHOS          7    (16%)
● PERDIDOS        3     (7%)
```

**Volume Diário (14 dias)** — mini sparkline em barras CSS:
```
Seg Ter Qua Qui Sex Sáb Dom ...
 │   │   ██  │   ██  │   │
 │   ██  ██  ██  ██  │   ██
 ██  ██  ██  ██  ██  ██  ██
```
(barras proporcionais ao valor máximo do período)

### Decisões técnicas (ADR)

**ADR-1 — Server Component, sem SWR nem estado cliente.**
Métricas do dashboard são consultadas uma vez no carregamento da página. Não há necessidade de polling ou atualização em tempo real na V1. Server Component com Prisma direto é mais simples e performático.

**ADR-2 — Barras visuais em CSS puro, sem biblioteca de gráficos.**
Recharts / Chart.js adicionam ~80-150kb ao bundle. Para o volume de dados esperado (≤ 8 modalidades, ≤ 5 status, ≤ 14 dias), barras com `width: ${(value/max * 100)}%` em Tailwind cobrem bem. Sem `"use client"`.

**ADR-3 — `prisma.$queryRaw` apenas para agregação por dia.**
`groupBy` do Prisma não suporta `DATE_TRUNC` nativamente. A raw query é mínima, segura (sem interpolação de user input) e necessária apenas para o sparkline.

**ADR-4 — Bigint do raw query convertido para Number.**
`prisma.$queryRaw` retorna `BigInt` para `COUNT(*)` no PostgreSQL. Converter com `Number(row.count)` antes de usar em JSX.

---

## Checklist de Implementação

- [ ] 1. Criar `src/app/(admin)/admin/dashboard/_components/LeadMetrics.tsx` como Server Component
- [ ] 2. Implementar as 3 queries Prisma descritas acima dentro do componente (ou em `page.tsx` e passar como props)
- [ ] 3. Renderizar "Leads por Modalidade" como lista com barras CSS proporcionais (`bg-brand`)
- [ ] 4. Renderizar "Funil por Status" com cores semânticas:
  - NEW: azul
  - CONTACTED: âmbar
  - IN_PROGRESS: laranja
  - CLOSED_WON: verde
  - CLOSED_LOST: vermelho
  - Labels em português: NEW→"Novo", CONTACTED→"Contatado", IN_PROGRESS→"Em andamento", CLOSED_WON→"Fechado (ganho)", CLOSED_LOST→"Fechado (perdido)"
- [ ] 5. Renderizar "Volume Diário" como grid de 14 colunas com barras verticais proporcionais
  - Converter `BigInt` para `Number` nos resultados da raw query
  - Calcular o máximo do período para normalizar as alturas
  - Exibir data abreviada (ex: "12/6") abaixo de cada barra
- [ ] 6. Adicionar `<LeadMetrics />` ao `page.tsx` do dashboard, após os cards existentes
- [ ] 7. Adicionar cabeçalho da seção: "Métricas — Últimos 30 dias" com data de referência dinâmica
- [ ] 8. Rodar `npm run type-check`

## Critérios de Aceitação

- [ ] Dashboard exibe a seção "Métricas" com 3 painéis abaixo dos cards existentes
- [ ] "Leads por Modalidade" lista pelo menos os esportes com leads, ordenados por volume
- [ ] "Funil de Conversão" mostra os 5 status com percentual em relação ao total de leads
- [ ] "Volume Diário" mostra 14 barras (uma por dia), com alturas proporcionais ao volume
- [ ] Quando não há leads nos últimos 30 dias, exibe empty state: "Nenhum lead recebido ainda"
- [ ] `npm run type-check` limpo (sem erro de tipagem no BigInt → Number)
- [ ] Página carrega em < 800ms (verificar com DevTools Network)

---

## Notas

- A query raw usa `DATE_TRUNC` — confirmar que o Neon (PostgreSQL) suporta (suporta — é padrão SQL)
- O BigInt retornado pelo Prisma raw query não serializa em JSON automaticamente — converter para `Number()` antes de passar para Client Components (se houver)
- Os cards de contagem atuais (`DashboardCards.tsx`) não devem ser removidos — as métricas são complementares
- Pós-V1: considerar cache ISR ou `unstable_cache` do Next.js se o dashboard ficar lento com muitos leads
