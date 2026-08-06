# admin-roles-artes-produtos-grid - Work Plan

## TL;DR (For humans)

**What you'll get:** O painel administrativo passa a ter dois níveis de acesso — gerência (vê tudo) e vendedor (vê só a nova área "Conteúdo", onde adiciona e baixa artes). Uma página "Usuários" permite à gerência criar/desativar vendedores. Artes deixam de ficar espalhadas e passam a ser enviadas ao Google Drive (pasta privada, com visualização e download protegidos por login). A lista de produtos do admin vira uma grade com fotos, e os cards do site ganham etiquetas de categoria e de quantidade mínima de peças.

**Why this approach:** A segurança é feita no servidor a cada acesso (não só no navegador), então um vendedor desativado perde o acesso na hora e nunca recebe dados que não pode ver. O Google Drive foi a escolha pedida para guardar as artes, mantendo tudo privado — nada de link público.

**What it will NOT do:** Não mexe no envio de fotos de produtos (continua no Cloudflare R2). Não apaga usuários do banco (desativa). Não cria recuperação de senha por e-mail. Não permite que o vendedor gerencie tags ou edite artes de outros.

**Effort:** Large
**Risk:** Medium - novo armazenamento externo (Google Drive) + mudança no fluxo de login e permissões do admin
**Decisions to sanity-check:** 1) Vendedor (T2) vê APENAS a área Conteúdo — nada mais do painel; 2) Artes no Google Drive via conta de serviço (requer criar uma conta Google Cloud + pasta compartilhada com ela); 3) Produtos seguem no R2, só artes migram.

Your next move: aprovar o plano (ou apontar ajustes). Full execution detail follows below.

---

> TL;DR (machine): Large effort, Medium risk — RBAC T1/T2 com revogação imediata (gate server-side), página Usuários, área Conteúdo (artes no Google Drive via service account + tags), grade de produtos no admin e pills no catálogo. 18 todos, 4 waves, testes-after.

## Scope
### Must have
- **RBAC**: `enum AdminRole { T1_GERENCIA T2_VENDEDOR }` + `isActive` no `AdminUser`; login valida inativo e emite JWT com `role`/`isActive`; helper `src/lib/auth.ts` com checagem por requisição (banco) para páginas (`requireAdmin`) e APIs (`requireApiAdmin`); `canAccessRoute` (matcher puro, testável); `AdminLayout` protege páginas (T2 fora de `/admin/conteudo*` → redirect); sidebar filtrada por papel; login redireciona por papel (T1 → dashboard, T2 → `/admin/conteudo`).
- **Página "Usuários" (T1)**: `/admin/usuarios` + APIs `/api/admin/users` (GET/POST) e `/api/admin/users/[id]` (PATCH) — criar vendedor (nome/e-mail/senha/papel), listar, alternar papel, ativar/desativar, reset de senha; guard de não auto-desativação.
- **Seção "Conteúdo"**: sidebar nova `Conteúdo` → `/admin/conteudo` com abas **Artes** | **Tags** (aba Tags só T1).
  - **Artes**: biblioteca com preview, nome, descrição, pills de tags, quem adicionou; busca por nome (`q`) e filtro por pills de tag; upload (preview + original) para **Google Drive**; download autenticado do original; preview autenticado; editar metadados (nome/desc/tags) e excluir — **T2 só nas próprias** (`createdById`), T1 em todas; tags geridas só por T1.
  - **Storage**: `googleapis` + service account (scope `drive.file`); arquivos na pasta `GOOGLE_DRIVE_ARTS_FOLDER_ID`; IDs no banco; preview/original servidos por stream via API autenticada — **nunca** link público.
- **Grade de produtos admin**: `/admin/produtos` deixa a tabela → grade de cards com imagem primária grande e pills (status Ativo/Inativo, Destaque, Categoria, Tecido, "Mín. N peças"); link Editar; estado vazio; apagar `AnimatedTableRows.tsx`.
- **Catálogo público**: `ProductCard` ganha pills de **categoria** e **"Mín. N peças"** (mantém badge de tecido, `data-testid="product-card"`, overlay "Ver Detalhes", "Sob consulta"); queries de homepage/FeaturedSection, categoria e busca repassam `categoryName` + `minQty`.
- **Seed**: backfill `T1_GERENCIA`/`isActive` via default do schema; vendedor demo T2 via env `SELLER_SEED_EMAIL`/`SELLER_SEED_PASSWORD`; tags iniciais (Escudo, Mascote, Patrocinador, Futebol, Vôlei, Basquete, Handebol, Número, Time).
- **Testes** (tests-after): Vitest para `canAccessRoute` e schemas Zod novos; type-check/lint/build no CI.

### Must NOT have (guardrails, anti-slop, scope boundaries)
- NÃO migrar upload de produtos/imagens do R2 — `/api/admin/upload` e `src/lib/r2.ts` intactos (só ARTES vão para o Drive).
- NÃO usar "anyone with link" / URL pública do Drive para artes (nem preview nem original).
- NÃO alterar o middleware atual de forma a exigir banco no edge — validação por requisição vive no `AdminLayout` (páginas) e no `requireApiAdmin` (APIs).
- NÃO tocar páginas admin fora do escopo (leads, depoimentos, faqs, instagram, medidas, modalidades, tamanhos) além do gate do layout/sidebar.
- NÃO criar paginação (volume baixo, padrão do admin).
- NÃO implementar recuperação de senha por e-mail (reset só via página Usuários).
- NÃO adicionar vínculo arte↔cliente/time (tags livres, conforme decisão).
- NÃO deletar usuários do banco (desativar via `isActive`).

## Verification strategy
> Zero human intervention - all verification is agent-executed.
- Test decision: tests-after + Vitest (unit) + type-check/lint/build; QA manual com credenciais reais do Drive quando disponíveis
- Evidence: .omo/evidence/task-<N>-admin-roles-artes-produtos-grid.md

## Execution strategy
### Parallel execution waves
> Target 5-8 todos per wave. Fewer than 3 (except the final) means you under-split.
- **Wave 1 — RBAC + Usuários** (todos 1–8): schema, login, lib auth, layout, sidebar, redirect de login, APIs de usuários, página Usuários.
- **Wave 2 — Conteúdo (Google Drive + tags + artes)** (todos 9–14): drive lib, validações, env/docs, APIs de tags, APIs de artes, página Conteúdo.
- **Wave 3 — Produtos** (todos 15–17): grade admin, pills públicas, seed.
- **Wave 4 — Fechamento** (todo 18): suíte completa + evidência.

### Dependency matrix
| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1. Schema Prisma | — | 2,3,7,10,12,13,17 | 9,11 |
| 2. Login route | 1 | 6 | 3 |
| 3. Lib auth | 1 | 4,7,12,13 | 2 |
| 4. AdminLayout | 3 | 14 | 5,6 |
| 5. Sidebar | 4 | 14 | 6 |
| 6. Login redirect | 2 | — | 4 |
| 7. APIs Usuários | 1,3 | 8 | — |
| 8. Página Usuários | 7 | — | 4 |
| 9. Drive lib | — | 13 | 1,10,11 |
| 10. Validações artes | 1 | 12,13 | 9 |
| 11. Env + docs | — | 13 (credenciais) | 9,10 |
| 12. APIs tags | 1,3,10 | 13 | — |
| 13. APIs artes | 1,3,9,10,12 | 14 | — |
| 14. Página Conteúdo | 4,5,12,13 | — | 15,16 |
| 15. Grade admin | — | — | 14,16 |
| 16. Pills públicas | — | — | 14,15 |
| 17. Seed | 1 | — | 14,15,16 |
| 18. QA final | 1–17 | — | — |

## Todos
> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->
- [ ] 1. Adicionar AdminRole/ArtTag/ArtFile ao schema Prisma + db push
  What to do / Must NOT do:
  a. Em prisma/schema.prisma, adicionar:
     ```prisma
     enum AdminRole {
       T1_GERENCIA
       T2_VENDEDOR
     }
     ```
  b. No model AdminUser (linhas 136-142 atuais), adicionar SEM REMOVER nada existente:
     ```prisma
     role         AdminRole @default(T1_GERENCIA)
     isActive     Boolean   @default(true)
     artsCreated  ArtFile[]
     ```
     NÃO adicionar `updatedAt` ao AdminUser (tabela já tem linhas; db push falharia em NOT NULL sem default).
  c. Adicionar no final do arquivo:
     ```prisma
     model ArtTag {
       id   String    @id @default(cuid())
       name String    @unique
       slug String    @unique
       arts ArtFile[]
     }

     model ArtFile {
       id               String    @id @default(cuid())
       name             String
       description      String?
       previewFileId    String    // Drive file id da imagem de preview
       previewMimeType  String
       originalFileId   String    // Drive file id do arquivo original (.cdr/.svg/.pdf)
       originalFileName String    // ex.: "escudo-corinthians.cdr"
       originalMimeType String
       sizeBytes        Int?
       createdAt        DateTime  @default(now())
       updatedAt        DateTime  @updatedAt
       createdBy        AdminUser? @relation(fields: [createdById], references: [id], onDelete: SetNull)
       createdById      String?
       tags             ArtTag[]
     }
     ```
     NÃO incluir `isActive` em ArtFile: a exclusão é hard delete (todo 13c), campo seria morto.
  d. Rodar `npx prisma db push` e depois `npx prisma generate` (padrão do repo, NUNCA `prisma migrate`).
  Must NOT do: não alterar outros models; não criar relação ArtFile↔Category; não usar o nome `Art` (colide com lib de arte do Next).
  Parallelization: Wave 1 | Blocked by: — | Blocks: 2,3,7,10,12,13,17
  References: prisma/schema.prisma:136-142 (AdminUser), :9-70 (padrão de models), README.md (comandos `npx prisma db push`)
  Acceptance criteria (agent-executable): `npx prisma generate` e `npx tsc --noEmit` passam; `npx prisma db push` aplica sem erro; `@prisma/client` expõe `AdminRole`, `ArtTag`, `ArtFile`.
  QA scenarios (nomeie a ferramenta exata + invocação): happy: `npx prisma db push` sai 0 e `npx tsc --noEmit` sai 0. failure: reverter um campo e conferir que db push falha (prova de que o comando roda de verdade). Evidence .omo/evidence/task-1-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add AdminRole and art models to Prisma schema

- [ ] 2. Login admin: payload com role/isActive + rejeita inativo
  What to do / Must NOT do:
  a. Em src/app/api/admin/auth/login/route.ts: logo após o bloco `if (!user || !(await bcrypt.compare(...)))` (linhas 37-39), adicionar:
     ```ts
     if (!user.isActive) {
       return Response.json({ message: "Usuário inativo. Fale com o administrador." }, { status: 401 });
     }
     ```
  b. Trocar o payload do SignJWT (linha 41) para `{ sub: user.id, email: user.email, role: user.role, isActive: user.isActive }`. O sign continua com `getJwtSecret()` (linha 44) — não trocar.
  c. Retorno de sucesso (linha 46): `Response.json({ success: true, role: user.role })` para o cliente redirecionar por papel.
  Must NOT do: não mudar expiração (7d), nome do cookie, flags do cookie, nem o schema de validação LoginSchema; não trocar `getJwtSecret()` por fallback inline.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 6
  References: src/app/api/admin/auth/login/route.ts:7-8 (imports getJwtSecret/LoginSchema), :35-53 (fluxo atual), src/lib/auth-jwt.ts, src/lib/validations/auth.ts:1-8
  Acceptance criteria: `npx tsc --noEmit` passa; payload contém role/isActive; login de usuário com isActive=false retorna 401.
  QA scenarios: happy: POST /api/admin/auth/login com credenciais válidas retorna `{ success: true, role }` e cookie setado. failure: usuário desativado → 401 "Usuário inativo" (criar usuário inativo via prisma antes). Evidence .omo/evidence/task-2-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add role and isActive claims to login

- [ ] 3. Criar src/lib/auth.ts (getAdminUser/requireAdmin/requireApiAdmin/canAccessRoute) + testes
  What to do / Must NOT do:
  a. Criar src/lib/auth.ts:
     - `export async function getAdminUser(): Promise<AdminUser | null>` — lê cookie `admin_token` via `await cookies()` (next/headers), `jwtVerify` com `getJwtSecret()` de `@/lib/auth-jwt` (mesmo helper do login e do middleware — NÃO duplicar fallback inline), extrai `payload.sub`, busca `prisma.adminUser.findUnique({ where: { id: payload.sub } })`, retorna null se token ausente/inválido/usuário inexistente/**!isActive**.
     - `export async function requireAdmin(): Promise<AdminUser>` — chama getAdminUser; se null → `redirect("/admin/login")` (next/navigation). Uso em server components/layout.
     - `export async function requireApiAdmin(): Promise<AdminUser | NextResponse>` — chama getAdminUser; se null → `NextResponse.json({ message: "Não autenticado" }, { status: 401 })`. Uso em API routes (checar `instanceof NextResponse` no chamador).
     - `export function canAccessRoute(role: AdminRole, pathname: string, method: string): boolean` — matcher PURO (sem IO):
       - role === "T1_GERENCIA" → true para qualquer path que comece com `/admin` ou `/api/admin` (inclui `/admin/login` e auth — mas essas rotas são públicas e nunca chegam aqui).
       - role === "T2_VENDEDOR" → true SOMENTE para:
         - pathname === "/admin/conteudo" ou startsWith "/admin/conteudo/"
         - `/api/admin/art-tags` com method GET
         - `/api/admin/arts` com method GET
         - `/api/admin/arts/upload` com method POST
         - pathname que casa `^/api/admin/arts/[^/]+$` (um só segmento após arts) com method PATCH ou DELETE  ← ownership é checado na rota (createdById), NÃO aqui
         - pathname que casa `^/api/admin/arts/[^/]+/(preview|download)$` com method GET
         - `/api/admin/auth/logout` com method POST
       - caso contrário → false.
  b. Criar src/__tests__/lib/rbac.test.ts cobrindo: T1 true em /admin/dashboard, /admin/produtos, /api/admin/users POST, /api/admin/art-tags DELETE; T2 true em /admin/conteudo, /admin/conteudo/x, GET /api/admin/arts, POST /api/admin/arts/upload, GET /api/admin/arts/abc/download, PATCH /api/admin/arts/abc, POST /api/admin/auth/logout; T2 false em /admin/dashboard, /admin/produtos, GET /api/admin/art-tags (método errado? NÃO — GET /api/admin/art-tags é true), PATCH /api/admin/art-tags/1, GET /api/admin/users, DELETE /api/admin/arts/abc (é true pelo matcher — a negação de DELETE vem do ownership na rota; NÃO testar como false aqui), /admin/usuarios.
  Must NOT do: não colocar lógica de banco dentro de canAccessRoute; não tocar src/middleware.ts (continua edge, só assinatura — ele JÁ retorna 401 JSON para APIs, manter).
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 4,7,12,13
  References: src/lib/auth-jwt.ts (getJwtSecret), src/app/api/admin/auth/login/route.ts:7,35-53, src/middleware.ts:1-40 (comportamento atual), prisma/schema.prisma:136-142 (AdminUser), src/__tests__/validations/auth.test.ts (padrão de teste)
  Acceptance criteria: `npx tsc --noEmit` e `npm run test:unit` passam (novo rbac.test.ts verde).
  QA scenarios: happy: `npx vitest run src/__tests__/lib/rbac.test.ts` passa todos os casos. failure: alterar um caso esperado e ver o teste falhar (prova que a suíte roda). Evidence .omo/evidence/task-3-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add per-request auth helper with role matcher

- [ ] 4. Gate de papel por requisição: AdminLayout + route group (t1) — server-side
  What to do / Must NOT do:
  a. src/app/(admin)/layout.tsx: substituir a verificação manual jwtVerify (linhas 16-25) por:
     ```ts
     import { getAdminUser } from "@/lib/auth";
     // dentro do componente, antes do return:
     const user = await getAdminUser();
     if (!user) redirect("/admin/login");
     ```
     Passar `role={user.role}` para `<AdminSidebarClient role={user.role} />`. Remover imports agora não usados (`cookies`, `jwtVerify`).
  b. Gate server-side por pathname SEM depender de pathname no server: criar o route group `(t1)` (route groups NÃO mudam a URL). Mover os 9 diretórios T1-only para dentro dele:
     ```
     git mv "src/app/(admin)/admin/produtos"     "src/app/(admin)/admin/(t1)/produtos"
     git mv "src/app/(admin)/admin/dashboard"    "src/app/(admin)/admin/(t1)/dashboard"
     git mv "src/app/(admin)/admin/medidas"      "src/app/(admin)/admin/(t1)/medidas"
     git mv "src/app/(admin)/admin/modalidades"  "src/app/(admin)/admin/(t1)/modalidades"
     git mv "src/app/(admin)/admin/leads"        "src/app/(admin)/admin/(t1)/leads"
     git mv "src/app/(admin)/admin/faqs"         "src/app/(admin)/admin/(t1)/faqs"
     git mv "src/app/(admin)/admin/categorias"   "src/app/(admin)/admin/(t1)/categorias"
     git mv "src/app/(admin)/admin/depoimentos"  "src/app/(admin)/admin/(t1)/depoimentos"
     git mv "src/app/(admin)/admin/instagram"    "src/app/(admin)/admin/(t1)/instagram"
     ```
     No Windows, citar sempre os caminhos (parênteses). Sub-diretórios (`_components/`, `[id]/`, `novo/`) movem junto. `/admin/usuarios` será criado DIRETAMENTE sob `(t1)` no todo 8 (não existe hoje — não entrar no git mv). `/admin/conteudo` fica FORA do grupo (acessível a T1 e T2).
  c. Criar src/app/(admin)/admin/(t1)/layout.tsx:
     ```tsx
     import { redirect } from "next/navigation";
     import { getAdminUser } from "@/lib/auth";

     export default async function T1AreaLayout({ children }: { children: React.ReactNode }) {
       const user = await getAdminUser();
       if (!user) redirect("/admin/login");
       if (user.role !== "T1_GERENCIA") redirect("/admin/conteudo");
       return <>{children}</>;
     }
     ```
     POR QUE: gate 100% server-side, consulta o banco por requisição ANTES do render — um T2 nunca recebe o HTML/RSC de páginas T1 (ex.: /admin/leads contém PII — LGPD). Guard client-side (usePathname/useEffect) vazaria os dados no RSC payload. Duas lookups de banco por página (layout pai + (t1)) são aceitáveis (Neon, volume baixo).
  d. NÃO criar AdminGuardClient nem qualquer guard client-side. NÃO tocar src/middleware.ts.
  Must NOT do: não depender de pathname no layout server (o route group resolve sem pathname); não usar guard client-side para segurança; conferir `git status` após o git mv (o projeto usa alias `@/`, não deve haver import relativo quebrado).
  Parallelization: Wave 1 | Blocked by: 3 | Blocks: 14
  References: src/app/(admin)/layout.tsx:16-25 (verificação atual), src/app/(admin)/admin/* (9 dirs), src/lib/auth.ts (novo, todo 3), src/app/(admin)/_components/AdminSidebarClient.tsx (receberá prop role)
  Acceptance criteria: `npx tsc --noEmit` passa; com cookie de T2, /admin/dashboard responde 307 para /admin/conteudo SEM corpo com dados; T1 → 200; usuário inativo → /admin/login.
  QA scenarios: happy: `curl -s -o /dev/null -w "%{http_code} %{redirect_url}" http://localhost:3000/admin/dashboard` com cookie T2 → `307 http://localhost:3000/admin/conteudo`; com T1 → `200`. failure: desativar o usuário logado (via prisma) e repetir → `307` para /admin/login (layout pai). Evidence .omo/evidence/task-4-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): guard admin pages server-side by role via (t1) route group

- [ ] 5. Sidebar: filtro por papel + itens Conteúdo e Usuários
  What to do / Must NOT do:
  a. Em src/app/(admin)/_components/AdminSidebarClient.tsx, adicionar prop `role: "T1_GERENCIA" | "T2_VENDEDOR"` (interface própria).
  b. Estender o NAV com dois itens novos:
     - `{ href: "/admin/conteudo", label: "Conteúdo", icon: Images }` (importar `Images` de lucide-react)
     - `{ href: "/admin/usuarios", label: "Usuários", icon: UserCog }` (importar `UserCog`)
  c. Filtrar: se role === "T2_VENDEDOR" → renderizar APENAS o item Conteúdo; senão → NAV completo.
  d. Manter todas as animações framer-motion existentes e o layoutId "admin-nav-active".
  Must NOT do: não alterar outros itens do NAV; não mudar hrefs existentes.
  Parallelization: Wave 1 | Blocked by: 4 | Blocks: 14
  References: src/app/(admin)/_components/AdminSidebarClient.tsx:19-29 (NAV), :31-79 (render)
  Acceptance criteria: `npx tsc --noEmit` passa; sidebar de T2 mostra só "Conteúdo"; de T1 mostra todos (incluindo Conteúdo e Usuários).
  QA scenarios: happy: logar como T2 → sidebar com 1 item; logar como T1 → sidebar com 11 itens. failure: passar role inválido → type-check falha (TS error). Evidence .omo/evidence/task-5-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): filter sidebar by role and add Conteúdo/Usuários links

- [ ] 6. Login page: redirect por papel
  What to do / Must NOT do:
  a. Em src/app/admin/login/page.tsx, no handleSubmit após `res.ok` (linhas 26-33): ler `const data = await res.json();` e:
     ```ts
     router.refresh();
     router.push(data.role === "T2_VENDEDOR" ? "/admin/conteudo" : "/admin/dashboard");
     ```
  Must NOT do: não alterar o form, o estilo, nem o endpoint.
  Parallelization: Wave 1 | Blocked by: 2 | Blocks: —
  References: src/app/admin/login/page.tsx:20-35
  Acceptance criteria: `npx tsc --noEmit` passa; login T1 → /admin/dashboard; login T2 → /admin/conteudo.
  QA scenarios: happy: login com vendedor demo → URL /admin/conteudo. failure: login com senha errada mantém erro na tela (comportamento existente intacto). Evidence .omo/evidence/task-6-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): redirect login by role

- [ ] 7. APIs de Usuários (GET/POST /api/admin/users, PATCH /api/admin/users/[id])
  What to do / Must NOT do:
  a. Criar src/app/api/admin/users/route.ts:
     - `export const dynamic = "force-dynamic";`
     - GET: `const auth = await requireApiAdmin(); if (auth instanceof NextResponse) return auth; if (!canAccessRoute(auth.role, req.nextUrl.pathname, "GET")) return 403;` listar `prisma.adminUser.findMany({ select: { id, email, name, role, isActive, createdAt }, orderBy: { createdAt: "desc" } })`. NUNCA retornar passwordHash.
     - POST: CSRF (`validateCsrf(req)`), rate limit (`adminRatelimit` ou reusar padrão), Zod `UserCreateSchema` (em src/lib/validations/auth.ts: `z.object({ name: z.string().min(2).max(100), email: z.email(), password: z.string().min(8), role: z.enum(["T1_GERENCIA","T2_VENDEDOR"]) })`), `bcrypt.hash(password, 12)`, tratar email duplicado (Prisma P2002) → 409 "E-mail já cadastrado".
  b. Criar src/app/api/admin/users/[id]/route.ts (PATCH):
     - Assinatura OBRIGATÓRIA (Next.js 16 — params é Promise, sempre `await`): `export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) { const { id } = await ctx.params; ... }`
     - Body: `{ name?, role?, isActive?, password? }` (Zod parcial). Se `password` → hash 12.
     - Guard: `if (id === auth.user.id && isActive === false) return 403 "Você não pode desativar a si mesmo"`.
     - Proibido trocar role para o próprio usuário? NÃO — apenas o guard de auto-desativação; role próprio pode mudar (decisão: permitir, T1 é soberano). Simplificar: apenas guard de auto-desativação.
  c. T1-only via canAccessRoute em ambos (T2 → 403).
  Must NOT do: não criar DELETE (desativação é via PATCH isActive:false); não expor passwordHash; não reusar o LoginSchema (criar UserCreateSchema).
  Parallelization: Wave 1 | Blocked by: 1,3 | Blocks: 8
  References: src/app/api/admin/auth/login/route.ts (padrão CSRF? — CSRF está no upload: src/app/api/admin/upload/route.ts:15-22; ratelimit src/lib/ratelimit.ts; errors src/lib/errors.ts), src/lib/csrf.ts, src/lib/validations/auth.ts
  Acceptance criteria: `npx tsc --noEmit` passa; POST cria usuário com hash bcrypt; PATCH desativa; T2 recebe 403; auto-desativação recebe 403.
  QA scenarios: happy: POST cria vendedor e GET lista sem passwordHash; PATCH isActive:false → login do usuário passa a dar 401 (todo 2 já cobre). failure: PATCH de T2 → 403; desativar a si mesmo → 403; email duplicado → 409. Evidence .omo/evidence/task-7-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add users management API (T1 only)

- [ ] 8. Página /admin/usuarios (T1) com criar/editar — criada DENTRO do route group (t1)
  What to do / Must NOT do:
  a. Criar src/app/(admin)/admin/(t1)/usuarios/page.tsx (server): `const users = await prisma.adminUser.findMany({ select: { id, email, name, role, isActive, createdAt }, orderBy: { createdAt: "desc" } })` + `<UsuariosClient users={users} />`. `export const dynamic = "force-dynamic";`
     IMPORTANTE: criar DIRETAMENTE sob `(t1)` (URL continua /admin/usuarios). Não criar em `admin/usuarios/` (conflitaria com o git mv do todo 4 se rodarem juntos).
  b. Criar src/app/(admin)/admin/(t1)/usuarios/_components/UsuariosClient.tsx ("use client"):
     - Tabela: Nome, E-mail, Papel (pill: T1 vermelho/brand, T2 accent), Status (pill Ativo/Inativo), Criado em, Ações.
     - Dialog "Novo usuário": nome, e-mail, senha, papel → POST /api/admin/users → router.refresh().
     - Dialog "Editar" por linha: papel (select), ativo (checkbox), nova senha (opcional) → PATCH /api/admin/users/[id].
     - Feedback de erro inline (message da API); estado de loading no botão.
  c. Reusar `Dialog` de src/components/ui/dialog.tsx e `Button`.
  Must NOT do: não permitir editar a si mesmo o isActive (o backend rejeita — refletir com mensagem); não adicionar paginação.
  Parallelization: Wave 1 | Blocked by: 7 | Blocks: —
  References: src/app/(admin)/admin/(t1)/usuarios/ (novo — obrigatório o (t1)), src/components/ui/dialog.tsx, src/app/(admin)/admin/(t1)/leads/page.tsx (padrão de tabela/painel — já movido no todo 4)
  Acceptance criteria: `npx tsc --noEmit` passa; a página cria, lista, edita papel/status e reseta senha; T2 não acessa (layout já redireciona).
  QA scenarios: happy: criar vendedor pela UI e ver na tabela; trocar papel para T1 e voltar a T2. failure: criar com e-mail duplicado → mensagem "E-mail já cadastrado" exibida. Evidence .omo/evidence/task-8-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add users management page

- [ ] 9. Instalar googleapis + criar src/lib/drive.ts
  What to do / Must NOT do:
  a. `npm i googleapis`.
  b. Criar src/lib/drive.ts:
     ```ts
     import { google } from "googleapis";

     function getCredentials() {
       const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
       if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON não configurada");
       return JSON.parse(raw) as Record<string, unknown>;
     }

     function getAuth() {
       return new google.auth.GoogleAuth({
         credentials: getCredentials(),
         scopes: ["https://www.googleapis.com/auth/drive.file"],
       });
     }

     export const ARTS_FOLDER_ID = process.env.GOOGLE_DRIVE_ARTS_FOLDER_ID ?? "";

     export async function uploadArtFile(buffer: Buffer, name: string, mimeType: string): Promise<string> {
       if (!ARTS_FOLDER_ID) throw new Error("GOOGLE_DRIVE_ARTS_FOLDER_ID não configurada");
       const drive = google.drive({ version: "v3", auth: getAuth() });
       const res = await drive.files.create({
         requestBody: { name, mimeType, parents: [ARTS_FOLDER_ID] },
         media: { mimeType, body: buffer },
       });
       return res.data.id!;
     }

     export async function streamDriveFile(fileId: string): Promise<ReadableStream | NodeJS.ReadableStream> {
       const drive = google.drive({ version: "v3", auth: getAuth() });
       const res = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
       return res.data as unknown as NodeJS.ReadableStream;
     }

     export async function deleteDriveFile(fileId: string): Promise<void> {
       const drive = google.drive({ version: "v3", auth: getAuth() });
       await drive.files.delete({ fileId });
     }
     ```
  c. Documentar (no código, só se WHY não-óbvio): scope drive.file = só arquivos criados pela app; arquivos ficam privados do service account.
  Must NOT do: não usar keyFile (Vercel não tem arquivo); não usar escopo maior que drive.file; não criar cliente global (evita vazamento de credencial no bundle? credencial é server-only, mas instanciar por chamada evita estado global).
  Parallelization: Wave 1 (pode rodar junto) | Blocked by: — | Blocks: 13
  References: package.json (deps), contexto googleapis: `google.drive('v3')`, `files.create({ requestBody: { name, mimeType, parents }, media: { body } })` → res.data.id, `files.get({ fileId, alt: "media" }, { responseType: "stream" })`
  Acceptance criteria: `npx tsc --noEmit` passa; módulo exporta as 3 funções; sem credencial real commitada.
  QA scenarios: happy: `npx tsc --noEmit`. failure: chamar uploadArtFile sem env → throw com mensagem clara (teste unitário com vi.stubEnv apagando a var). Evidence .omo/evidence/task-9-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add Google Drive storage lib (googleapis)

- [ ] 10. Schemas Zod de artes + testes
  What to do / Must NOT do:
  a. Criar src/lib/validations/arts.ts:
     ```ts
     export const ArtUploadSchema = z.object({
       name: z.string().min(2).max(100),
       description: z.string().max(1000).optional(),
       tagIds: z.array(z.cuid()).default([]),
     });
     export const ArtUpdateSchema = z.object({
       name: z.string().min(2).max(100).optional(),
       description: z.string().max(1000).nullable().optional(),
       tagIds: z.array(z.cuid()).optional(),
     });
     export const ArtTagSchema = z.object({
       name: z.string().min(2).max(50),
     });
     export const ART_PREVIEW_MIME = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
     export const ART_ORIGINAL_EXTENSIONS = ["cdr", "svg", "pdf", "ai", "eps", "png", "jpg", "jpeg", "webp", "gif"] as const;
     export const ART_MAX_ORIGINAL_SIZE = 20 * 1024 * 1024;
     export const ART_MAX_PREVIEW_SIZE = 10 * 1024 * 1024;
     ```
     tagIds: usar `z.cuid()` top-level (estilo Zod v4 do repo, como `z.email()` em validations/auth.ts) — NÃO usar o método deprecado `z.string().cuid()`. Validação de existência das tags acontece na rota; aqui só o formato.
  b. Em src/lib/validations/auth.ts, adicionar `UserCreateSchema` (name min 2, email z.email(), password min 8, role enum) e `UserUpdateSchema` (parcial).
  c. Criar src/__tests__/validations/arts.test.ts: nome curto → error; tagIds inválida → error; válido → success. Estender auth.test.ts com UserCreateSchema.
  Must NOT do: não validar mime/originais aqui (é enum de constantes; a rota valida contra as listas).
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 12,13
  References: src/lib/validations/auth.ts:1-8 (padrão), src/lib/validations/contact.ts, src/__tests__/validations/auth.test.ts
  Acceptance criteria: `npm run test:unit` passa (novos casos verdes).
  QA scenarios: happy: safeParse de payload válido → success. failure: name com 1 char → error com issues. Evidence .omo/evidence/task-10-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add art and user Zod schemas

- [ ] 11. Env vars + .env.example + README (setup Google Drive)
  What to do / Must NOT do:
  a. Adicionar a .env.example:
     ```
     # ── Google Drive (Artes) ────────────────────────────────
     GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
     GOOGLE_DRIVE_ARTS_FOLDER_ID=1xxxxxxxxxxxxxxxxxxxxxxxx
     ```
  b. Em README.md, nova seção "Google Drive (Artes)" com passos: (1) criar projeto no Google Cloud; (2) habilitar Google Drive API; (3) criar service account e baixar chave JSON; (4) criar pasta no Drive e compartilhar com o e-mail do service account (permissão Editor); (5) definir GOOGLE_SERVICE_ACCOUNT_JSON (conteúdo JSON inteiro) e GOOGLE_DRIVE_ARTS_FOLDER_ID no Vercel/.env.local.
  Must NOT do: NUNCA commitar credencial real; não tocar nas outras seções do README.
  Parallelization: Wave 2 | Blocked by: — | Blocks: 13 (credenciais para QA real)
  References: README.md (seção "Variáveis de ambiente"), .env.example
  Acceptance criteria: git diff mostra apenas .env.example e README.md alterados sem credencial real.
  QA scenarios: happy: `git diff -- .env.example README.md` mostra as variáveis novas. failure: grep por "BEGIN PRIVATE KEY" no repo → 0 resultados. Evidence .omo/evidence/task-11-admin-roles-artes-produtos-grid.md
  Commit: Y | docs: document Google Drive setup for art storage

- [ ] 12. APIs de tags (GET/POST /api/admin/art-tags, PATCH/DELETE [id])
  What to do / Must NOT do:
  a. src/app/api/admin/art-tags/route.ts:
     - GET (T2 permitido): `prisma.artTag.findMany({ include: { _count: { select: { arts: true } } }, orderBy: { name: "asc" } })`.
     - POST (T1): CSRF + ratelimit + ArtTagSchema; slug auto: `name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")`; P2002 → 409.
  b. src/app/api/admin/art-tags/[id]/route.ts: PATCH (rename → re-slug) e DELETE (T1; implicit m2m remove relações; não deleta artes) — ambos T1 via canAccessRoute.
  Must NOT do: T2 nunca muta tags (canAccessRoute bloqueia POST/PATCH/DELETE).
  Parallelization: Wave 2 | Blocked by: 1,3,10 | Blocks: 13
  References: src/app/api/admin/categories/route.ts (padrão CRUD), src/lib/csrf.ts, src/lib/ratelimit.ts, src/lib/errors.ts
  Acceptance criteria: `npx tsc --noEmit`; GET lista tags com contagem; POST cria com slug; T2 em POST → 403.
  QA scenarios: happy: POST "Futebol" → { name: "Futebol", slug: "futebol" }; GET retorna _count.arts. failure: tag duplicada → 409; PATCH de T2 → 403. Evidence .omo/evidence/task-12-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add art tags API (T1 mutations, T2 read)

- [ ] 13. APIs de artes (upload/list/patch/delete/preview/download)
  What to do / Must NOT do:
  a. src/app/api/admin/arts/route.ts:
     - GET: `requireApiAdmin`; query `?q=` (nome contains insensitive) e `?tagId=` (some: true → tags some id); include `tags` + `createdBy: { select: { name: true } }`; orderBy createdAt desc. (NÃO filtrar por isActive — o model não tem esse campo; exclusão é hard delete.)
     - POST: NÃO existe rota POST em /api/admin/arts — a criação acontece exclusivamente via /api/admin/arts/upload (item b). O matcher (todo 3) libera apenas GET para T2 em /api/admin/arts; sem POST implementado a rota responde 405 por padrão. Não adicionar POST.
  b. src/app/api/admin/arts/upload/route.ts (POST multipart) — TODOS os campos:
     - `export const runtime = "nodejs";`
     - requireApiAdmin → `const user = auth as AdminUser` (se NextResponse, retorna).
     - validateCsrf + ratelimit.
     - formData: `file` (preview), `original` (arquivo original), `name`, `description?`, `tagIds` (JSON string array).
     - Validar name/description com ArtUploadSchema; tagIds: buscar `prisma.artTag.findMany({ where: { id: { in: tagIds } } })` e usar apenas os existentes.
     - Preview: tipo em ART_PREVIEW_MIME, ≤ ART_MAX_PREVIEW_SIZE, validar magic bytes com sharp (importar sharp; `await sharp(buffer).metadata()` deve retornar format — sem converter).
     - Original: extensão em ART_ORIGINAL_EXTENSIONS (derivar de original.name), ≤ ART_MAX_ORIGINAL_SIZE. SEM conversão.
     - `const previewId = await uploadArtFile(previewBuf, \`${name}-preview\`, preview.type);` e `const originalId = await uploadArtFile(originalBuf, original.name, original.type || "application/octet-stream");`
     - `prisma.artFile.create({ data: { name, description, previewFileId: previewId, previewMimeType: preview.type, originalFileId: originalId, originalFileName: original.name, originalMimeType: original.type || "application/octet-stream", sizeBytes: original.size, createdById: user.id, tags: { connect: existingTags.map(t => ({ id: t.id })) } } })` → 201 { id, name }.
     - Se o create falhar após uploads → best-effort deleteDriveFile nos 2 ids (try/catch).
  c. src/app/api/admin/arts/[id]/route.ts (PATCH/DELETE):
     - Assinatura OBRIGATÓRIA (Next.js 16 — params é Promise, ver AGENTS.md): `export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) { const { id } = await ctx.params; ... }` (idem DELETE).
     - `export const runtime = "nodejs";`
     - requireApiAdmin + canAccessRoute (T2 passa) + buscar arte; SE role === "T2_VENDEDOR" E arte.createdById !== user.id → 403 "Você só pode editar/excluir suas próprias artes".
     - PATCH: ArtUpdateSchema; atualizar name/description/tags (set: connect/disconnect por diff ou `tags: { set: tagIds.map(id => ({ id })) }` — set aceita lista completa; validar ids existem antes).
     - DELETE: `await deleteDriveFile(art.previewFileId)` e `await deleteDriveFile(art.originalFileId)` em try/catch (best-effort), depois `prisma.artFile.delete({ where: { id } })`.
  d. src/app/api/admin/arts/[id]/preview/route.ts (GET):
     - Assinatura OBRIGATÓRIA: `export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) { const { id } = await ctx.params; ... }`
     - requireApiAdmin + canAccessRoute; buscar arte; `const stream = await streamDriveFile(art.previewFileId)`; retornar `new Response(stream as ReadableStream, { headers: { "Content-Type": art.previewMimeType, "Cache-Control": "private, max-age=300" } })`.
  e. src/app/api/admin/arts/[id]/download/route.ts (GET):
     - Assinatura OBRIGATÓRIA: idem item d (`await ctx.params`).
     - requireApiAdmin + canAccessRoute; buscar arte; streamDriveFile(art.originalFileId); headers: Content-Type originalMimeType + `Content-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(art.originalFileName)}`.
  f. Todas: `export const dynamic = "force-dynamic";` onde aplicável (rotas com req).
  Must NOT do: nunca retornar fileId do Drive; nunca usar link público do Drive; T2 não edita arte de outro (403); não converter .cdr.
  Parallelization: Wave 2 | Blocked by: 1,3,9,10,12 | Blocks: 14
  References: src/app/api/admin/upload/route.ts:15-22 (CSRF/rate), :35-72 (validação), src/lib/drive.ts (novo), src/lib/validations/arts.ts (novo), src/lib/errors.ts
  Acceptance criteria: `npx tsc --noEmit`; com credenciais reais: upload cria 2 arquivos no Drive e 1 ArtFile; download baixa o original com nome correto; T2 PATCH em arte de outro → 403.
  QA scenarios: happy (com env real): curl POST multipart com png + cdr → 201; GET /api/admin/arts/abc/download com cookie → 200 e Content-Disposition correto. failure: preview com .exe → 400; T2 em arte alheia → 403; sem env do Drive → erro 500 com mensagem clara. (Sem credenciais: rodar só `npx tsc --noEmit` e mockar lib/drive em teste unitário do fluxo de PATCH/403 com prisma real — registrar evidência do que foi possível.) Evidence .omo/evidence/task-13-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add arts API with Google Drive upload/download

- [ ] 14. Página /admin/conteudo (abas Artes | Tags)
  What to do / Must NOT do:
  a. src/app/(admin)/admin/conteudo/page.tsx (server): `export const dynamic = "force-dynamic";` buscar `tags = prisma.artTag.findMany({ orderBy: { name: "asc" } })` e `arts = prisma.artFile.findMany({ include: { tags: true, createdBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } })` (SEM filtro isActive — o model ArtFile não tem esse campo; exclusão é hard delete, ver todo 13); renderizar `<ConteudoClient tags={tags} arts={arts} role={user.role} userId={user.id} />` (user vindo de `getAdminUser()` — usar `requireAdmin()`).
  b. src/app/(admin)/admin/conteudo/_components/ConteudoClient.tsx ("use client"): props { tags: ArtTag[], arts: (ArtFile & { tags; createdBy })[], role, userId }.
     - Tabs: "Artes" | "Tags" (Tags oculta se role T2).
     - Aba Artes:
       - Barra: input de busca (estado local, filtra por nome/desc) + pills de tags (toggle; filtro "todas" + uma pill por tag, com contagem) + botão "Nova arte" (hidden para ninguém? upload é permitido a T1 e T2 → visível para ambos).
       - Grid de cards: preview `<img src={/api/admin/arts/${id}/preview} alt={name} className="aspect-square w-full object-cover" loading="lazy" />` (mesmo-origin, cookie vai automático), nome, descrição truncada, pills de tags, rodapé: "por {createdBy?.name}" + data formatada (pt-BR) + ações: botão "Baixar" (`<a href={/api/admin/arts/${id}/download}>`), "Editar" e "Excluir" visíveis se role T1 OU art.createdById === userId.
       - Estados vazios: sem artes → mensagem + CTA; sem resultado do filtro → "Nenhuma arte encontrada".
     - Dialog "Nova arte": nome, descrição, checkboxes de tags, input preview (accept image/*), input original (accept .cdr,.svg,.pdf,.ai,.eps,.png,.jpg,.jpeg,.webp,.gif) → POST /api/admin/arts/upload (FormData) com `tagIds` como JSON string → sucesso: router.refresh() + fechar; erro: mensagem inline.
     - Dialog "Editar": nome, descrição, tags → PATCH /api/admin/arts/[id].
     - Excluir: confirm() → DELETE → router.refresh().
     - Aba Tags (T1): lista com contagem de artes, input inline para criar (POST), editar nome (PATCH), excluir (DELETE) — todos com refresh.
  c. Busca/filtro: client-side (volume baixo; sem endpoint de busca dedicado além do GET com q — usar client filter para simplicidade, mantendo o GET simples). DECISÃO: filtro client-side por nome/desc/tags; o GET /api/admin/arts é usado apenas se necessário — o server page já traz tudo. (Manter GET com q/tagId do todo 13 como pronto para o futuro; página usa dados do server.)
  Must NOT do: não renderizar tags de T2 que permita criar (aba oculta); não usar next/image para o preview (rota autenticada não passa pelo otimizador — usar <img>); não usar fetch público do R2.
  Parallelization: Wave 2 | Blocked by: 4,5,12,13 | Blocks: —
  References: src/app/(admin)/admin/produtos/page.tsx (padrão server page), src/components/ui/dialog.tsx, src/app/(admin)/admin/leads/page.tsx (padrão de tabela), src/lib/auth.ts (novo), prisma/schema.prisma (ArtFile)
  Acceptance criteria: `npx tsc --noEmit`; página lista artes com preview; busca e filtro de tags funcionam; upload cria arte; T2 não vê aba Tags e não vê Editar/Excluir em artes alheias.
  QA scenarios: happy: T2 logado → aba Artes apenas, botão Nova arte, Baixar funciona; T1 → abas Artes e Tags. failure: T2 sem artes próprias não vê Editar/Excluir em nenhum card; upload sem arquivo → erro inline. Evidence .omo/evidence/task-14-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): add Conteúdo page with art library and tag management

- [ ] 15. /admin/produtos em grade (substituir tabela)
  What to do / Must NOT do:
  a. Em src/app/(admin)/admin/produtos/page.tsx: manter a query mas ampliar select: `include: { category: { select: { name: true } }, images: { where: { isPrimary: true }, take: 1 } }` já existe; adicionar `select` de `fabric` e `minQty` (campos no model Product). Trocar `<AnimatedTableRows .../>` por `<ProductGridAdmin products={products} />`.
  b. Criar src/app/(admin)/admin/produtos/_components/ProductGridAdmin.tsx ("use client"):
     - Props: `products: { id, name, fabric, minQty, isActive, isFeatured, category: { name }, images: { url, altText }[] }[]`.
     - Grid responsivo `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.
     - Card (framer-motion stagger, imitando AnimatedTableRows): imagem primária em `aspect-square object-cover` (fallback: inicial do nome em bg-muted); nome; linha de pills: status (emerald "Ativo" / muted "Inativo"), destaque (amber star "Destaque" se isFeatured), categoria (muted), tecido (accent outline), `Mín. {minQty}`; link "Editar" → /admin/produtos/{id}.
     - Manter botão "Novo produto" e estado vazio (ícone Package) no page.tsx.
  c. Apagar src/app/(admin)/admin/produtos/_components/AnimatedTableRows.tsx (sem mais referências).
  Must NOT do: não alterar ProductForm.tsx, nem /admin/produtos/novo, nem [id]; não mudar slugs/rotas.
  Parallelization: Wave 3 | Blocked by: — | Blocks: —
  References: src/app/(admin)/admin/produtos/page.tsx:14-20,38-59, src/app/(admin)/admin/produtos/_components/AnimatedTableRows.tsx:18-89 (estilos de pill a reaproveitar), prisma/schema.prisma:40-60
  Acceptance criteria: `npx tsc --noEmit`; página renderiza grade sem <table>; todos os produtos aparecem com pills corretas.
  QA scenarios: happy: abrir /admin/produtos → grade com cards, editar navega para o form. failure: produto sem imagem → placeholder com inicial (não quebra). Evidence .omo/evidence/task-15-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(admin): replace products table with image-focused grid

- [ ] 16. ProductCard público: pills de categoria e qtd mínima
  What to do / Must NOT do:
  a. src/components/products/ProductCard.tsx: adicionar props `categoryName?: string | null; minQty?: number | null;`. Abaixo do nome (antes do "Sob consulta"), renderizar linha de pills: pill categoria (`rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground`) e pill `Mín. {minQty} peças` (mesmo estilo). MANTER badge de tecido na imagem, `data-testid="product-card"`, overlay "Ver Detalhes", "Sob consulta".
  b. src/components/products/ProductGrid.tsx: estender ProductGridItem com `categoryName?: string | null; minQty?: number | null;` e repassar.
  c. src/components/sections/FeaturedSection.tsx: adicionar `categoryName` e `minQty` a FeaturedProduct e repassar a ProductCard. Em src/app/(marketing)/page.tsx: a query de featured JÁ usa `select` com `category: { select: { slug: true, name: true } }` (~linha 34) — NÃO trocar para `include` (mudaria o shape do retorno). Apenas adicionar `minQty: true` ao select e, no map do featuredItems (~linhas 86-93), adicionar `categoryName: product.category.name` e `minQty: product.minQty`.
  d. src/app/(marketing)/[categoria]/page.tsx: conferir que a query usada pelo helper `getCategoryData` expõe `minQty` no Product retornado (se a query usa select explícito sem minQty, adicionar `minQty: true`); no map (linhas 96-106), adicionar `categoryName: category.name` e `minQty: product.minQty`.
  e. src/app/(marketing)/busca/page.tsx: trocar include de category (linha 45) para `category: { select: { slug: true, name: true } }` e adicionar `categoryName: p.category.name`, `minQty: p.minQty` no map (linhas 50-57).
  Must NOT do: não remover nada visual existente; não alterar layout do grid (colunas); não mudar hrefs.
  Parallelization: Wave 3 | Blocked by: — | Blocks: —
  References: src/components/products/ProductCard.tsx:5-12,22-62, src/components/products/ProductGrid.tsx:3-15,32-44, src/components/sections/FeaturedSection.tsx:11-18,100-110, src/app/(marketing)/[categoria]/page.tsx:96-106, src/app/(marketing)/busca/page.tsx:43-57
  Acceptance criteria: `npx tsc --noEmit`; `data-testid="product-card"` mantido; pills aparecem nas 3 superfícies (homepage, categoria, busca).
  QA scenarios: happy: abrir /futebol → cards com pill de categoria e "Mín. 10 peças". failure: produto com minQty null → pill "Mín." não renderiza (sem crash). Evidence .omo/evidence/task-16-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(products): add category and min-quantity pills to product card

- [ ] 17. Seed: vendedor demo T2 + tags iniciais
  What to do / Must NOT do:
  a. Em prisma/seed.ts, após o upsert do admin (linhas 21-26), adicionar bloco "Vendedor (T2)":
     ```ts
     const sellerEmail = process.env.SELLER_SEED_EMAIL;
     const sellerPassword = process.env.SELLER_SEED_PASSWORD;
     if (sellerEmail && sellerPassword) {
       const sellerHash = await bcrypt.hash(sellerPassword, 12);
       await prisma.adminUser.upsert({
         where: { email: sellerEmail },
         update: { role: "T2_VENDEDOR", isActive: true },
         create: { email: sellerEmail, passwordHash: sellerHash, name: "Vendedor Fase", role: "T2_VENDEDOR" },
       });
       console.log(`✓ Vendedor (T2): ${sellerEmail}`);
     }
     ```
     (Sem env → pula com aviso, não falha.)
  b. Bloco "Tags de arte":
     ```ts
     const artTags = ["Escudo", "Mascote", "Patrocinador", "Futebol", "Vôlei", "Basquete", "Handebol", "Número", "Time"];
     for (const name of artTags) {
       const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
       await prisma.artTag.upsert({ where: { slug }, update: {}, create: { name, slug } });
     }
     ```
  c. Rodar `npx prisma db seed` (tsx prisma/seed.ts).
  Must NOT do: não criar artes demo (exige credenciais do Drive); não alterar o bloco do admin existente além do necessário (role vem do default do schema).
  Parallelization: Wave 3 | Blocked by: 1 | Blocks: —
  References: prisma/seed.ts:11-26 (admin), :775-779 (fim), package.json ("prisma": { "seed": "tsx prisma/seed.ts" })
  Acceptance criteria: `npx prisma db seed` roda sem erro; vendedor demo criado com role T2 (quando env presente); 9 tags criadas com slug correto (ex.: "patrocinador").
  QA scenarios: happy: rodar seed → console mostra "✓ Vendedor (T2)" e tags; `npx prisma studio` ou query confirma. failure: rodar seed SEM SELLER_SEED_EMAIL → não falha, só pula vendedor. Evidence .omo/evidence/task-17-admin-roles-artes-produtos-grid.md
  Commit: Y | feat(seed): seed seller role and initial art tags

- [ ] 18. QA final: suíte completa + evidência
  What to do / Must NOT do:
  a. Rodar, nesta ordem, e registrar saída em .omo/evidence/task-18-admin-roles-artes-produtos-grid.md:
     - `npx prisma generate`
     - `npx tsc --noEmit`
     - `npm run lint`
     - `npm run test:unit` (todos verdes, incluindo rbac.test.ts e arts.test.ts)
     - `npm run build`
  b. Se houver credenciais do Drive no ambiente: smoke real (upload+preview+download) e registrar resultado; senão, registrar "SKIP (sem credenciais)".
  c. Conferir que tests/e2e/admin-auth.spec.ts continua coerente (login T1 → dashboard permanece; NÃO rodar Playwright E2E completo — apenas revisar o spec e registrar que o fluxo T1 não mudou).
  Must NOT do: não "consertar" falhas mudando o escopo — corrigir o código dos todos anteriores.
  Parallelization: Wave 4 | Blocked by: 1-17 | Blocks: —
  References: package.json (scripts), tests/e2e/admin-auth.spec.ts
  Acceptance criteria: todos os 5 comandos saem com exit 0; evidência gravada.
  QA scenarios: happy: build 0. failure: qualquer comando ≠ 0 → corrigir e rodar de novo até 0 (evidência da rodada final). Evidence .omo/evidence/task-18-admin-roles-artes-produtos-grid.md
  Commit: N (verificação)

## Final verification wave
> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.
- [ ] F1. Plan compliance audit
- [ ] F2. Code quality review
- [ ] F3. Real manual QA
- [ ] F4. Scope fidelity
- [ ] F5. Segurança: agente `seguranca` do projeto (projeto define: "automaticamente após implementar endpoints públicos, auth admin, upload") — auditar login/roles, /api/admin/users, /api/admin/arts/* (CSRF, rate limit, ownership, exposição de segredos, LGPD) e registrar veredito em .omo/evidence/f5-seguranca.md

## Commit strategy
- feat(admin): add AdminRole and art models to Prisma schema
- feat(admin): add role and isActive claims to login
- feat(admin): add per-request auth helper with role matcher
- feat(admin): guard admin layout by role with per-request DB check
- feat(admin): filter sidebar by role and add Conteúdo/Usuários links
- feat(admin): redirect login by role
- feat(admin): add users management API (T1 only)
- feat(admin): add users management page
- feat(admin): add Google Drive storage lib (googleapis)
- feat(admin): add art and user Zod schemas
- docs: document Google Drive setup for art storage
- feat(admin): add art tags API (T1 mutations, T2 read)
- feat(admin): add arts API with Google Drive upload/download
- feat(admin): add Conteúdo page with art library and tag management
- feat(admin): replace products table with image-focused grid
- feat(products): add category and min-quantity pills to product card
- feat(seed): seed seller role and initial art tags

## Success criteria
- `enum AdminRole { T1_GERENCIA T2_VENDEDOR }` + `AdminUser.role`/`isActive` aplicados (db push ok).
- Login emite JWT com role/isActive e rejeita usuário inativo; página de login redireciona T2 → /admin/conteudo e T1 → /admin/dashboard.
- Vendedor desativado perde acesso imediatamente (AdminLayout/requireApiAdmin consultam o banco por requisição).
- Sidebar: T2 vê apenas "Conteúdo"; T1 vê tudo (inclui Conteúdo e Usuários).
- /admin/usuarios (T1): cria/edita/desativa vendedores, troca papel, reset de senha; auto-desativação bloqueada.
- /admin/conteudo: abas Artes e Tags; artes com preview autenticado, busca por nome e filtro por pills de tag; upload envia preview + original (.cdr/.svg/.pdf…) para o Google Drive (service account, pasta dedicada); download autenticado do original; T2 edita/exclui apenas as próprias (403 nas demais); tags só T1 gerencia.
- Nenhum link público do Drive; arquivos privados do service account.
- /admin/produtos em grade com imagem em destaque e pills (status, destaque, categoria, tecido, qtd mínima); AnimatedTableRows removido.
- ProductCard público com pills de categoria e qtd mínima (tecido/badge/data-testid preservados) nas 3 superfícies (homepage, categoria, busca).
- Seed cria vendedor demo T2 (com env) e 9 tags iniciais.
- `npx tsc --noEmit`, `npm run lint`, `npm run test:unit`, `npm run build` verdes; rbac.test.ts e arts.test.ts cobrem o matcher e schemas.
- Evidência por todo em .omo/evidence/ + veredito de segurança (F5).
