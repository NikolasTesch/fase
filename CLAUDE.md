@AGENTS.md

---

# ⚠️ Fluxo Obrigatório: Spec-First

**NENHUMA feature, mudança de regra de negócio ou refatoração não-trivial é implementada sem uma spec aprovada pelo usuário.**

## Ciclo de vida de uma spec

```
1. arquiteto elabora a spec
        ↓
   salva em specs/pendentes/YYYY-MM-DD-[slug].md
        ↓
2. usuário APROVA (pode pedir ajustes antes)
        ↓
   spec é movida para specs/em-andamento/
        ↓
3. implementador executa a spec
        ↓
4. revisor valida a implementação
        ↓
   spec é movida para specs/finalizadas/
```

## Onde ficam as specs

```
specs/
  TEMPLATE.md       ← template base para toda nova spec
  pendentes/        ← aguardando aprovação do usuário
  em-andamento/     ← aprovada, implementação em curso
  finalizadas/      ← implementada e revisada
```

## Regras invioláveis

1. **Spec antes de código.** Se não existe spec aprovada, o arquiteto cria a spec e para. O implementador não toca no código até o usuário aprovar.
2. **Specs pendentes não são implementadas.** Mesmo que pareça óbvio, aguardar aprovação explícita do usuário.
3. **Specs finalizadas são imutáveis.** Se algo mudou, cria-se uma nova spec — nunca edita uma finalizada.
4. **O implementador cita a spec no commit.** Ex: `feat: implementa SEC-1 e SEC-2 (2026-06-12-ds-alignment)`
5. **O arquiteto usa `specs/TEMPLATE.md` como base.** Preencher todos os campos: contexto, objetivos, fora de escopo, arquivos afetados, checklist, critérios de aceitação.
6. **Mudanças pequenas e óbvias** (fix de typo, renomear variável, ajuste de cor pontual) podem ser feitas sem spec — use bom senso. Em dúvida, crie a spec.

## Documentação

A pasta `docs/` contém documentação técnica e de produto. Ver `docs/index.md` para o índice.

---

# Fase Sport — Contexto do Projeto

Plataforma web de catálogo e conversão para a Fase Sport, loja de uniformes esportivos personalizados em Colatina-ES.

## Stack instalada

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js App Router | 16.2.9 |
| UI | React | 19.2.4 |
| Estilização | Tailwind CSS | 4.x |
| Componentes | shadcn/ui + @base-ui/react | latest |
| Animações | Framer Motion | 12.x |
| ORM | Prisma | 7.x |
| Validação | Zod | 4.x |
| Forms | React Hook Form + @hookform/resolvers | 7.x / 5.x |
| Auth (JWT) | jose | 6.x |
| Hash | bcryptjs | 3.x |
| E-mail | Resend | 6.x |
| Storage | AWS SDK v3 (Cloudflare R2) | 3.x |
| Rate limit | @upstash/ratelimit + @upstash/redis | 2.x / 1.x |
| State | Zustand | 5.x |
| Data fetch | SWR | 2.x |
| Testes unit | Vitest | 4.x |
| Testes E2E | Playwright | 1.x |

## Fontes

Definidas no `layout.tsx` raiz via `next/font/google`:
- `--font-inter` → Inter (body)
- `--font-barlow-condensed` → Barlow Condensed (headings/display)
- `--font-geist-mono` → Geist Mono (código)

## Documentos de referência

| Documento | Conteúdo |
|---|---|
| `prd.md` | Requisitos de produto, personas, fluxos de conversão |
| `spec.md` | Spec técnica: arquitetura, schema Prisma, API contracts, padrões de código |

## Estado atual (Junho 2026)

**V1 completa (28 specs finalizadas).** Todo o código de produção está implementado.

### O que está pronto

- **Backend/API:** todas as rotas públicas e admin, auth JWT, rate limiting, Resend, R2
- **CMS Admin:** login, dashboard (métricas de leads), produtos (CRUD + upload), categorias, depoimentos, FAQs, leads com filtro de status
- **Frontend público:** homepage (Hero, Categorias, Destaques, Como Funciona, Por que a Fase, Depoimentos, Contato+Mapa, CTA Banner), páginas de categoria (SSG, filtro subcategoria, FAQ, CTA simulador), páginas de produto (galeria, WhatsApp CTA, simulador), orçamento (form multi-step 3 passos, maskPhone, a11y), como-funciona, busca, privacidade
- **SEO:** sitemap dinâmico, robots, JSON-LD (LocalBusiness, Product, BreadcrumbList, FAQPage), OG/Twitter cards, OG images dinâmicas por categoria e produto
- **Analytics:** GA4 + GTM via `@next/third-parties`, banner LGPD, eventos rastreados (whatsapp_click, simulator_click, orcamento_step, lead_submit)
- **Testes:** Vitest unit tests (`src/__tests__/`) + Playwright E2E (Fluxos A e B + admin auth) + CI/CD GitHub Actions
- **Segurança:** headers (vercel.json), middleware JWT, rate limit, guard WhatsApp URL

### Bloqueadores para lançamento (não-código)

1. Imagens reais de produtos no R2 (ALTA)
2. Variáveis de ambiente de produção configuradas no Vercel (BLOQUEANTE)
3. Conteúdo real: depoimentos, FAQ, informações de contato

### Próxima fase — melhorias (specs em `specs/pendentes/`)

Animações Framer Motion, carrossel de depoimentos com foto do material, seção Instagram, hero com imagens reais por categoria, carrossel de destaques, landing empresarial.

Ver `spec.md` §18 para a lista completa.

