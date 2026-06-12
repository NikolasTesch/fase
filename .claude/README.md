# .claude — Configuração do projeto Fase Sport

Pasta de configuração do Claude Code para este projeto, organizada para um fluxo
**SDD (Spec-Driven Development)**.

## Fonte da verdade (SDD)

A implementação deve sempre derivar destes documentos, nesta ordem:

1. [`../prd.md`](../prd.md) — **Product Requirements** (o quê e por quê)
2. [`../spec.md`](../spec.md) — **Technical Spec** (como — stack, dados, API, padrões)

Qualquer divergência entre código e spec deve ser resolvida atualizando a spec
**antes** de codar, não depois.

## Estrutura

```
.claude/
├── README.md      ← este arquivo
├── skills/        ← skills locais do projeto (se houver)
└── commands/      ← slash commands do projeto (se houver)
```

## Plugins / Skills externos

- **UI UX Pro Max** — plugin externo de marketplace (instalar via `/plugin`).
  Usado para guiar decisões de UI/UX e micro-interações da landing page.

## Stack instalada

Ver `package.json`. Destaques: Next.js (App Router) · React · TypeScript ·
Tailwind CSS · Framer Motion · Prisma · Zod · React Hook Form · Zustand.
