---
slug: admin-roles-artes-produtos-grid
status: drafting
intent: clear
review_required: false
pending-action: write .omo/plans/admin-roles-artes-produtos-grid.md
approach: Roles RBAC no AdminUser/JWT/middleware + seção "Conteúdo" (tags e artes com busca/download) + refatorar /admin/produtos para grade com foco em imagem e pills.
---

# Draft: admin-roles-artes-produtos-grid

## Components (topology ledger)
<!-- Lock the SHAPE before depth. One row per top-level component that can succeed or fail independently. -->
<!-- id | outcome (one line) | status: active|deferred | evidence path -->
| id | outcome | status | evidence path |
| --- | --- | --- | --- |
| roles-rbac | AdminUser ganha role T1/T2 + isActive; JWT, middleware, layout e sidebar respeitam o papel | active | .omo/evidence/task-*-roles.md |
| usuarios | Página admin "Usuários" (T1) para criar/editar vendedores e papéis | active | .omo/evidence/task-*-usuarios.md |
| conteudo-artes | Modelos ArtTag/ArtFile + seção "Conteúdo" (tags + artes) + busca/download do vendedor + storage em Google Drive | active | .omo/evidence/task-*-conteudo.md |
| produtos-grid | /admin/produtos vira grade com foco na imagem e pills; catálogo público ganha pills adicionais | active | .omo/evidence/task-*-grid.md |
| seed-backfill | Seed backfill role T1 + cria vendedor demo T2 + tags iniciais de arte | active | .omo/evidence/task-*-seed.md |

## Open assumptions (announced defaults)
<!-- Record any default you adopt instead of asking, so the user can veto it at the gate. -->
<!-- assumption | adopted default | rationale | reversible? -->
| assumption | adopted default | rationale | reversible? |
| --- | --- | --- | --- |
| O que o vendedor (T2) vê no painel | Somente a seção "Conteúdo" (artes + busca/download). T1 vê tudo | O papel T2 existe para adicionar/baixar artes; nada mais foi pedido | Sim (fácil de ampliar depois) |
| Quem gerencia tags | Apenas T1 cria/edita/exclui tags; T2 seleciona tags existentes ao adicionar arte | "os vendedores vão poder adicionar e baixar artes/arquivos" não inclui gestão de tags | Sim |
| Tipos de arquivo de arte aceitos | Preview: imagem/* (png, jpg, webp). Original: .cdr, .svg, .pdf, imagem — máx 20 MB. Sem conversão sharp (arquivo original vai ao Drive) | Arte = vetor/logo do cliente (cdr), não foto de produto | Sim |
| Storage das artes | Google Drive via service account (googleapis): pasta dedicada; IDs dos arquivos no banco; preview e original servidos por API autenticada (stream) — NUNCA link público | Decisão do usuário: "mudar para o google drive... imagem da arte quanto o arquivo da arte (cdr)" | Sim |
| Auth do Drive | `google.auth.GoogleAuth` com service account JSON via env `GOOGLE_SERVICE_ACCOUNT_JSON`; scope `drive.file`; upload em `GOOGLE_DRIVE_ARTS_FOLDER_ID` | GoogleAuth keyFile não funciona no Vercel (sem arquivo); JSON em env é o padrão serverless | Sim |
| Role padrão de usuários existentes | `T1_GERENCIA` via `@default` no schema (nada quebra); login rejeita usuário inativo | Só admins existem hoje; vendedores serão criados como T2 | Sim |
| Sessão | Mantém cookie 7d; payload do JWT ganha `role` e `isActive` | Sem mudança de contrato de sessão | Sim |
| Exclusão de arte | T1 pode excluir arte/tag; T2 só adiciona + baixa | Guardrail de contenção | Sim |
| Upload de produtos/imagens | Continua no R2 (`/api/admin/upload` intacto). Somente ARTES migram para o Drive | Escopo pedido: refatorar o download/armazenamento de artes | Sim |

## Findings (cited - path:lines)
- Auth atual: JWT HS256 via jose, cookie HttpOnly `admin_token` (7d), payload `{ sub, email }` SEM role — `src/app/api/admin/auth/login/route.ts:43-46`; validação apenas de existência/assinatura em `src/middleware.ts:7-30` e `src/app/(admin)/layout.tsx:16-25`.
- `AdminUser` NÃO tem campo de role — `prisma/schema.prisma:136-142`.
- Sidebar admin é estática (lista NAV fixa) — `src/app/(admin)/_components/AdminSidebarClient.tsx:19-29`.
- Upload atual é SOMENTE imagem (sharp valida magic bytes + converte WebP) — `src/app/api/admin/upload/route.ts:11,35-72,74`; bucket R2 público via `NEXT_PUBLIC_R2_URL` — `src/lib/r2.ts:51`.
- `/admin/produtos` hoje é tabela com AnimatedTableRows — `src/app/(admin)/admin/produtos/page.tsx:38-59`, `AnimatedTableRows.tsx:18-89`.
- Catálogo público JÁ é grade com foco em imagem + badge de tecido — `src/components/products/ProductGrid.tsx:32-44`, `ProductCard.tsx:22-62` (usado por category page, busca e FeaturedSection).
- Seed cria admin sem role — `prisma/seed.ts:20-26`. README manda `npx prisma db push` (sem pasta migrations no repo).
- Padrões prontos para reuso: CSRF (`src/lib/csrf.ts`), rate limit (`src/lib/ratelimit.ts`), Zod v4 (`src/lib/validations/`), tests Vitest (`src/__tests__/`), Playwright admin-auth (`tests/e2e/admin-auth.spec.ts`).
- `googleapis` NÃO instalado — `package.json` (deps). Padrão Drive confirmado: `google.drive('v3')` + `google.auth.GoogleAuth({ keyFile|credentials, scopes })`; upload `drive.files.create({ requestBody:{name,mimeType,parents}, media:{mimeType,body} })` → `res.data.id`; download `drive.files.get({fileId, alt:'media'}, {responseType:'stream'})` (context7 googleapis).
- Plano anterior concluído `admin-imagens-medidas` (SizeChart) mostra o formato de plano/todos usado — `.omo/plans/admin-imagens-medidas.md`.

## Decisions (with rationale)
- **Q1 — Grade: admin + catálogo público.** /admin/produtos deixa a tabela e vira grade de cards (imagem primária grande + pills status/destaque/categoria/tecido/qtd mínima). Catálogo público (ProductCard) ganha pills adicionais (categoria + qtd mínima) mantendo `data-testid="product-card"` e o badge de tecido. Rationale: usuário pediu grade "ao invés de linhas" e confirmou os dois lados.
- **Q2 — Página admin "Usuários" (T1).** CRUD leve de AdminUser: criar vendedor (nome/e-mail/senha/papel), listar, alternar papel, ativar/desativar, reset de senha. Rationale: sem UI não há como criar vendedores em produção.
- **Q3 — Artes no Google Drive (service account).** Cada arte = 2 arquivos no Drive: preview (imagem) + original (.cdr/.svg/.pdf/…) dentro da pasta `GOOGLE_DRIVE_ARTS_FOLDER_ID`, IDs persistidos no banco. Download/preview servidos por API autenticada (stream do Drive, validando JWT do vendedor) — arquivos ficam privados do service account, sem link público. Rationale: decisão explícita do usuário; mantém as artes confidenciais.
- **Q4 — tests-after** (Vitest p/ schemas Zod e helpers RBAC, mock do drive; type-check; QA manual). Alinhado ao padrão atual do repo.
- **RBAC:** `enum AdminRole { T1_GERENCIA T2_VENDEDOR }` + `isActive` no AdminUser. JWT ganha `role`+`isActive`; middleware decodifica e faz o gate por rota/método; AdminLayout decodifica para filtrar sidebar e proteger páginas; login rejeita inativos.
- **Permissões T2:** páginas `/admin/conteudo*`; APIs `/api/admin/art-tags` (GET), `/api/admin/arts` (GET/POST), `/api/admin/arts/upload` (POST), `/api/admin/arts/[id]` (PATCH/DELETE **somente das próprias** — check `createdById` dentro da rota), `/api/admin/arts/[id]/preview` (GET), `/api/admin/arts/[id]/download` (GET), logout. Todo o resto = T1.
- **Revogação imediata (Gap 4):** checagem por requisição. Middleware continua edge (jose, sem Prisma) validando assinatura; `AdminLayout` (server component) faz o lookup `prisma.adminUser.findUnique` por requisição de página — redirect se role proibida ou `isActive=false`; APIs usam helper compartilhado `requireAdmin()` (JWT + lookup role/isActive, 401 se inválido). Desativou → perde acesso na hora.
- **Login redirect por papel:** T1 → `/admin/dashboard`; T2 → `/admin/conteudo` (`src/app/admin/login/page.tsx:33`).
- **Migração:** `npx prisma db push` + `prisma generate` (padrão do repo, sem pasta migrations).

## Scope IN
- Roles T1/T2 + isActive: schema, login, JWT, middleware, layout, sidebar, login bloqueia inativos.
- Página "Usuários" (T1): criar/editar/desativar vendedores, alternar papel, reset de senha.
- Seção "Conteúdo": CRUD de tags (T1) + biblioteca de artes (upload preview+original p/ Drive, busca por nome/tag, filtro por pills de tag, download, preview; **T2 edita/exclui as próprias, T1 tudo**).
- Lib `src/lib/drive.ts` (googleapis) + env vars + .env.example/README.
- APIs de artes/tags/upload/download com CSRF + rate limit + Zod + helper `requireAdmin()`.
- /admin/produtos em grade (imagem + pills) + ProductCard público com pills (tecido já existe + **categoria + "Mín. N peças"**).
- Seed: backfill role T1, vendedor demo T2, tags iniciais livres (ex.: escudo, mascote, futebol, basquete…).
- Testes Vitest (schemas, RBAC helper, validação de payload de arte) + QA manual.

## Scope OUT (Must NOT have)
- NÃO migrar upload de produtos/imagens do R2 — `/api/admin/upload` intacto.
- NÃO usar "anyone with link" / URL pública do Drive para artes.
- NÃO alterar fluxo público de produtos além das pills do ProductCard (sem novo design system, sem páginas novas públicas).
- NÃO tocar páginas admin não relacionadas (leads, depoimentos, faqs, instagram, medidas, modalidades, tamanhos) exceto o gate do middleware/sidebar.
- NÃO implementar recuperação de senha por e-mail (reset apenas via página Usuários).
- NÃO criar paginação (volume baixo, consistente com o resto do admin).

## Open questions
- (resolvidas — ver Decisions)
- **Gap 1 → T2 gerencia as próprias:** PATCH/DELETE `/api/admin/arts/[id]` liberados para T2 com verificação de ownership (`createdById === userId`) dentro da rota; 403 se não for dono. Tags continuam T1-only.
- **Gap 2 → Tags livres:** `ArtTag` plano (name + slug único), sem vínculo com cliente/time. T1 cria/edita/exclui; T2 seleciona as existentes.
- **Gap 3 → Pills públicas:** ProductCard mantém badge de tecido + ganha pill de categoria e pill "Mín. N peças".
- **Gap 4 → Revogação imediata:** `requireAdmin()`/`AdminLayout` com lookup no banco por requisição (role + isActive); middleware edge mantido para assinatura/redirect.

## Approval gate
status: awaiting-approval
approach: RBAC (roles T1/T2) no schema/login/JWT/middleware/sidebar + página "Usuários" (T1) + seção "Conteúdo" com tags e artes no Google Drive (service account, preview+original, busca por tag, download autenticado) + grade de produtos (admin e pills no catálogo público) + seed/testes.
next action: após OK explícito do usuário → gerar `.omo/plans/admin-roles-artes-produtos-grid.md` (scaffold sem --draft-only), Metis, APPEND todos, TL;DR por último.
<!-- Quando exploração estiver esgotada e as incógnitas respondidas, marcar status: awaiting-approval. -->
<!-- Esse registro durável é o loop guard: em turno posterior, lê-lo e retomar no portão em vez de re-explorar. -->
### Pré-requisito externo (ação do usuário, não do implementador)
1. Criar projeto no Google Cloud + habilitar Google Drive API.
2. Criar service account e baixar a chave JSON.
3. Criar pasta no Drive (ex.: "Artes Fase Sport") e compartilhar com o e-mail do service account (Editor).
4. Definir `GOOGLE_SERVICE_ACCOUNT_JSON` (chave JSON inteira) e `GOOGLE_DRIVE_ARTS_FOLDER_ID` no .env.local / Vercel.
O implementador documenta isso no .env.example/README; os fluxos de arte exigem as credenciais para QA real (com mock nos testes unitários).
