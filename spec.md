# Fase Sport — Technical Specification

> **Versão:** v1.0 — Junho 2025
> **Status:** Rascunho para Revisão
> **Stack:** TypeScript · React · Next.js · Node · Vercel · Neon · Cloudflare R2

---

## Sumário

8. [Visão Arquitetural](#8-visão-arquitetural)
9. [Stack Tecnológica](#9-stack-tecnológica)
10. [Estrutura do Projeto](#10-estrutura-do-projeto)
11. [Modelagem de Dados](#11-modelagem-de-dados)
12. [API Endpoints](#12-api-endpoints)
13. [Ambiente de Desenvolvimento (Docker)](#13-ambiente-de-desenvolvimento-docker)
14. [Deploy e Infraestrutura de Produção](#14-deploy-e-infraestrutura-de-produção)
15. [Padrões de Código e Convenções](#15-padrões-de-código-e-convenções)
16. [Estratégia de Testes](#16-estratégia-de-testes)
17. [Checklist de Lançamento](#17-checklist-de-lançamento)

---

## 8. Visão Arquitetural

### 8.1 Arquitetura Geral

Arquitetura **Monolito Modular** — Frontend + Backend API no mesmo repositório Next.js.

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                  │
│  Next.js 16 App Router (TypeScript + React 19)       │
│  Tailwind CSS + shadcn/ui + Framer Motion            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / Server Actions
┌──────────────────────▼──────────────────────────────┐
│               NEXT.JS API ROUTES (Node.js)           │
│  /api/contact  /api/chat/fabi   /api/admin/*         │
└───────┬────────────────────────┬────────────────────┘
        │                        │
┌───────▼───────┐      ┌─────────▼───────────┐
│  NEON (Postgres│      │  CLOUDFLARE R2       │
│  Serverless)   │      │  (Imagens / Assets)  │
└───────────────┘      └─────────────────────┘

Deploy: Vercel (Edge Functions + CDN)
Local:  Docker Compose (Next.js + PostgreSQL)
```

### 8.2 Decisões Técnicas

| Decisão | Justificativa |
|---|---|
| **Next.js 16 App Router** | SSR nativo para SEO. Server Components para performance. Server Actions para forms. Edge Runtime para velocidade. |
| **TypeScript Strict** | Type safety em todo o projeto. Zod para validação de schema. Tipos compartilhados entre frontend e backend. |
| **Tailwind CSS + shadcn/ui** | Design system consistente. shadcn/ui fornece componentes acessíveis e customizáveis sem lock-in de biblioteca. |
| **Prisma ORM** | Type-safe database access. Migrations automáticas. Suporte nativo ao PostgreSQL (Neon). Schema como fonte de verdade. |
| **Cloudflare R2** | S3-compatible. Zero egress fees. Worker para otimização de imagem on-the-fly (resize, WebP conversion). |
| **Google Drive (artes)** | Arte 1:1 por produto: arquivo original vetorial (`.cdr`/`.svg`/`.pdf`) em pasta privada via service account (scope `drive.file`) — nunca há link público; preview (WebP) público no Cloudflare R2 |
| **Neon Database** | PostgreSQL serverless com branching. Escala para zero quando inativo. Ideal para projeto em crescimento. |
| **Framer Motion** | Animações declarativas no React. Viewport-based animations para a landing page. Otimizado para performance. |
| **React Hook Form + Zod** | Formulário multi-step com validação client e server-side. Schema compartilhado entre frontend e API. |
| **Resend** | API moderna para envio de e-mails transacionais. Integração com React Email para templates. |

---

## 9. Stack Tecnológica

### 9.1 Dependências Principais

| Camada | Tecnologia | Versão | Uso |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | Runtime do servidor |
| Framework | Next.js | 16.x | SSR, App Router, API Routes |
| Language | TypeScript | 5.x | Type safety full-stack |
| UI Library | React | 19.x | Componentes de interface |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Components | shadcn/ui | latest | Componentes acessíveis |
| Animation | **Framer Motion** | **12.x** | Animações e micro-interações (instalado: `framer-motion`) |
| ORM | Prisma | 7.x | Acesso ao banco de dados |
| Validation | Zod | 4.x | Validação de schema |
| Forms | React Hook Form | 7.x | Gerenciamento de forms |
| Images | next/image | nativo | Otimização de imagens |
| E-mail | Resend + React Email | latest | E-mails transacionais |
| Storage SDK | AWS SDK v3 (S3 compat.) | 3.x | Upload para R2 |
| Data Fetching | Server Components + Prisma | — | Catálogo via RSC/ISR (sem SWR) |
| Auth JWT | jose | 6.x | Geração/verificação de JWT |
| Hashing | bcryptjs | 3.x | Hash de senhas admin (rounds: 12) |
| Rate Limit | @upstash/ratelimit + @upstash/redis | latest | Rate limiting fail-closed (contact, chat, login, admin, upload, stream) |
| Testing | Vitest + Playwright | latest | Unit e E2E tests |
| Linting | ESLint + Prettier | latest | Code quality |

> **Nota de versão (scaffold Jun/2026):** o projeto foi inicializado com as
> versões estáveis atuais (Next 16 / React 19 / Tailwind 4), mais novas que o
> rascunho original da spec (14 / 18 / 3). As tabelas acima refletem o que está
> instalado em `package.json`.

### 9.2 Animações — Framer Motion

`framer-motion` (v12) é a biblioteca padrão para animações e micro-interações,
conforme o requisito de UX "Animações e micro-interações" do PRD (§4.2, §5.1).

**Convenções:**

- Import: `import { motion, AnimatePresence } from 'framer-motion'`
- Componentes que usam `motion` precisam de `"use client"` (são interativos).
- Preferir **animações baseadas em viewport** (`whileInView` + `viewport={{ once: true }}`)
  para revelar seções da landing page ao rolar, sem reanimar a cada scroll.
- Micro-interações de hover/tap nos cards via `whileHover` / `whileTap`.
- Respeitar acessibilidade: usar `useReducedMotion()` para desligar/atenuar
  animações quando o usuário tem `prefers-reduced-motion` (requisito WCAG do PRD).
- Manter durações curtas (150–400ms) e `ease-out` para não prejudicar o LCP/CLS.

```tsx
// Exemplo: revelar seção ao entrar no viewport (respeitando reduced-motion)
'use client'
import { motion, useReducedMotion } from 'framer-motion'

export function RevealOnScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 10. Estrutura do Projeto

```
fasesport/
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── (marketing)/                # Grupo de rotas públicas
│   │   │   ├── page.tsx                # Homepage
│   │   │   ├── [categoria]/            # Páginas de categoria dinâmicas
│   │   │   │   ├── page.tsx            # /futebol, /volei, etc.
│   │   │   │   └── [produto]/          # Página de detalhe do produto
│   │   │   │       └── page.tsx
│   │   │   ├── como-funciona/          # Página do processo
│   │   │   └── orcamento/              # Formulário de orçamento
│   │   ├── (admin)/                    # Grupo de rotas administrativas
│   │   │   ├── layout.tsx              # Layout com auth check
│   │   │   ├── dashboard/              # Dashboard do CMS
│   │   │   ├── produtos/               # CRUD de produtos
│   │   │   └── categorias/             # CRUD de categorias
│   │   └── api/                        # API Routes
│   │       ├── contact/route.ts        # POST /api/contact
│   │       ├── chat/fabi/route.ts      # POST/PATCH /api/chat/fabi (RAG, SSE)
│   │       └── admin/                  # Todas as rotas /api/admin/* (RBAC)
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   ├── layout/                     # Navbar, Footer, Layout
│   │   ├── sections/                   # Hero, Categories, Process...
│   │   ├── products/                   # ProductCard, ProductGrid...
│   │   └── forms/                      # OrcamentoForm, ContactForm
│   ├── lib/
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── r2.ts                       # Cloudflare R2 client
│   │   ├── resend.ts                   # Resend email client
│   │   └── validations/                # Zod schemas
│   ├── hooks/                          # Custom React hooks
│   ├── store/                          # Zustand stores
│   └── types/                          # TypeScript types globais
├── prisma/
│   ├── schema.prisma                   # Schema do banco de dados
│   └── migrations/                     # Histórico de migrations
├── public/                             # Assets estáticos
├── docker/                             # Docker configs locais
│   ├── docker-compose.yml
│   └── .env.docker
├── tests/
│   ├── unit/                           # Vitest unit tests
│   └── e2e/                            # Playwright E2E tests
├── .env.local                          # Variáveis de ambiente (local)
├── .env.example                        # Template de variáveis
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 11. Modelagem de Dados

### 11.1 Schema Prisma

> Schema completo em `prisma/schema.prisma`. Prisma 7 com adapter `@prisma/adapter-pg` (Pool `pg`) — a URL vive em `prisma.config.ts`, não no schema. Padrão do repo: `npx prisma db push` (sem `migrate`).

```prisma
generator client {
  provider = "prisma-client-js"
}

model Category {
  id            String        @id @default(cuid())
  slug          String        @unique
  name          String
  description   String?
  imageUrl      String?
  iconUrl       String?
  sizeTableUrl  String?
  sortOrder     Int           @default(0)
  isActive      Boolean       @default(true)
  seoTitle      String?
  seoDesc       String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  subcategories Subcategory[]
  products      Product[]
  faqs          Faq[]
}

model Subcategory {
  id         String    @id @default(cuid())
  slug       String
  name       String
  sortOrder  Int       @default(0)
  category   Category  @relation(fields: [categoryId], references: [id])
  categoryId String
  products   Product[]

  @@unique([categoryId, slug])
}

model Product {
  id            String         @id @default(cuid())
  slug          String         @unique
  name          String
  description   String?
  fabric        String?
  minQty        Int            @default(10)
  isFeatured    Boolean        @default(false)
  isActive      Boolean        @default(true)
  seoTitle      String?
  seoDesc       String?
  simulatorUrl  String?
  sortOrder     Int            @default(0)
  category      Category       @relation(fields: [categoryId], references: [id])
  categoryId    String
  subcategory   Subcategory?   @relation(fields: [subcategoryId], references: [id])
  subcategoryId String?
  images        ProductImage[]
  art           ArtFile?       @relation(fields: [artId], references: [id], onDelete: SetNull)
  artId         String?        @unique
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model ProductImage {
  id        String  @id @default(cuid())
  url       String
  altText   String?
  sortOrder Int     @default(0)
  isPrimary Boolean @default(false)
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
}

model Lead {
  id          String     @id @default(cuid())
  name        String
  email       String?
  phone       String
  city        String?
  sport       String
  quantity    Int?
  details     String?
  productSlug String?
  status      LeadStatus @default(NEW)
  source      String?
  createdAt   DateTime   @default(now())

  @@index([status, createdAt])
  @@index([phone])
}

enum LeadStatus {
  NEW
  CONTACTED
  IN_PROGRESS
  CLOSED_WON
  CLOSED_LOST
}

model Testimonial {
  id               String  @id @default(cuid())
  clientName       String
  teamName         String?
  sport            String?
  text             String
  photoUrl         String?
  logoUrl          String?
  materialImageUrl String?
  rating           Int     @default(5)
  isActive         Boolean @default(true)
  sortOrder        Int     @default(0)
}

model InstagramPost {
  id        String   @id @default(cuid())
  imageUrl  String
  linkUrl   String
  caption   String?
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model SiteSetting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}

model Faq {
  id         String    @id @default(cuid())
  question   String
  answer     String
  sortOrder  Int       @default(0)
  isActive   Boolean   @default(true)
  category   Category? @relation(fields: [categoryId], references: [id])
  categoryId String?
}

enum AdminRole {
  T1_GERENCIA
  T2_VENDEDOR
}

model AdminUser {
  id           String      @id @default(cuid())
  email        String      @unique
  passwordHash String
  name         String
  role         AdminRole   @default(T1_GERENCIA)
  isActive     Boolean     @default(true)
  artsCreated  ArtFile[]
  createdAt    DateTime    @default(now())
}

model ModalityItem {
  id               String   @id @default(cuid())
  sectionTitle     String
  sectionSubtitle  String?
  sectionOrder     Int      @default(0)
  lineId           String   @unique
  name             String
  description      String?
  imageUrl         String?
  sortOrder        Int      @default(0)
  catalogLinkLabel String?
  catalogLinkHref  String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model SizeChart {
  id        String   @id @default(cuid())
  type      String   @unique
  title     String
  columns   Json
  rows      Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ArtFile {
  id               String    @id @default(cuid())
  name             String
  previewUrl       String    // R2 público (NEXT_PUBLIC_R2_URL) — servido na página pública
  previewMimeType  String
  originalFileId   String    // Drive file id do arquivo original (.cdr/.svg/.pdf)
  originalFileName String    // ex.: "escudo-corinthians.cdr"
  originalMimeType String
  sizeBytes        Int?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  createdBy        AdminUser? @relation(fields: [createdById], references: [id], onDelete: SetNull)
  createdById      String?
  product          Product?
}

model ChatSession {
  id        String        @id @default(cuid())
  userIp    String?
  userAgent String?
  status    String        @default("ACTIVE")
  leadId    String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  messages  ChatMessage[]
}

model ChatMessage {
  id         String      @id @default(cuid())
  sessionId  String
  role       String      // user | assistant | system | tool
  content    String
  feedback   Int?        // 1 = útil, -1 = não útil
  createdAt  DateTime    @default(now())
  session    ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
}
```

---

## 12. API Endpoints

### 12.1 Rotas Públicas

| Método | Rota | Descrição | Response |
|---|---|---|---|
| `POST` | `/api/contact` | Criação de lead (Zod + CSRF + rate limit) + e-mail para vendas | `201 { success, leadId }` |
| `POST` | `/api/chat/fabi` | Chat Fabi (RAG) — SSE stream; rate limit por IP; cria `ChatSession` e devolve `X-Session-Id` | `text/event-stream` |
| `PATCH` | `/api/chat/fabi` | Registra feedback de mensagem (`messageId`, `feedback: -1\|0\|1`) | `200 { success }` |

> As rotas públicas antigas `/api/products`, `/api/products/:slug`, `/api/categories` e `/api/categories/:slug` foram **removidas** — o catálogo é renderizado via Server Components com Prisma (RSC). As rotas de contato/chat são **fail-closed**: sem Redis (Upstash) configurado, retornam `503`.

### 12.2 Rotas Admin (autenticadas)

Todas as rotas `/api/admin/*` exigem cookie `admin_token` válido (validação no `src/proxy.ts`). Rotas T1-only chamam `requireT1Admin()`; rotas com role mista usam `requireApiAdmin()` + `canAccessRoute()`.

| Método | Rota | Role | Descrição |
|---|---|---|---|
| `POST` | `/api/admin/auth/login` | Público | Login (JWT httpOnly cookie; valida `isActive`; payload com `role`) |
| `POST` | `/api/admin/auth/logout` | Qualquer admin | Limpa cookie |
| `GET` | `/api/admin/users` | T1 | Lista usuários (sem `passwordHash`) |
| `POST` | `/api/admin/users` | T1 | Cria usuário (bcrypt 12; P2002 → 409) |
| `PATCH` | `/api/admin/users/:id` | T1 | Edita role/isActive/senha (guard de auto-desativação) |
| `POST` | `/api/admin/products/art` | T1 | Upload da arte do produto (multipart: `file` preview + `original` vetorial + `productId`) — preview convertido para WebP no R2, original no Google Drive; validação MIME/ext/tamanho/magic bytes |
| `DELETE` | `/api/admin/products/art/:artId` | T1 | Exclui arte + arquivos (Drive e R2, best-effort) |
| `GET` | `/api/admin/products/art/:artId/download` | T1 | Download do original vetorial do Drive (`Content-Disposition: attachment`) |
| `GET/POST` | `/api/admin/products` | T1 | Lista/cria produtos |
| `PATCH/DELETE` | `/api/admin/products/:id` | T1 | Atualiza / soft-delete (`isActive: false`) |
| `DELETE` | `/api/admin/products/images/:imageId` | T1 | Remove imagem + arquivo no R2 (best-effort) |
| `POST` | `/api/admin/upload` | T1 | Upload de imagem de produto/categoria → R2 (valida alvo antes de subir) |
| `GET` | `/api/admin/leads` | T1 | Lista leads (filtro `?status=`) |
| `PATCH` | `/api/admin/leads/:id` | T1 | Atualiza status do lead |
| `GET/POST` | `/api/admin/categories` | T1 | Lista/cria categorias |
| `PATCH/DELETE` | `/api/admin/categories/:id` | T1 | Atualiza/exclui categoria |
| `POST` | `/api/admin/categories/size-table` | T1 | Tabela de medidas por categoria |
| `GET/POST` | `/api/admin/testimonials` | T1 | Lista/cria depoimentos |
| `PATCH/DELETE` | `/api/admin/testimonials/:id` | T1 | Atualiza/remove depoimento |
| `GET/POST` | `/api/admin/faqs` | T1 | Lista/cria FAQs |
| `PATCH/DELETE` | `/api/admin/faqs/:id` | T1 | Atualiza/remove FAQ |
| `GET/POST` | `/api/admin/instagram` | T1 | Lista/cria posts do Instagram |
| `PATCH/DELETE` | `/api/admin/instagram/:id` | T1 | Atualiza/remove post |
| `GET/POST` | `/api/admin/modalities` | T1 | Lista/cria modalidades |
| `PATCH/DELETE` | `/api/admin/modalities/:id` | T1 | Atualiza/remove modalidade |
| `GET/POST` | `/api/admin/size-charts` | T1 | Lista/upsert tabelas de medidas |
| `PATCH/DELETE` | `/api/admin/size-charts/:type` | T1 | Atualiza/remove tabela |
| `GET/PATCH` | `/api/admin/site-setting` | T1 | Lê/atualiza `SiteSetting` |
| `GET` | `/api/admin/chat-analytics` | T1 | Métricas do chat Fabi + sessões recentes |

### 12.3 Autenticação Admin — Spec Técnica (RBAC T1/T2)

**Bibliotecas:** `jose` (JWT) + `bcryptjs` (hash, rounds: 12).

**Modelo de papéis:**
- `T1_GERENCIA` — acesso total ao painel (dashboard, leads, produtos, usuários, artes dos produtos)
- `T2_VENDEDOR` — sem módulos acessíveis no painel; acesso apenas ao logout (perfil inativo no sidebar)

**Fluxo de login (`POST /api/admin/auth/login`):**
1. Valida CSRF (Origin/Referer) e rate limit (10/15min por IP, fail-closed → `503` se Redis fora)
2. Busca `AdminUser` por e-mail; compara senha com `bcrypt.compare` (hash dummy quando o e-mail não existe — evita enumeração por timing)
3. Rejeita usuário inativo (`isActive: false` → `401`)
4. JWT HS256 com payload `{ sub, email, role, isActive }`, expiração `JWT_EXPIRES_IN` (default `7d`)
5. Cookie `admin_token` httpOnly, secure, `SameSite=Strict`, `Path=/`, `Max-Age=604800`
6. Resposta `{ success: true, role }` — o client redireciona para `/admin/dashboard` (todos os papéis)

**Segredo (`src/lib/auth-jwt.ts`):** fail-closed — `getJwtSecret()` **lança erro** se `JWT_SECRET` ausente (sem fallback hardcoded).

**Proxy (`src/proxy.ts` — Next 16 renomeou `middleware` → `proxy`):** valida assinatura/expiração do JWT em `/admin/*` e `/api/admin/*` (edge/Node, sem acesso ao banco). `getJwtSecret()` sem fallback.

**Autorização por requisição (`src/lib/auth.ts`):**
- `getAdminUser()` — lê cookie → `jwtVerify` → busca `AdminUser` no banco → `null` se token inválido, usuário inexistente ou **inativo** (revogação imediata)
- `requireAdmin()` — para server components/páginas (redirect `/admin/login`)
- `requireApiAdmin()` — para API routes (401 JSON)
- `requireT1Admin()` — API routes T1-only (403 para T2)
- `canAccessRoute(role, pathname, method)` — matcher puro testável (T2: apenas `POST /api/admin/auth/logout`; todo o resto é T1)

**Gate de páginas:** route group `(t1)` em `src/app/(admin)/admin/(t1)/layout.tsx` redireciona não-T1 para `/admin/dashboard` — 100% server-side, consulta o banco por requisição antes de renderizar (protege PII de leads, LGPD).

**Seed (usuários):**
```bash
# .env
ADMIN_SEED_EMAIL=admin@fasesport.com
ADMIN_SEED_PASSWORD=trocar_em_producao
SELLER_SEED_EMAIL=vendedor@fasesport.com   # opcional — cria T2
SELLER_SEED_PASSWORD=trocar_tambem
```

> **Sem recuperação de senha na V1.** Reset via página Usuários (T1) ou re-seed. Tokens não são revogáveis por troca de senha (JWT stateless, 7d) — trade-off documentado.

---

### 12.4 Rate Limiting — fail-closed

Biblioteca: `@upstash/ratelimit` + `@upstash/redis`.

**Limiters (`src/lib/ratelimit.ts`):**

| Limiter | Janela | Uso |
|---|---|---|
| `ratelimit` | 5 req / 10 min | `/api/contact`, `/api/chat/fabi` |
| `loginRatelimit` | 10 req / 15 min | `POST /api/admin/auth/login` |
| `adminRatelimit` | 60 req / 1 min | Mutações CRUD admin |
| `uploadRatelimit` | 10 req / 1 min | Uploads (R2 e Drive) |
| `streamRatelimit` | 240 req / 1 min | Preview/download de artes |

**Comportamento fail-closed:** sem `UPSTASH_REDIS_REST_URL/TOKEN` configurados, `limit()` **lança erro** (nunca `success: true`). Rotas públicas (contact, chat, login) capturam e respondem **`503`**; rotas admin mutantes respondem `500`. Não há fallback fail-open — a proteção nunca é desativada silenciosamente.

```typescript
// src/lib/ratelimit.ts (resumo)
function createLimiter(limiter, prefix?) {
  if (!redis) {
    return {
      limit: async () => {
        throw new Error("UPSTASH_REDIS_REST_URL/TOKEN não configurados");
      },
    };
  }
  return new Ratelimit({ redis, limiter, analytics: false, ...(prefix ? { prefix } : {}) });
}
```

```typescript
// Em POST /api/contact:
const ip = getClientIp(req);   // x-real-ip → x-vercel-forwarded-for → último valor de x-forwarded-for
try {
  ({ success } = await ratelimit.limit(ip));
} catch (rlError) {
  console.error("[ratelimit]", rlError);
  return Response.json({ success: false, message: "Serviço temporariamente indisponível." }, { status: 503 });
}
if (!success) return Response.json({ success: false, message: "Muitas tentativas." }, { status: 429 });
```

---

### 12.5 Contrato do Endpoint de Contato

```typescript
// POST /api/contact
// Body (validado via Zod):
const ContactSchema = z.object({
  name:        z.string().min(2).max(100),
  email:       z.string().email(),
  phone:       z.string().min(10).max(20),
  city:        z.string().optional(),
  sport:       z.enum(['futebol', 'volei', 'basquete', 'handebol', 'passeio', 'agasalho', 'colete', 'acessorios']),
  quantity:    z.number().int().min(1).optional(),
  details:     z.string().max(1000).optional(),
  productSlug: z.string().optional(),
  source:      z.enum(['form', 'whatsapp', 'simulator']).default('form'),
});

// Response 201:
{ success: true, leadId: string }

// Response 400:
{ success: false, errors: ZodError[] }

// Response 500:
{ success: false, message: string }
```

---

## 13. Ambiente de Desenvolvimento (Docker)

### 13.1 docker-compose.yml

```yaml
# docker/docker-compose.yml
version: "3.9"

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ..:/app
      - /app/node_modules
      - /app/.next
    environment:
      - DATABASE_URL=postgresql://fasesport:fasesport123@db:5432/fasesport_dev
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
    command: npm run dev

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: fasesport
      POSTGRES_PASSWORD: fasesport123
      POSTGRES_DB: fasesport_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fasesport -d fasesport_dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Opcional: Adminer para visualizar o banco
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_data:
```

### 13.2 Dockerfile.dev

```dockerfile
# docker/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### 13.3 Variáveis de Ambiente (`.env.example`)

```bash
# ── App ───────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Database ───────────────────────────────────
# Local (Docker):
DATABASE_URL=postgresql://fasesport:fasesport123@localhost:5432/fasesport_dev
# Produção (Neon):
# DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require

# ── Cloudflare R2 ──────────────────────────────
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=fasesport-media
NEXT_PUBLIC_R2_URL=https://media.fasesport.com

# ── E-mail (Resend) ────────────────────────────
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=noreply@fasesport.com
EMAIL_TO_SALES=contato@fasesport.com

# ── Admin Auth ─────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# ── Rate Limiting (Upstash Redis) ──────────────
UPSTASH_REDIS_REST_URL=https://your-upstash-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# ── Google Maps ────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# ── Analytics ──────────────────────────────────
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# ── Chat Fabi (RAG / IA) ───────────────────────
# Provedor: "opencode-go" (padrão) | "openrouter" | "local"
AI_PROVIDER=opencode-go
# OpenRouter:
OPENROUTER_API_KEY=sk-or-your_openrouter_key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
# OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
# opencode-go / OpenAI-compatível:
# OPENCODE_GO_API_KEY=sk-...
# OPENCODE_GO_MODEL=opencode-go/deepseek-v4-flash
# OPENCODE_GO_BASE_URL=https://api.openai.com/v1
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://api.openai.com/v1
# DEEPSEEK_API_KEY=sk-...
# Sem chave configurada, a Fabi usa o motor local por regras (sem LLM).

# ── WhatsApp ───────────────────────────────────
NEXT_PUBLIC_WHATSAPP_NUMBER=5500000000000

# ── Simulador de Uniformes ─────────────────────
NEXT_PUBLIC_SIMULATOR_URL=

# ── Seed (usuários demo) ───────────────────────
ADMIN_SEED_EMAIL=admin@fasesport.com
ADMIN_SEED_PASSWORD=change_me_admin
SELLER_SEED_EMAIL=vendedor@fasesport.com   # opcional
SELLER_SEED_PASSWORD=change_me_seller

# ── Google Drive (Artes) ───────────────────────
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_DRIVE_ARTS_FOLDER_ID=1xxxxxxxxxxxxxxxxxxxxxxxx
```

### 13.4 Comandos Úteis

```bash
# Subir ambiente local completo
docker compose -f docker/docker-compose.yml up -d

# Rodar migrations no banco local
npx prisma migrate dev

# Abrir Prisma Studio (GUI do banco)
npx prisma studio

# Seed de dados de desenvolvimento
npx prisma db seed

# Parar e remover containers
docker compose -f docker/docker-compose.yml down

# Reset completo (apaga volume do banco)
docker compose -f docker/docker-compose.yml down -v
```

---

## 14. Deploy e Infraestrutura de Produção

### 14.1 Diagrama de Infraestrutura

```
Domínio: fasesport.com → Cloudflare DNS → Vercel

┌─────────────────────────────────────────────┐
│              CLOUDFLARE (DNS + CDN)          │
│  fasesport.com / www.fasesport.com           │
│  media.fasesport.com → R2 Bucket             │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│                 VERCEL                       │
│  Produção: branch main                       │
│  Preview: feature branches (PR previews)     │
│  Edge Functions: geolocalização, middlewares │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│             NEON POSTGRESQL                  │
│  Branch: main (produção)                     │
│  Branch: dev (desenvolvimento)               │
│  Connection pooling via Neon serverless       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            CLOUDFLARE R2                     │
│  Bucket: fasesport-media                     │
│  /products/{productSlug}/                    │
│  /categories/{categorySlug}/                 │
│  /testimonials/{testimonialId}/              │
│  /site/  ← assets fixos                      │
│  Worker: otimização de imagem on-the-fly     │
└─────────────────────────────────────────────┘
```

### 14.2 Estrutura de Pastas no R2

```
fasesport-media/
├── products/{product-slug}/
│   ├── main.webp          # Imagem principal (800px)
│   ├── main-400.webp      # Thumbnail
│   ├── main-1200.webp     # Full size
│   └── gallery-{n}.webp   # Imagens adicionais
├── categories/
│   ├── {category-slug}/
│   │   ├── hero.webp      # Banner da categoria
│   │   └── icon.svg       # Ícone da categoria
├── testimonials/
│   └── {testimonial-id}/
│       ├── photo.webp
│       └── logo.webp
├── arts/
│   └── {timestamp}-{name}.webp   # Preview da arte do produto (WebP público)
└── site/
    ├── logo.svg
    ├── og-image.jpg
    └── favicon.ico
```

**Formatos de imagem:**
- Input aceito: JPG, PNG, WebP (máx. 10MB)
- Output: convertido para WebP no momento do upload
- Tamanhos gerados automaticamente via Cloudflare Image Resizing: 400w, 800w, 1200w

```tsx
// Exemplo de uso no Next.js
<Image
  src={`${process.env.NEXT_PUBLIC_R2_URL}/products/${slug}/main.webp`}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### 14.3 CI/CD — GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint          # ESLint
      - run: npm run type-check    # tsc --noEmit
      - run: npm run test:unit     # Vitest
      - run: npm run build         # next build

  deploy-preview:                  # Apenas em PRs
    needs: quality
    if: github.event_name == 'pull_request'
    steps:
      - name: Deploy to Vercel Preview
        run: vercel deploy --token=${{ secrets.VERCEL_TOKEN }}
      - name: Run E2E tests against preview
        run: npx playwright test

  deploy-production:               # Apenas no merge para main
    needs: quality
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel Production
        run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL_PROD }}
      - name: Smoke tests
        run: npx playwright test --project=smoke
```

---

## 14.4 CMS Admin — Spec de UX

> Acesso exclusivo via `/admin`. Protegido pelo middleware JWT. Interface em português, sem suporte a múltiplos usuários na V1.

### Telas e Fluxo

```
/admin/login
  └─ Formulário: email + senha
     └─ Sucesso → /admin/dashboard

/admin/dashboard
  ├─ Cards de resumo: total de produtos, leads novos, depoimentos ativos
  └─ Atalhos rápidos para as seções abaixo

/admin/produtos
  ├─ Tabela: nome | categoria | ativo | destaque | ações (editar, toggle ativo)
  ├─ Botão "Novo Produto" → /admin/produtos/novo
  └─ /admin/produtos/[id]
       ├─ Campos: nome, slug (auto), descrição, tecido, qtd. mínima, categoria,
       │          sub-categoria, URL simulador, destaque, ativo
       ├─ Upload de imagens (múltiplas, drag-and-drop, reordenáveis)
       └─ Botões: Salvar | Cancelar | Excluir

/admin/categorias
  ├─ Tabela: nome | slug | ordem | ativo
  └─ Edição inline de sortOrder via drag-and-drop

/admin/depoimentos
  ├─ Tabela: cliente | time | ativo | ordem
  └─ /admin/depoimentos/[id] — campos: nome, time, esporte, texto, foto, logo, nota, ativo

/admin/faqs
  ├─ Select de categoria (ou "Global") → filtra a lista
  ├─ Tabela: pergunta | ativo | ordem
  └─ Edição inline: pergunta + resposta (textarea) + toggle ativo

/admin/leads
  ├─ Tabela: nome | esporte | qtd | status | data | ações
  ├─ Filtro por status (NEW, CONTACTED, IN_PROGRESS, CLOSED_WON, CLOSED_LOST)
  └─ Clique na linha abre painel lateral com detalhes + select para mudar status
```

### Decisões de UX

- Layout fixo: sidebar esquerda (logo + links de navegação) + área de conteúdo à direita
- Feedback visual de sucesso/erro em todas as ações (toast — shadcn/ui `<Sonner>`)
- Sem paginação na V1 — todas as listas carregam completas (volume baixo esperado)
- Imagens do produto: upload via drag-and-drop, preview imediato, reordenação por arraste, remoção individual

---

## 15. Padrões de Código e Convenções

### 15.1 Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componentes React | `PascalCase.tsx` | `ProductCard.tsx` |
| Hooks customizados | `useCamelCase.ts` | `useProducts.ts` |
| Utilitários | `camelCase.ts` | `formatPhone.ts` |
| Types/Interfaces | `PascalCase` | `interface ProductProps` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_UPLOAD_SIZE` |
| Rotas (App Router) | `kebab-case/` | `como-funciona/` |

### 15.2 Estrutura de Componente

```tsx
// src/components/products/ProductCard.tsx

// 1. Imports
import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// 2. Types
interface ProductCardProps {
  product: Product
  className?: string
}

// 3. Component
export function ProductCard({ product, className }: ProductCardProps) {
  // 4. Hooks

  // 5. Handlers

  // 6. Render
  return (
    <motion.div className={cn('...', className)}>
      {/* ... */}
    </motion.div>
  )
}
```

**Regras:**
- Server Components por padrão. `"use client"` apenas quando necessário (interatividade, hooks de browser)
- Default exports apenas para `page.tsx` e `layout.tsx`. Named exports para todos os outros componentes
- Props sempre tipadas com `interface`, nunca `type` para props de componente

### 15.3 Fetching de Dados

```tsx
// Server Component (preferido para SEO)
async function CategoryPage({ params }: { params: { categoria: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.categoria },
    include: { products: { include: { images: true } } },
  })
  // ...
}

// Server Component (padrão do projeto — catálogo via Prisma/RSC)
async function FilteredProducts({ categoryId }: { categoryId: string }) {
  const products = await prisma.product.findMany({
    where: { isActive: true, categoryId },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  })
  // ...
}
```

### 15.4 Tratamento de Erros em API Routes

```typescript
// src/app/api/contact/route.ts
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = ContactSchema.safeParse(body)

    if (!validated.success) {
      return Response.json(
        { success: false, errors: validated.error.issues },
        { status: 400 }
      )
    }

    const lead = await prisma.lead.create({ data: validated.data })
    await sendLeadNotification(lead)

    return Response.json({ success: true, leadId: lead.id }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/contact]', error)
    return Response.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
```

### 15.5 Commits — Conventional Commits

```
feat: adiciona página de categoria de vôlei
fix: corrige link do WhatsApp no mobile
chore: atualiza dependências
docs: adiciona comentários no schema Prisma
refactor: extrai lógica de upload para lib/r2.ts
test: adiciona testes E2E para fluxo de orçamento
```

---

## 16. Estratégia de Testes

### 16.1 Pirâmide de Testes

| Tipo | Ferramenta | O que testar | Cobertura Mínima |
|---|---|---|---|
| Unit | Vitest | Funções utilitárias, validações Zod, hooks customizados, componentes de UI isolados | 80% nas funções críticas |
| Integration | Vitest | API Routes (com banco de teste), fluxo do formulário, upload de imagens | Todos os endpoints |
| E2E | Playwright | Fluxo A (→ WhatsApp) e Fluxo B (→ Formulário), responsividade mobile | Fluxos de conversão obrigatórios |

### 16.2 Testes E2E Obrigatórios (Playwright)

```typescript
// tests/e2e/conversion-flows.spec.ts

test('Fluxo A — Homepage → Categoria → Produto → WhatsApp', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /uniformes esportivos/i })).toBeVisible()

  await page.click('[data-testid="category-card-futebol"]')
  await expect(page).toHaveURL('/futebol')

  await page.click('[data-testid="product-card"]:first-child')
  await expect(page.getByText(/ver detalhes/i)).toBeVisible()

  const whatsappLink = page.getByRole('link', { name: /chamar no whatsapp/i })
  await expect(whatsappLink).toHaveAttribute('href', /wa\.me/)
})

test('Fluxo B — Homepage → Formulário de Orçamento → Envio', async ({ page }) => {
  await page.goto('/orcamento')
  
  // Step 1
  await page.selectOption('[name="sport"]', 'futebol')
  await page.fill('[name="quantity"]', '20')
  await page.click('[data-testid="next-step"]')
  
  // Step 2
  await page.fill('[name="details"]', 'Uniforme azul com dourado')
  await page.click('[data-testid="next-step"]')
  
  // Step 3
  await page.fill('[name="name"]', 'João Silva')
  await page.fill('[name="email"]', 'joao@example.com')
  await page.fill('[name="phone"]', '27999999999')
  await page.click('[data-testid="submit-form"]')
  
  await expect(page.getByText(/orçamento enviado/i)).toBeVisible()
})

test('Responsividade mobile (375px)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  
  // Navbar deve colapsar em mobile
  await expect(page.getByTestId('mobile-menu-button')).toBeVisible()
  
  // WhatsApp FAB deve estar visível
  await expect(page.getByTestId('whatsapp-fab')).toBeVisible()
})
```

---

## 17. Checklist de Lançamento

### 17.1 Técnico

- [ ] Todas as páginas da V1 implementadas e testadas
- [ ] Lighthouse Score > 90 em Performance, Acessibilidade e SEO
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms
- [ ] SSL configurado no domínio `fasesport.com`
- [ ] Robots.txt e Sitemap.xml gerados e acessíveis
- [ ] Google Search Console configurado e sitemap enviado
- [ ] GA4 + GTM instalados e eventos de conversão rastreando
- [ ] Formulário de orçamento enviando e-mails corretamente
- [ ] Links de WhatsApp funcionando com mensagem pré-formatada
- [ ] Imagens otimizadas no R2 carregando em < 500ms
- [ ] Testes E2E passando nos Fluxos A e B
- [ ] Backup automático do banco de dados configurado no Neon
- [ ] Variables de ambiente de produção configuradas no Vercel
- [ ] Rate limiting ativo no endpoint `/api/contact`
- [ ] `next.config.ts` com domínios do R2 em `images.remotePatterns`

### 17.2 Conteúdo

- [ ] Fotos reais dos produtos cadastradas para todas as categorias
- [ ] Ao menos 3 modelos por categoria principal (Futebol, Vôlei, Basquete)
- [ ] Depoimentos de clientes reais com foto/logo cadastrados
- [ ] Textos SEO revisados por modalidade (title, description, H1)
- [ ] FAQ respondida com informações reais (prazo, quantidade mínima, formas de pagamento)
- [ ] Informações de contato, endereço e horário de funcionamento atualizados
- [ ] Imagens de hero por categoria com resolução mínima de 1920×600px
- [ ] Logo em SVG disponível para o footer e navbar

### 17.3 Pós-Lançamento (primeira semana)

- [ ] Monitorar GA4 para validar eventos de conversão
- [ ] Acompanhar logs do Vercel para erros em produção
- [ ] Validar fluxos A e B em dispositivos reais (iOS Safari, Android Chrome)
- [ ] Checar Google Search Console para erros de indexação
- [ ] Coletar primeiros feedbacks de clientes da Fase sobre a navegação

---

---

## 18. Progresso de Implementação

> **Atualizado:** 2026-08-08 — V1 completa + evolução: RBAC T1/T2 (T2 sem módulos — só logout), arte 1:1 anexada ao produto (original no Google Drive + preview WebP no R2), página Usuários, Chat Fabi (RAG), grade de produtos no admin, migração `middleware`→`proxy` (Next 16), otimizações (índices no Lead, remoção de rotas públicas mortas, OG image raiz, sitemap cacheado). Removida a biblioteca de artes autônoma (`/admin/conteudo`, `ArtTag`, rotas `arts/*` e `art-tags/*`). Aguardando: conteúdo real + integrações de produção (Redis Upstash, chaves RAG, credenciais Drive).

### 18.1 Concluído

#### Infra e configuração
- [x] `next.config.ts` — remotePatterns para Cloudflare R2
- [x] `.env.example` — todas as variáveis do §13.3
- [x] `src/app/layout.tsx` — metadata PT-BR, OpenGraph, fontes Inter + Barlow Condensed
- [x] Pacotes: `jose`, `bcryptjs`, `@upstash/ratelimit`, `@upstash/redis`, `googleapis`, `sharp`, `resend`, `tsx` (`swr`/`zustand` removidos — nunca importados)
- [x] Script `type-check` (`tsc --noEmit`) no `package.json`
- [x] Prisma seed configurado (`prisma.seed` → `tsx prisma/seed.ts`)

#### Design System
- [x] `src/app/globals.css` — tokens FASE brand (`--color-brand: #CD3438`, `--color-brand-dark`, `--color-brand-light`, `--color-brand-tint`) + bridge Tailwind v4 + shadcn/ui tokens
- [x] Componentes shadcn/ui configurados com design system (Button, Input, Card, etc.)

#### Banco de dados
- [x] `prisma/schema.prisma` — Category, Subcategory, Product (com `artId` 1:1), ProductImage, Lead, Testimonial, Faq, SiteSetting, InstagramPost, ModalityItem, SizeChart, ChatSession, ChatMessage, AdminUser (RBAC T1/T2), ArtFile — índices em `Lead(status, createdAt)` e `Lead(phone)`
- [x] `docker/docker-compose.yml` + `docker/Dockerfile.dev`
- [x] `prisma/seed.ts` — admin (T1), vendedor opcional (T2 via `SELLER_SEED_*`), catálogo completo, depoimentos, FAQs, modalidades e medidas

#### Libs compartilhadas
- [x] `src/lib/db.ts` — singleton Prisma
- [x] `src/lib/r2.ts` — cliente S3/R2, `uploadToR2`, `deleteFromR2`
- [x] `src/lib/resend.ts` — cliente Resend, `sendLeadNotification`
- [x] `src/lib/ratelimit.ts` — sliding window 5 req / 10 min
- [x] `src/lib/seo.ts` — `buildProductJsonLd`, `buildBreadcrumbJsonLd`, `buildFaqJsonLd`, metadata helpers
- [x] `src/lib/site.ts` — constantes do site (nome, URL, WhatsApp, simulador)
- [x] `src/lib/analytics.ts` — `trackEvent` tipado (GA4/GTM)
- [x] `src/lib/validations/contact.ts` — `ContactSchema` (Zod)
- [x] `src/lib/validations/auth.ts` — `LoginSchema` (Zod)

#### Auth, proxy e RBAC
- [x] `src/proxy.ts` (Next 16 — convenção `middleware` renomeada) — JWT guard em `/admin` e `/api/admin`
- [x] `src/lib/auth.ts` — `getAdminUser`, `requireAdmin`, `requireApiAdmin`, `requireT1Admin`, `canAccessRoute` (matcher puro testável); `getJwtSecret()` fail-closed (lança se `JWT_SECRET` ausente)
- [x] Route group `(t1)` — gate server-side por requisição (redirect não-T1 → `/admin/dashboard`)

#### API Routes — Públicas
- [x] `POST /api/contact` — cria lead, CSRF, rate limit fail-closed, notificação por e-mail
- [x] `POST/PATCH /api/chat/fabi` — chat RAG (SSE + `X-Session-Id` + captura automática de lead + feedback)
- [x] Rotas `/api/products` e `/api/categories` **removidas** — catálogo via Server Components + Prisma (RSC)

#### API Routes — Admin
- [x] `POST /api/admin/auth/login` — JWT httpOnly cookie
- [x] `POST /api/admin/auth/logout` — limpa cookie
- [x] `GET/POST /api/admin/products` — lista/cria produtos
- [x] `PATCH/DELETE /api/admin/products/[id]` — edita / soft delete
- [x] `GET/POST /api/admin/categories` — lista/cria categorias
- [x] `PATCH /api/admin/categories/[id]` — edita categoria
- [x] `GET/POST /api/admin/leads` — lista leads (filtro por status) / cria
- [x] `PATCH /api/admin/leads/[id]` — atualiza status
- [x] `GET/POST /api/admin/testimonials` — lista/cria depoimentos
- [x] `PATCH/DELETE /api/admin/testimonials/[id]`
- [x] `GET/POST /api/admin/faqs` — lista (filtro por categoryId)/cria
- [x] `PATCH/DELETE /api/admin/faqs/[id]`
- [x] `POST /api/admin/upload` — upload para R2, registra ProductImage (valida alvo antes de subir — sem órfãos)
- [x] `GET/POST /api/admin/users` + `PATCH /api/admin/users/[id]` — gestão de usuários (T1, bcrypt 12, auto-desativação bloqueada)
- [x] `GET/POST/PATCH/DELETE /api/admin/art-tags` + `[id]` — tags de arte (T1 muta, T2 lê) — **removidas** com a biblioteca de artes
- [x] `POST /api/admin/products/art` + `DELETE products/art/[artId]` + `GET products/art/[artId]/download` — arte do produto (T1): preview WebP → R2, original → Drive
- [x] `GET/POST/PATCH/DELETE /api/admin/size-charts` + `[type]`
- [x] `GET/POST/PATCH/DELETE /api/admin/instagram` + `[id]`
- [x] `GET/POST/PATCH/DELETE /api/admin/modalities` + `[id]`
- [x] `GET/PATCH /api/admin/site-setting`
- [x] `GET /api/admin/chat-analytics` — métricas do chat Fabi

#### CMS Admin — Páginas
- [x] `src/app/(admin)/layout.tsx` — sidebar filtrada por role + `getAdminUser` server-side
- [x] `src/app/admin/login/page.tsx` — redirect para `/admin/dashboard` (todos os papéis)
- [x] `src/app/(admin)/admin/(t1)/dashboard/page.tsx` — cards de resumo + atalhos
- [x] `src/app/(admin)/admin/(t1)/leads/page.tsx` — tabela com filtro de status + painel lateral
- [x] `src/app/(admin)/admin/(t1)/categorias/page.tsx` + `CategoryRow.tsx` — edição inline de ordem/ativo
- [x] `src/app/(admin)/admin/(t1)/depoimentos/page.tsx` + `TestimonialToggle.tsx` + `AnimatedTestimonialRows.tsx`
- [x] `src/app/(admin)/admin/(t1)/faqs/page.tsx` — edição inline, por categoria ou global
- [x] `src/app/(admin)/admin/(t1)/produtos/page.tsx` + `ProductGridAdmin.tsx` — **grade com fotos** (substituiu tabela `AnimatedTableRows`)
- [x] `src/app/(admin)/admin/(t1)/produtos/novo/page.tsx`
- [x] `src/app/(admin)/admin/(t1)/produtos/[id]/page.tsx`
- [x] `src/app/(admin)/admin/(t1)/produtos/_components/ProductForm.tsx` — form completo com upload de imagens
- [x] `src/app/(admin)/admin/(t1)/usuarios/page.tsx` + `UsuariosClient.tsx` — criar/editar/desativar usuários
- [x] `src/app/(admin)/admin/conteudo/page.tsx` + `ConteudoClient.tsx` — biblioteca de artes + tags (abas por role) — **removida**; arte agora é anexada 1:1 ao produto via `POST /api/admin/products/art`
- [x] `src/app/(admin)/admin/(t1)/chat-analytics/page.tsx` — métricas do chat Fabi
- [x] `src/app/(admin)/admin/(t1)/instagram/page.tsx` + `HeroVideoUploader` — vídeo hero + posts

#### Layout público
- [x] `src/app/(marketing)/layout.tsx` — wrapper com Navbar + Footer + WhatsAppFab
- [x] `src/components/layout/Navbar.tsx` — sticky, mobile-menu, campo de busca integrado
- [x] `src/components/layout/MobileMenu.tsx`
- [x] `src/components/layout/Footer.tsx`
- [x] `src/components/layout/FooterWhatsAppLink.tsx`
- [x] `src/components/layout/SearchForm.tsx`
- [x] `src/components/layout/Breadcrumb.tsx`
- [x] `src/components/ui/WhatsAppFab.tsx` — FAB flutuante

#### Homepage — `src/app/(marketing)/page.tsx`
- [x] `HeroSection` — CTA duplo (simulador + orçamento)
- [x] `CategoriesSection` (cards por modalidade)
- [x] `FeaturedSection` + `ProductCard`
- [x] `HowItWorksSection` + `ProcessSteps`
- [x] `TestimonialsSection`
- [x] `WhySection`
- [x] `CtaBannerSection`
- [x] `ContactSection` — `OrcamentoForm` + Google Maps embed + endereço

#### Página de Categoria — `src/app/(marketing)/[categoria]/page.tsx`
- [x] SSG via `generateStaticParams`, `generateMetadata` com SEO dinâmico
- [x] `CategoryHero`, `SubcategoryFilter`, `ProductGrid`
- [x] `SimulatorCta`, `FaqAccordion`
- [x] `CategoryWhatsAppCta`

#### Página de Produto — `src/app/(marketing)/[categoria]/[produto]/page.tsx`
- [x] SSG via `generateStaticParams`, JSON-LD `Product` + `BreadcrumbList`
- [x] `ProductGallery` (swipe mobile, thumbnails)
- [x] `ProductWhatsAppCta`, `SimulatorCta`

#### Páginas estáticas
- [x] `src/app/(marketing)/como-funciona/page.tsx` — passo a passo + FAQ global + CTA
- [x] `src/app/(marketing)/orcamento/page.tsx` + `OrcamentoForm` — form multi-step 3 passos, maskPhone, focus management
- [x] `src/app/(marketing)/busca/page.tsx` — resultados de busca por `?q=`, empty state
- [x] `src/app/(marketing)/not-found.tsx` + `src/app/not-found.tsx` + `NotFoundContent.tsx`
- [x] `src/app/(marketing)/error.tsx`, `loading.tsx`

#### SEO e metadata
- [x] `src/app/sitemap.ts` — sitemap dinâmico (categorias + produtos)
- [x] `src/app/robots.ts` — `/admin/` bloqueado, sitemap apontado
- [x] JSON-LD: `LocalBusiness` (homepage), `Product` (produto), `BreadcrumbList` (categoria/produto), `FAQPage` (como-funciona)
- [x] OG/Twitter cards em todas as páginas

#### Analytics e LGPD
- [x] `src/components/analytics/AnalyticsProvider.tsx` — GA4 + GTM, respeita consentimento
- [x] `src/components/analytics/ConsentBanner.tsx` — banner de cookies LGPD
- [x] `src/components/analytics/RouteChangeTracker.tsx`
- [x] Eventos rastreados: `page_view`, `whatsapp_click`, `simulator_click`, `orcamento_step`, `lead_submit`

#### CTA Simulador
- [x] `src/components/products/SimulatorCta.tsx` — renderização condicional com `getSimulatorUrl`
- [x] `buildWhatsAppUrl` com guard (validação do número)

#### Testes unitários Vitest
- [x] `src/__tests__/setup.ts` — jsdom + @testing-library
- [x] `src/__tests__/lib/site.test.ts` — funções utilitárias de site (buildWhatsAppUrl, getSimulatorUrl)
- [x] `src/__tests__/lib/site-guard.test.ts` — guard de WhatsApp número vazio
- [x] `src/__tests__/validations/auth.test.ts` — LoginSchema Zod
- [x] `src/__tests__/validations/contact.test.ts` — ContactSchema Zod
- [x] `src/__tests__/components/OrcamentoForm.test.tsx` — form multi-step steps + validação

#### Testes E2E (Playwright)
- [x] `tests/e2e/conversion-flows.spec.ts` — Fluxo A (homepage → categoria → produto → WhatsApp), Fluxo B (orçamento 3 steps), responsividade mobile
- [x] `tests/e2e/admin-auth.spec.ts` — login admin

#### CI/CD
- [x] `.github/workflows/ci.yml` — type-check, lint, unit tests, next build em PRs e pushes para main
- [x] `next.config.ts` — headers de segurança (CSP + X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS); `vercel.json` simplificado (framework + região — headers deduplicados)

#### Email e notificações
- [x] `src/emails/LeadNotificationEmail.tsx` — template React Email com branding FASE, dados do lead, botão WhatsApp e link admin

#### Admin — Dashboard de Métricas
- [x] `src/app/(admin)/admin/dashboard/_components/LeadMetrics.tsx` — leads por modalidade, funil de status, volume ao longo do tempo (Prisma `groupBy`)

#### Chat Fabi (RAG / IA)
- [x] `src/lib/rag/*` — `fabi.ts` (contexto RAG: FAQs, produtos, modalidades, medidas, pricing), `provider.ts` (OpenRouter/opencode-go/local com fallback), `prompts.ts`, `tools.ts` (function calling: calculate_quote, search_catalog, get_size_chart, register_lead), `pricing/` (tabelas + calculadora com faturamento do mínimo e fail-closed p/ produto desconhecido)
- [x] `src/components/chat/*` — widget Fabi (modal, avatar, input, lista com streaming SSE, feedback)
- [x] `POST/PATCH /api/chat/fabi` — SSE + `X-Session-Id` + captura automática de lead + feedback
- [x] `GET /api/admin/chat-analytics` + página de métricas
- [x] Correção de links do RAG para rotas reais `/{categoria}/{produto}`

#### OG Images dinâmicas
- [x] `src/app/(marketing)/[categoria]/opengraph-image.tsx` — OG image gerada por categoria
- [x] `src/app/(marketing)/[categoria]/[produto]/opengraph-image.tsx` — OG image por produto

#### Páginas legais
- [x] `src/app/(marketing)/privacidade/page.tsx` — política de privacidade / LGPD

---

### 18.2 Pendente antes do lançamento

| Item | Tipo | Prioridade |
|---|---|---|
| Imagens reais de produtos cadastradas no R2 | Conteúdo | ALTA |
| Depoimentos reais de clientes cadastrados | Conteúdo | MÉDIA |
| FAQ respondida com informações reais (prazo, qtd. mínima, pagamento) | Conteúdo | MÉDIA |
| Variáveis de ambiente de produção configuradas no Vercel | Config | BLOQUEANTE para deploy |
| Google Search Console + sitemap enviado | Config | Pós-deploy |

### 18.3 Próxima fase — specs pendentes (melhorias)

| Spec | ID |
|---|---|
| Animações e fluidez (Framer Motion micro-interações) | `2026-06-13-animacoes-fluidez` |
| Carrossel de depoimentos com foto do material | `2026-06-14-homepage-depoimentos-carousel` |
| Seção Instagram na homepage | `2026-06-14-instagram-section` |
| Hero com imagens reais por categoria | `2026-06-13-hero-categorias` |
| Carrossel de destaques na homepage | `2026-06-13-destaques-carrossel` |
| Personalização e carrinho (simulador embed) | `2026-06-13-personalizacao-e-carrossel` |
| Reformulação das páginas de modalidade | `2026-06-13-reformulacao-modalidades` |
| Detalhes de produto — linhas de coleção | `2026-06-13-detalhe-produto-linhas` |
| Como Funciona — vetores animados | `2026-06-13-como-funciona-vetores` |
| Categoria Empresarial — landing dedicada | `2026-06-13-categoria-empresarial` |

---

## 19. Spec — Marketing Pages

> **Pré-requisito:** Design system finalizado (§18.2).
> **Agente:** arquiteto → plano → implementador → revisor.

### 19.1 Layout e componentes compartilhados

Antes das páginas, precisam existir:

| Componente | Arquivo | Descrição |
|---|---|---|
| `Navbar` | `src/components/layout/Navbar.tsx` | Sticky, compacta ao rolar. Logo + links + botão WhatsApp + CTA Orçamento. Server Component com `"use client"` isolado para o toggle mobile. |
| `Footer` | `src/components/layout/Footer.tsx` | Links, redes sociais, contato, selos. Server Component. |
| `WhatsAppButton` | `src/components/ui/WhatsAppButton.tsx` | FAB flutuante em mobile, botão inline em desktop. Abre `wa.me` com mensagem pré-formatada. Lê `NEXT_PUBLIC_WHATSAPP_NUMBER`. |
| `(marketing)/layout.tsx` | `src/app/(marketing)/layout.tsx` | Wrapper com Navbar + Footer + WhatsAppButton. |

**Mensagem pré-formatada do WhatsApp:**
```
Olá Fase Sport! Vi o modelo [Nome] e quero um orçamento para [N] conjuntos de [Modalidade].
```
Quando não há produto/modalidade específicos: `Olá Fase Sport! Gostaria de solicitar um orçamento.`

---

### 19.2 Homepage — `src/app/(marketing)/page.tsx`

Server Component. Busca dados no banco diretamente via Prisma (sem fetch HTTP interno).

**Dados necessários:**
```typescript
const [categories, featuredProducts, testimonials] = await Promise.all([
  prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
  prisma.product.findMany({ where: { isActive: true, isFeatured: true }, take: 4, include: { images: { where: { isPrimary: true }, take: 1 }, category: true } }),
  prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
])
```

**Seções (ordem de rolagem):**

| Seção | Componente | Notas |
|---|---|---|
| Hero | `src/components/sections/HeroSection.tsx` | Full-width, overlay, headline animada (Framer Motion `whileInView`), 2 CTAs: "Simular Uniforme" (link externo simulador) + "Pedir Orçamento" (`/orcamento`) |
| Categorias | `src/components/sections/CategoriesSection.tsx` | Grid de cards por modalidade (`ModalityItem`). Cada card leva para `/{categoria.slug}`. |
| Destaque | `src/components/sections/FeaturedSection.tsx` | Grid 3-4 `ProductCard`. Dados: `featuredProducts`. |
| Como Funciona | `src/components/sections/ProcessSection.tsx` | 4 etapas. Layout horizontal desktop / vertical mobile. |
| Clientes | `src/components/sections/TestimonialsSection.tsx` | Carrossel (`"use client"` + Framer Motion). Dados: `testimonials`. |
| Por que a Fase? | `src/components/sections/WhySection.tsx` | 3–4 diferenciais estáticos. |
| Contato | `src/components/sections/ContactSection.tsx` | `<OrcamentoForm />` + mapa embed + endereço. |

**Componentes de produto/categoria reutilizáveis:**

```typescript
// src/components/products/ProductCard.tsx
interface ProductCardProps {
  slug: string
  name: string
  fabric: string | null
  categoryName?: string | null
  minQty?: number | null
  imageUrl: string | null
  imageAlt: string | null
  categorySlug: string
}
```
```

---

### 19.3 Páginas de Categoria — `src/app/(marketing)/[categoria]/page.tsx`

Server Component com geração estática via `generateStaticParams`.

```typescript
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return categories.map((c) => ({ categoria: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  const category = await prisma.category.findUnique({ where: { slug: categoria } })
  if (!category) return {}
  return {
    title: category.seoTitle ?? `Uniforme de ${category.name} Personalizado`,
    description: category.seoDesc,
  }
}
```

**Estrutura da página:**
1. Hero da categoria (imagem de fundo + headline + breadcrumb)
2. `FilterBar` — tabs de sub-categoria (Client Component para interatividade sem reload)
3. Grid de produtos — `ProductGrid` (Server Component, filtra por sub-categoria via searchParams)
4. Banner CTA simulador
5. FAQ da modalidade (acordeão, `"use client"`)

**`FilterBar`** recebe a lista de subcategorias e o slug ativo, atualiza `?sub=` na URL via `useRouter().push`.

**`ProductGrid`** é Server Component — lê `searchParams.sub` e faz a query diretamente:
```typescript
// params e searchParams são Promise no Next.js 16
const { categoria } = await params
const { sub } = await searchParams
```

---

### 19.4 Página de Detalhe do Produto — `src/app/(marketing)/[categoria]/[produto]/page.tsx`

Server Component.

```typescript
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, category: { select: { slug: true } } },
    include: { category: { select: { slug: true } } },
  })
  return products.map((p) => ({ categoria: p.category.slug, produto: p.slug }))
}
```

**Estrutura:**
1. `ProductGallery` — galeria com thumbnail strip + swipe mobile (`"use client"`, Framer Motion)
2. Nome, tecido, qtd mínima
3. CTA duplo: "Simular no Simulador" (link externo) + "Chamar no WhatsApp" (link `wa.me` com mensagem pré-formatada incluindo nome do produto)
4. Descrição expandida
5. Breadcrumb: Home → [Categoria] → [Produto]

**Mensagem WhatsApp do produto:**
```typescript
const msg = encodeURIComponent(
  `Olá Fase Sport! Vi o modelo ${product.name} e quero um orçamento para conjuntos de ${product.category.name}.`
)
const href = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${msg}`
```

---

### 19.5 Página Como Funciona — `src/app/(marketing)/como-funciona/page.tsx`

Server Component estático (sem dados do banco).

**Estrutura:**
1. Hero estático com headline
2. Passo a passo visual detalhado (4 etapas com ícone, número, título, texto)
3. FAQ global — busca `prisma.faq.findMany({ where: { categoryId: null, isActive: true } })`
4. CTA para `/orcamento`

---

## 20. Spec — SEO

### 20.1 Sitemap dinâmico

```typescript
// src/app/sitemap.ts
import { prisma } from '@/lib/db'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fasesport.com'

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true, category: { select: { slug: true } } }, include: { category: { select: { slug: true } } } }),
  ])

  return [
    { url: base, lastModified: new Date(), priority: 1 },
    { url: `${base}/orcamento`, priority: 0.8 },
    { url: `${base}/como-funciona`, priority: 0.7 },
    ...categories.map((c) => ({ url: `${base}/${c.slug}`, lastModified: c.updatedAt, priority: 0.9 })),
    ...products.map((p) => ({ url: `${base}/${p.category.slug}/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 })),
  ]
}
```

### 20.2 Robots

```typescript
// src/app/robots.ts
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
```

### 20.3 Schema.org

Implementar nos componentes relevantes via JSON-LD (`<script type="application/ld+json">`):

| Página | Schema |
|---|---|
| Homepage | `LocalBusiness` com endereço, telefone, horário |
| Categoria | `BreadcrumbList` |
| Produto | `Product` (name, image, description) + `BreadcrumbList` |

---

## 21. Spec — Testes

> **Agente:** testador

### 21.1 Testes unitários (Vitest)

Configuração mínima `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

**Cobertura obrigatória:**
- `ContactSchema` — casos válidos, e-mail inválido, esporte inválido, campo obrigatório ausente
- `LoginSchema` — senha curta, e-mail inválido
- `OrcamentoForm` — renderiza steps corretamente, avança ao preencher campos válidos, bloqueia sem campos obrigatórios
- `WhatsAppButton` — gera URL `wa.me` correta com e sem produto

### 21.2 Testes E2E (Playwright)

Arquivo: `tests/e2e/conversion-flows.spec.ts` (spec já definida em §16.2).

Configuração `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
})
```

**Testes obrigatórios:**
1. Fluxo A: Homepage → Categoria → Produto → WhatsApp (link `wa.me` correto)
2. Fluxo B: `/orcamento` → preenche 3 steps → submit → mensagem de sucesso
3. Responsividade mobile (375px): navbar colapsada, WhatsApp FAB visível
4. Admin login: credenciais erradas → mensagem de erro; credenciais corretas → redirect dashboard

---

## 22. Spec — CI/CD

Arquivo: `.github/workflows/ci.yml` (spec já definida em §14.3).

**Segredos necessários no GitHub Actions:**
- `VERCEL_TOKEN`
- `DATABASE_URL_PROD`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

---

*Fase Sport · Technical Spec v1.1 · Junho 2026 · Documento confidencial — uso interno*