# Fase Sport

Plataforma web de catálogo e conversão para a Fase Sport, loja de uniformes esportivos personalizados em Colatina-ES. O objetivo é transformar visitantes em pedidos, direcionando o cliente para o WhatsApp ou para o formulário de orçamento, com suporte de um painel administrativo completo.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000000)

---

## Sumário

- [Features](#features)
- [Stack e Arquitetura](#stack-e-arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Screenshots](#screenshots)
- [Começando](#começando)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Testes](#testes)
- [Deploy](#deploy)

---

## Features

### Site público (Marketing)

- **Homepage completa**: hero com CTAs, carrossel de uniformes em destaque, categorias em destaque, depoimentos em carrossel, FAQ, seção Instagram, seção "Como funciona" e CTA de orçamento.
- **Páginas de categoria**: listagem de produtos com filtro por subcategoria, hero, FAQ da modalidade e CTAs.
- **Página de produto**: galeria com thumbnails, especificações, tabela de medidas, CTA de WhatsApp e orçamento, simulador de uniforme (opcional) e exibição da **arte do produto**.
- **Busca de produtos**: página `/busca` com resultados por `?q=`.
- **Orçamento multi-step**: formulário em 3 etapas (Modalidade → Personalização → Contato) com validação client e server-side.
- **Páginas institucionais**: "Como funciona", "Empresarial" (segmentos corporativos) e páginas legais (Privacidade, Termos).
- **Chat Fabi**: assistente virtual com RAG que responde sobre catálogo, tecidos, prazos e tabelas de medidas, faz a triagem (esporte, item, quantidade, nome, telefone) e gera um link pré-preenchido de WhatsApp. Funciona com provider opencode-go/OpenAI-compatível, OpenRouter ou em modo local por regras, sem necessidade de chave.

### Conversão

- CTAs de WhatsApp com mensagem pré-formatada por produto (link `wa.me`).
- WhatsApp FAB flutuante no site público.
- Formulário de orçamento que gera lead e notifica a equipe de vendas por e-mail (Resend).
- Rastreamento de eventos de conversão (`whatsapp_click`, `simulator_click`, `orcamento_step`, `lead_submit`) via GTM, respeitando o consentimento de cookies (LGPD).

### Painel Admin (RBAC T1/T2)

- **Autenticação**: JWT (`jose`) + `bcryptjs`, cookie HttpOnly, guard em proxy edge e rate limit de login.
- **RBAC**: papel `T1_GERENCIA` com acesso total e `T2_VENDEDOR` (sem módulos no momento); revogação imediata por requisição, com consulta ao banco.
- **Produtos**: CRUD com formulário em seções/cards, slug automático, upload de imagens (WebP no R2) com "definir como principal", grade de cards, paginação e campos de SEO.
- **Artes**: cada produto tem uma arte atrelada, com preview WebP público no R2 e o arquivo original (`.cdr`/`.svg`/`.pdf`) no R2. Upload via presigned URL para arquivos grandes e download autenticado por stream. Página `/admin/artes` para baixar as artes de todos os produtos.
- **CRUD completo de conteúdo**: categorias, subcategorias, medidas (tabelas de tamanho), modalidades, depoimentos, FAQs, Instagram e leads.
- **Leads**: gestão com status (Novo, Contactado, Em progresso, Fechado ganho, Fechado perdido) e paginação.
- **Usuários**: gestão de usuários admin (criar, editar, desativar, reset de senha, restrito a T1).
- **Chat Analytics**: métricas de conversas do chat Fabi.
- **Segurança**: CSRF em todas as mutations, rate limiting (Upstash, fail-closed), validação Zod e sanitização.

### SEO e Performance

- **SSR + ISR**: páginas públicas com `revalidate` de 3600s e `unstable_cache` para o catálogo; mutations admin invalidam o cache (`revalidateCatalog()`).
- **Meta tags dinâmicas**: Open Graph, Twitter Cards e OG image gerada por categoria e produto.
- **JSON-LD**: schemas `Product`, `BreadcrumbList`, `LocalBusiness` e `FAQPage`.
- **`sitemap.xml` e `robots.txt`** dinâmicos, com `/admin/` bloqueado.
- **Server Components por padrão**, com `"use client"` apenas onde há interatividade.

---

## Stack e Arquitetura

| Camada | Tecnologia | Papel |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, Server Components, ISR, API Routes e proxy edge |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui | Componentes acessíveis e design system próprio (tokens da marca FASE) |
| Linguagem | TypeScript 5 (strict) | Type safety full-stack |
| ORM | Prisma 7 (adapter `pg`) | Acesso type-safe ao banco, singleton em `src/lib/db.ts` |
| Banco de dados | Neon Postgres (serverless) | Dados persistentes |
| Storage | Cloudflare R2 (AWS SDK v3) | Imagens de produtos/categorias, previews e originais de arte |
| Autenticação | `jose` (JWT) + `bcryptjs` | Login admin com cookie HttpOnly e RBAC T1/T2 |
| E-mail | Resend + React Email | Notificação de leads para a equipe de vendas |
| Rate limiting | Upstash Redis | Limiters fail-closed (contato, chat, login, admin, upload, stream) |
| Validação | Zod 4 | Schemas compartilhados entre client e server |
| Chat RAG | Provider LLM (opencode-go/OpenRouter) com fallback local | Motor do assistente Fabi |
| Animações | Framer Motion 12 | Micro-interações e animações em viewport, com respeito a `prefers-reduced-motion` |
| Testes | Vitest 4 + Playwright | Testes unitários e E2E |
| Deploy | Vercel + GitHub Actions | CI/CD automático |

**Arquitetura**: monolito modular no Next.js 16 App Router. O catálogo é renderizado via Server Components com Prisma (RSC/ISR), sem rotas de API públicas para produtos. O painel admin é protegido por um proxy (`src/proxy.ts`, a convenção `middleware` foi renomeada no Next 16) que valida o JWT em `/admin/*` e `/api/admin/*`, com autorização reforçada por requisição no servidor. Mídia fica no Cloudflare R2 (uploads diretos via presigned URL para arquivos grandes), e o chat Fabi usa um pipeline RAG com function calling e captura automática de leads.

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (marketing)/          # Site público
│   │   ├── [categoria]/      #   Página de categoria e produto (SSG + ISR)
│   │   ├── busca/            #   Busca de produtos
│   │   ├── como-funciona/    #   Página institucional
│   │   ├── empresarial/      #   Segmentos corporativos
│   │   ├── orcamento/        #   Formulário multi-step
│   │   ├── privacidade/      #   Política de privacidade / LGPD
│   │   └── termos/           #   Termos de uso
│   ├── (admin)/              # Painel administrativo
│   │   └── admin/
│   │       ├── (t1)/         #   Módulos restritos a T1 (produtos, artes, leads,
│   │       │                 #   usuários, categorias, medidas, modalidades,
│   │       │                 #   depoimentos, FAQs, Instagram, chat-analytics)
│   │       └── sem-acesso/   #   Fallback para papéis sem módulos
│   └── api/                  # API Routes (/api/contact, /api/chat/fabi, /api/admin/*)
├── components/
│   ├── ui/                   #   Componentes shadcn/ui
│   ├── layout/               #   Navbar, Footer, SearchForm, WhatsApp FAB
│   ├── sections/             #   Seções da homepage
│   ├── products/             #   Cards, galeria, CTAs de produto
│   ├── forms/                #   OrcamentoForm, ContactForm
│   ├── chat/                 #   Widget do chat Fabi (SSE)
│   └── analytics/            #   GTM, consentimento, tracking
├── lib/
│   ├── rag/                  #   Motor do chat Fabi (contexto, provider, tools)
│   ├── validations/          #   Schemas Zod
│   ├── db.ts                 #   Singleton do Prisma
│   ├── auth.ts               #   RBAC (requireAdmin, requireT1Admin, matcher)
│   ├── r2.ts                 #   Cliente Cloudflare R2
│   ├── ratelimit.ts          #   Limiters Upstash
│   └── seo.ts                #   JSON-LD e metadata
├── emails/                   # Templates React Email (notificação de lead)
└── __tests__/                # Testes unitários Vitest
prisma/
├── schema.prisma             # Schema do banco
└── seed.ts                   # Seed (admin T1, vendedor opcional, catálogo demo)
tests/
├── e2e/                      # Testes Playwright (fluxos de conversão, auth, chat)
└── fixtures/
public/                       # Assets estáticos
proxy.ts                      # Guard JWT de /admin e /api/admin (Next 16)
```

---

## Screenshots

_Em breve. Substitua os placeholders abaixo por capturas reais da homepage, da página de produto e do painel admin._

```
![Homepage](docs/screenshots/homepage.png)
![Página de produto](docs/screenshots/produto.png)
![Painel admin](docs/screenshots/admin.png)
```

---

## Começando

### Pré-requisitos

- Node.js 20+ (definido em `engines` e `.nvmrc`)
- Conta no Neon (Postgres serverless) ou um Postgres local
- (Opcional) Bucket no Cloudflare R2, chave da Resend e Redis no Upstash para usar todos os recursos

### Instalação

```bash
npm install
cp .env.example .env.local   # preencha as variáveis abaixo
```

### Setup do banco

O projeto usa `prisma db push` (sem migrations versionadas). A URL do banco vive em `prisma.config.ts`.

```bash
npx prisma generate
npx prisma db push
```

### Seed

O seed cria o usuário admin (T1) e, se as variáveis `SELLER_SEED_*` estiverem definidas, um vendedor demo (T2). Ele também popula o catálogo com dados de demonstração (categorias, produtos, depoimentos, FAQs, modalidades e medidas).

```bash
npx prisma db seed
```

### Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`. O painel admin fica em `/admin`.

---

## Variáveis de Ambiente

Configure todas as variáveis no painel da Vercel (Settings → Environment Variables) para os ambientes **Production** e **Preview**.

### Banco de dados (Neon)

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Neon Postgres (pooled) |

### Storage (Cloudflare R2)

| Variável | Descrição |
|---|---|
| `R2_ACCOUNT_ID` | ID da conta Cloudflare |
| `R2_ACCESS_KEY_ID` | Access key do bucket R2 |
| `R2_SECRET_ACCESS_KEY` | Secret key do bucket R2 |
| `R2_BUCKET_NAME` | Nome do bucket (ex: `fase-media`) |
| `NEXT_PUBLIC_R2_URL` | URL pública do bucket (ex: `https://media.fasesport.com`) |

As artes (preview WebP + arquivo original `.cdr`/`.svg`/`.pdf`) são armazenadas no R2. O preview é público; o original é servido por stream autenticado na rota de download.

### E-mail (Resend)

| Variável | Descrição |
|---|---|
| `RESEND_API_KEY` | API key do Resend |
| `EMAIL_FROM` | Remetente (ex: `noreply@fasesport.com`) |
| `EMAIL_TO_SALES` | Destinatário dos leads (ex: `vendas@fasesport.com`) |

### Autenticação admin (JWT)

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Secret para assinar tokens (mín. 32 caracteres aleatórios) |
| `JWT_EXPIRES_IN` | Expiração do token (ex: `7d`) |

### Rate limiting (Upstash Redis)

| Variável | Descrição |
|---|---|
| `UPSTASH_REDIS_REST_URL` | URL REST do Upstash Redis |
| `UPSTASH_REDIS_REST_TOKEN` | Token de autenticação do Upstash |

As rotas de contato e chat são **fail-closed**: sem o Redis configurado, retornam `503`. O login admin é tolerante a falhas do Redis (usa o fallback do limiter e permite a requisição).

### Integrações públicas

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp sem formatação (ex: `5527999999999`) |
| `NEXT_PUBLIC_SIMULATOR_URL` | URL do simulador de uniforme (opcional) |
| `NEXT_PUBLIC_APP_URL` | URL canônica do site (ex: `https://fasesport.com.br`) |

### Chat Fabi (RAG / IA)

O widget de chat usa um provedor LLM para responder. Sem nenhuma chave configurada, a Fabi opera em **modo local** (motor por regras, sem IA). Escolha um provedor:

| Variável | Descrição |
|---|---|
| `AI_PROVIDER` | `opencode-go` (padrão) · `openrouter` · `local` |
| `OPENROUTER_API_KEY` | Chave da API do OpenRouter (para `openrouter`) |
| `OPENROUTER_MODEL` | Modelo no OpenRouter (padrão: `meta-llama/llama-3.3-70b-instruct:free`) |
| `OPENCODE_GO_API_KEY` | Chave para o provider opencode-go / OpenAI-compatível |
| `OPENCODE_GO_MODEL` | Modelo do provider opencode-go (padrão: `opencode-go/deepseek-v4-flash`) |
| `OPENCODE_GO_BASE_URL` | Base URL alternativa (padrão: `https://api.openai.com/v1`) |
| `OPENAI_API_KEY` | Alternativa OpenAI-compatível (usada como fallback de `OPENCODE_GO_API_KEY`) |
| `OPENAI_BASE_URL` | Base URL OpenAI (opcional) |
| `DEEPSEEK_API_KEY` | Alternativa DeepSeek (fallback do provider opencode-go) |

### Seed (usuários demo)

Defina as variáveis abaixo antes de rodar `npx prisma db seed`. O seed cria o admin (T1) sempre; o vendedor (T2) é criado apenas se as variáveis `SELLER_SEED_*` estiverem definidas.

| Variável | Descrição |
|---|---|
| `ADMIN_SEED_EMAIL` | E-mail do usuário admin (T1) |
| `ADMIN_SEED_PASSWORD` | Senha do admin |
| `SELLER_SEED_EMAIL` | E-mail do vendedor demo (T2, opcional) |
| `SELLER_SEED_PASSWORD` | Senha do vendedor demo (opcional) |

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | `prisma generate` + build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript sem emitir (`tsc --noEmit`) |
| `npm run test:unit` | Vitest (testes unitários) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Playwright E2E (requer servidor rodando) |
| `npm run test:e2e:ui` | Playwright com UI interativa |

---

## Testes

### Unitários (Vitest)

Cobrem funções puras e validações: schemas Zod (contato, login), guard do WhatsApp, utilitários do site, RBAC matcher e o formulário de orçamento multi-step.

### E2E (Playwright)

Cobrem os fluxos de conversão (homepage → categoria → produto → WhatsApp), o formulário de orçamento completo, autenticação admin, chat Fabi e gestão de produtos no painel.

Os testes E2E de **artes** exigem credenciais reais do R2. Sem elas, esses testes são **pulados** automaticamente (`test.skip`), permitindo que a suíte rode em ambientes sem acesso ao storage.

---

## Deploy

O projeto é publicado automaticamente na Vercel via GitHub Actions a cada push na branch `main`. O pipeline valida lint, typecheck, testes unitários e o build antes de publicar.

Para deploy manual:

```bash
vercel --prod
```

> **Nota:** no CI e no deploy, configure as variáveis do R2 (`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`) e a `NEXT_PUBLIC_R2_URL`. Os uploads de imagens e artes usam presigned URLs, então o bucket deve permitir escrita pelo par de credenciais configurado. Sem as credenciais do R2, os uploads e os testes de arte ficam indisponíveis, mas o restante da aplicação funciona normalmente.
