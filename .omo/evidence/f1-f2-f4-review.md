# Revisão Pós-Implementação — F1 (Conformidade) · F2 (Qualidade) · F4 (Escopo)

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` (18 todos + verificação final F1–F5)
**Revisor:** agente de revisão (Sisyphus-Junior) — leitura somente, nenhum arquivo de código alterado
**Data:** 2026-08-06
**Comandos executados durante a revisão (read-only):**
- `npx tsc --noEmit` → **exit 0** (re-executado nesta revisão)
- `npx vitest run src/__tests__/lib/rbac.test.ts src/__tests__/validations/arts.test.ts` → **32/32 testes passando** (re-executado nesta revisão)
- `git log` / `git show --stat` dos 18 commits do plano + commits intercalados no mesmo janela
- Grep de guardrails: `as any`, `@ts-ignore`, `AnimatedTableRows`, `BEGIN PRIVATE KEY`, `drive.google.com`, `AdminGuardClient`, `jwtVerify` em client

---

## F1 — Conformidade com o plano (critérios de aceitação por todo)

| Todo | Critério de aceitação | Resultado | Evidência |
|---|---|---|---|
| 1. Schema Prisma | `AdminRole` enum + `role`/`isActive`/`artsCreated` no `AdminUser` + models `ArtTag`/`ArtFile`; sem `updatedAt` no AdminUser; sem campo `isActive` no ArtFile; sem model `Art` | **PASS** | `prisma/schema.prisma:136-139` (enum), `:141-150` (AdminUser — 3 campos adicionados, sem `updatedAt`), `:179-184` (ArtTag), `:186-201` (ArtFile — campos idênticos ao spec, sem `isActive`). Commit `f48bd52` tocou só o schema. `npx tsc --noEmit` exit 0 |
| 2. Login: payload role/isActive + rejeita inativo | Check `!user.isActive` → 401; JWT com `role`/`isActive`; resposta `{ success: true, role }`; expiração 7d e cookie intactos | **PASS** | `src/app/api/admin/auth/login/route.ts:41-43` (inativo → 401 "Usuário inativo…"), `:45-48` (payload `sub/email/role/isActive`, HS256, 7d), `:50` (`{ success: true, role }`), `:52-55` (flags do cookie inalterados). `LoginSchema` intacto (`validations/auth.ts:3-6`) |
| 3. Lib auth + testes | `getAdminUser` (cookie → jwtVerify → DB → null se inativo); `requireAdmin` (redirect); `requireApiAdmin` (401 JSON); `canAccessRoute` matcher puro com regex exatas; sem IO no matcher | **PASS** | `src/lib/auth.ts:9-26` (getAdminUser: check `!user.isActive` na linha 23), `:28-32`, `:34-40`, `:42-59` (matcher com as 7 regras T2 exatas: `/admin/conteudo*`, GET art-tags, GET arts, POST upload, PATCH/DELETE `^/api/admin/arts/[^/]+$`, GET `preview|download`, POST logout). Zero IO no matcher. Testes: `src/__tests__/lib/rbac.test.ts` (94 linhas, 23 casos — todos os cenários do spec 3b, incluindo o caso explícito de NÃO testar DELETE como false, linha 55-57) — **verde nesta revisão** |
| 4. Gate por requisição: layout + (t1) | Layout pai usa `getAdminUser`; 9 diretórios movidos via git mv (0 alterações de conteúdo); `(t1)/layout.tsx` redireciona não-T1 para `/admin/conteudo`; sem guard client-side | **PASS** | `src/app/(admin)/layout.tsx:15-16,44` (getAdminUser + `role={user.role}`; imports antigos `cookies`/`jwtVerify` removidos). `src/app/(admin)/admin/(t1)/layout.tsx:4-8` (redirect `/admin/conteudo`). Commit `5f70a7b`: **29 arquivos renomeados com 0 linhas alteradas** (categorias, dashboard, depoimentos, faqs, instagram, leads, medidas, modalidades, produtos + subcomponentes) + layout novo. Grep: nenhum `AdminGuardClient`/guard client-side no repo |
| 5. Sidebar por papel | Prop `role`; itens Conteúdo (Images) e Usuários (UserCog); T2 → só Conteúdo; framer-motion e `layoutId="admin-nav-active"` mantidos | **PASS** | `src/app/(admin)/_components/AdminSidebarClient.tsx:16-17` (ícones), `:35-36` (itens novos), `:39-45` (filtro T2 → só `/admin/conteudo`), `:70` (layoutId mantido) |
| 6. Login redirect por papel | T2 → `/admin/conteudo`; T1 → `/admin/dashboard` | **PASS** | `src/app/admin/login/page.tsx:35-37` (router.refresh + push condicional) |
| 7. APIs de Usuários | GET/POST com `force-dynamic`, `requireApiAdmin`+`canAccessRoute` (T1-only), CSRF+ratelimit no POST, `UserCreateSchema`, bcrypt 12, P2002 → 409; PATCH com `params: Promise` await, guard auto-desativação; nunca retorna passwordHash; sem DELETE | **PASS** | `src/app/api/admin/users/route.ts:12` (dynamic), `:25-29` (auth+gate), `:51-56` (CSRF/ratelimit), `:63` (hash 12), `:72-77` (P2002 → 409), `:14-21` (userSelect sem hash). `[id]/route.ts:20-25` (params Promise + await), `:39-41` (auto-desativação → 403), `:47` (hash condicional). Não existe handler DELETE em `[id]/route.ts` (só PATCH) |
| 8. Página /admin/usuarios (T1) | Criada sob `(t1)`; tabela com pills; dialogs criar/editar; self-deactivation refletida na UI; sem paginação | **PASS** | `src/app/(admin)/admin/(t1)/usuarios/page.tsx:1-28` (dynamic, findMany com select sem hash, `currentUserId`). `UsuariosClient.tsx:26-29,36-66` (pills T1/T2 e Ativo/Inativo), `:410-433` (checkbox `disabled` para si mesmo + mensagem "Você não pode desativar a si mesmo"), `:156-186` (PATCH papel/ativo/senha). Sem paginação (grep: nenhum `skip/take` de lista). Não há `/admin/usuarios` duplicado fora de `(t1)` (Test-Path: False) |
| 9. Drive lib | `googleapis` instalado; 3 funções com escopo `drive.file`; sem keyFile; sem cliente global; sem credencial commitada | **PASS** | `package.json`: `"googleapis": "^174.0.1"` (commit `47228da`). `src/lib/drive.ts:9-14` (GoogleAuth com `credentials` + scope `drive.file`), `:18-26` (upload), `:28-32` (stream), `:34-37` (delete), instância por chamada. `git grep "BEGIN PRIVATE KEY"` → só 3 arquivos `.md` (plano + evidências citando a própria instrução de QA), zero em código/env |
| 10. Schemas Zod artes + testes | `ArtUploadSchema`/`ArtUpdateSchema`/`ArtTagSchema` com `z.cuid()` top-level; constantes MIME/extensões/tamanhos; `UserCreateSchema`/`UserUpdateSchema`; testes | **PASS** | `src/lib/validations/arts.ts:1-40` (spec exato). `src/lib/validations/auth.ts:10-22` (UserCreateSchema/UserUpdateSchema com `z.email()`). `src/__tests__/validations/arts.test.ts` (78 linhas: nome curto, tagIds inválida, default vazio, description null…) + `auth.test.ts` estendido (49 linhas no commit `e6894a5`) — **verdes nesta revisão** |
| 11. Env + docs | `.env.example` com GOOGLE vars; README com setup; sem credencial real | **PASS** | `.env.example` (commit `06a0743`): `GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}` e `GOOGLE_DRIVE_ARTS_FOLDER_ID=1xxx…` (placeholders). `README.md` seção "Google Drive (Artes)" com os 5 passos |
| 12. APIs de tags | GET com `_count`; POST slug automático (normalize NFD); P2002 → 409; PATCH re-slug; DELETE; T2 nunca muta | **PASS** | `src/app/api/admin/art-tags/route.ts:13-20` (makeSlug idêntico ao spec), `:22-37` (GET + _count), `:39-82` (POST com CSRF/ratelimit, P2002 → 409). `[id]/route.ts:22-74` (PATCH partial + re-slug), `:76-110` (DELETE). T2: `canAccessRoute` bloqueia POST/PATCH/DELETE (rota de `[id]` também checa, linha 32/86) — teste cobre `POST art-tags` → false (`rbac.test.ts:83-85`) |
| 13. APIs de artes | GET com q/tagId; upload com validações (MIME preview, ext original, tamanhos, magic bytes sharp), cleanup best-effort no create; PATCH/DELETE com ownership T2; preview/download com streams e headers; `runtime = "nodejs"`; params Promise em todas; sem POST em `/api/admin/arts`; nunca expõe fileId | **PASS** | `route.ts:17-30` (q/tagId, include tags+createdBy). `upload/route.ts:19-20` (runtime/dynamic), `:35-48` (auth+csrf+ratelimit), `:73-96` (validações MIME/tamanho/ext + sharp magic bytes `:82-88`), `:103-108` (uploads), `:110-135` (create + cleanup best-effort `deleteDriveFile`), `:138-144` (erro com mensagem clara se `GOOGLE_`). `[id]/route.ts:20,81` (params Promise), `:31-33,92-94` (ownership T2 → 403), `:51-60` (tags `set` com validação de existência), `:96-101` (Drive delete best-effort). `preview/route.ts:28-33` e `download/route.ts:28-33` (headers exatos do spec, `filename*=UTF-8''`). Sem POST em `/api/admin/arts` (teste cobre: `rbac.test.ts:87-89`) |
| 14. Página /admin/conteudo | Server page com `requireAdmin`; tabs Artes\|Tags (Tags T2 oculta); busca + filtro pills client-side; grid com `<img>` preview autenticado; Editar/Excluir só T1\|próprias; baixar; dialogs upload/editar; abas vazias | **PASS** | `conteudo/page.tsx:1-25` (force-dynamic, Promise.all tags+arts, `requireAdmin`, role/userId). `ConteudoClient.tsx:79` (`canManageArt`), `:332-345` (aba Tags só `isT1`), `:91-103` (filtro client-side nome/desc/tags), `:436-441` (`<img>` com `/api/admin/arts/{id}/preview` + `loading="lazy"` — sem next/image, conforme Must NOT), `:469-498` (Baixar + Editar/Excluir condicionais), `:404-427` (dois estados vazios), `:122-151` (upload FormData com tagIds JSON), `:197-265` (CRUD de tags com refresh) |
| 15. Grade de produtos admin | Select ampliado (fabric/minQty); `ProductGridAdmin` com grid responsivo, pills (Ativo/Inativo, Destaque, Categoria, Tecido, Mín. N), fallback inicial, link Editar; `AnimatedTableRows.tsx` apagado; Novo produto + vazio mantidos | **PASS** | `(t1)/produtos/page.tsx:15-25` (select com fabric/minQty/category/images), `:51-54` (grid), `:43-46,62-65` (Novo produto + vazio com Package). `_components/ProductGridAdmin.tsx:22` (grid 1/2/3/4 cols), `:54-86` (5 pills), `:41-47` (fallback inicial), `:88-93` (Editar). `git log --diff-filter=D` → `AnimatedTableRows.tsx` deletado no commit `a76337e`; grep global: 0 referências restantes |
| 16. Pills públicas | Props `categoryName`/`minQty` em ProductCard/ProductGrid/FeaturedSection; pills abaixo do nome; badge tecido, `data-testid`, overlay, "Sob consulta" mantidos; queries homepage/categoria/busca repassam | **PASS** | `ProductCard.tsx:12-13` (props), `:71-84` (pills condicionais — sem crash com null), `:34` (testid), `:49-54` (overlay), `:85` (Sob consulta), `:63-67` (badge tecido). `ProductGrid.tsx:7-8,41-42`. `FeaturedSection.tsx:18-19,108-109`. `(marketing)/page.tsx:29` (`minQty: true` no select — mantido como select, não trocado para include), `:94-95` (categoryName/minQty no map). `[categoria]/page.tsx:103-104` (categoryName: category.name, minQty: product.minQty). `busca/page.tsx:45` (include → select de category), `:54-55` (map) |
| 17. Seed | Bloco Vendedor T2 (env opcional, pula com aviso); 9 tags com slug; sem artes demo; admin block intacto | **PASS** | `prisma/seed.ts:28-41` (seller upsert, `else` com aviso `⚠…pulando`), `:43-49` (9 tags com makeSlug inline idêntico ao spec: Escudo, Mascote, Patrocinador, Futebol, Vôlei, Basquete, Handebol, Número, Time). Sem criação de ArtFile demo |
| 18. QA final | prisma generate/tsc/lint/test/build exit 0; evidência gravada; E2E spec revisado sem mudança de fluxo T1 | **PASS** | `.omo/evidence/task-18-…md` registra os 5 comandos exit 0 (75/75 testes; build com as 7 rotas novas; lint do escopo 0 erros; smoke do Drive **SKIP** sem credenciais, conforme critério). Re-execução nesta revisão: tsc exit 0 e 32/32 nos 2 arquivos novos. `git log` de `tests/e2e/admin-auth.spec.ts` → último commit `1050004` (pré-plano), fluxo T1 intacto. Todas as 18 evidências task-1..18 presentes |

**F1 — Veredito: PASS em todos os 18 todos.**

---

## F2 — Qualidade de código

| Item | Resultado | Evidência |
|---|---|---|
| Next.js 16: `params`/`searchParams` Promise | **PASS** | Todas as rotas novas com param: `users/[id]/route.ts:20-25`, `arts/[id]/route.ts:15-20,76-81`, `art-tags/[id]/route.ts:22-27,76-81`, `preview:10-15`, `download:10-15` — todas `ctx.params: Promise<…>` + `await`. Páginas marketing (`[categoria]`, `busca`) já `await` params/searchParams |
| `as any` / `@ts-ignore` / `@ts-nocheck` | **PASS** | Grep global: 0 ocorrências em src |
| Type-safety do `canAccessRoute` | **PASS** | `role: AdminRole` tipado (não `string`), matcher sem IO, testado com 23 casos. `requireApiAdmin` retorna união `AdminUser \| NextResponse` e todos os 22 chamadores fazem `instanceof NextResponse` antes de usar `auth.role`/`auth.id` |
| Prisma: padrão db push (sem migrate) | **PASS** | Nenhum diretório `prisma/migrations` novo; evidência task-18 registra `prisma db push` + generate; seed usa `PrismaPg` adapter do repo |
| Error handling das rotas | **PASS** | try/catch em todas as rotas; P2002 → 409, P2025 → 404; upload trata erro de Drive com mensagem clara (`upload/route.ts:138-144`) |
| Race/orphan no upload | **RESSALVA (MÉDIA)** | `upload/route.ts:103-108`: se o 1º `uploadArtFile` (preview) suceder e o 2º (original) falhar, o arquivo de preview fica **órfão no Drive** — o try/catch de cleanup (`:110-135`) só cobre falha do `prisma.artFile.create`. Mesmo no catch interno, os dois `deleteDriveFile` rodam (bom), mas a falha entre os dois uploads escapa do cleanup |
| Casts de stream | **RESSALVA (BAIXA)** | `drive.ts:28-31` retorna `as unknown as NodeJS.ReadableStream` com tipo declarado `ReadableStream | NodeJS.ReadableStream`; `preview:28` / `download:28` fazem `as ReadableStream`. Funciona no runtime Node (undici aceita Readable), mas o tipo declarado é impreciso |
| Upload em memória | **INFO** | `fileToBuffer` bufferiza o arquivo inteiro (limite 20 MB validado antes). Aceitável para admin de baixo volume |
| Logs de debug | **RESSALVA (BAIXA, pré-existente)** | `console.log("LOG: executing [categoria] page", …)` em `src/app/(marketing)/[categoria]/page.tsx:87` — **pré-existente** (commit `d710989`, anterior ao plano; `git log -S` comprova). Não introduzido aqui, mas é ruído em produção |
| JWT secret fallback hardcoded | **RESSALVA (BAIXA, pré-existente)** | `src/lib/auth-jwt.ts:1` `JWT_SECRET_FALLBACK = "fasesport_jwt_secret_default_2026"` — se `JWT_SECRET` não for configurado em produção, qualquer um que conheça o fallback forja tokens admin. Criado em `cb026c2` (pré-plano); o plano usou `getJwtSecret()` sem duplicar (correto), mas o fallback deveria ser removido/alertado em produção |
| CSRF no PATCH de usuários | **INFO** | `users/[id]` PATCH (senha/papel) não aplica `validateCsrf` nem ratelimit — o plano só exigiu CSRF no POST (item 7a), então é conforme, mas nota-se que a troca de senha é mutação sensível; `SameSite=Strict` mitiga CSRF na prática |
| Duplicação de lookups | **INFO** | `/admin/usuarios` faz até 3 consultas (layout pai + (t1) + página); `/admin/conteudo` faz 3 (layout pai + requireAdmin + dados). O plano declarou 2 como aceitáveis; 3 é o teto do mesmo trade-off (Neon, volume baixo) |
| Lint global | **INFO** | Evidência task-18: lint global tem 39 erros **pré-existentes fora do escopo** (chat/RAG, marketing) — não atribuíveis a este plano |

**F2 — Veredito: sem bugs funcionais; 1 ressalva média (orphan no Drive) + 3 ressalvas baixas/pré-existentes.**

---

## F4 — Fidelidade de escopo (guardrails "Must NOT have")

| Guardrail | Resultado | Evidência |
|---|---|---|
| NÃO migrar upload de produtos do R2 — `/api/admin/upload` e `src/lib/r2.ts` intactos | **PASS** | `git log --all -- src/lib/r2.ts src/app/api/admin/upload/route.ts src/middleware.ts` → último commit `ad333c0` (pré-plano). Nenhum dos 18 commits do plano tocou esses arquivos |
| NÃO usar link público do Drive (nem preview nem original) | **PASS** | Grep em `src/lib/drive.ts` + `src/app/api/admin/arts`: 0 ocorrências de `drive.google.com`, `uc?id`, `/d/`. Toda leitura passa por `streamDriveFile` autenticado via API (`preview/download/route.ts`). Nenhum link é gerado/exposto. Nota de precisão: `GET /api/admin/arts` (`route.ts:20-30`) retorna o registro completo (`include` sem `select`), incluindo `previewFileId`/`originalFileId` — porém isso é o shape prescrito pelo próprio plano (item 13a, "include tags + createdBy") e só é acessível a admin autenticado; os IDs são inúteis sem as credenciais da conta de serviço (pasta privada do SA), logo não configuram exposição pública |
| NÃO exigir banco no edge — middleware intacto | **PASS** | `src/middleware.ts:1-40` inalterado (só `jwtVerify` com `getJwtSecret`); validação por requisição vive em `getAdminUser`/`requireApiAdmin` (`auth.ts:9-40`); `jwtVerify` só existe em middleware e auth.ts |
| NÃO tocar páginas admin fora do escopo além do gate | **PASS** | Commit `5f70a7b`: 29 renames **0-linha** (categorias, dashboard, depoimentos, faqs, instagram, leads, medidas, modalidades, produtos) — conteúdo intocado. Nenhum commit do plano tocou APIs `categories/products/testimonials/instagram/size-charts/faqs` etc. |
| NÃO criar paginação | **PASS** | Nenhum `skip`/`page` em listagens novas; GET arts/users/tags retornam tudo (decisão do plano: volume baixo) |
| NÃO implementar recuperação de senha por e-mail | **PASS** | Única forma de reset: PATCH em `/api/admin/users/[id]` (página Usuários). Nenhuma rota/fluxo de e-mail novo |
| NÃO adicionar vínculo arte↔cliente/time | **PASS** | `ArtFile`/`ArtTag` sem relação com cliente/time (schema:186-201); tags são livres |
| NÃO deletar usuários do banco | **PASS** | `users/[id]/route.ts` só tem PATCH (desativação via `isActive:false`); nenhum DELETE; planilha de evidências task-7 confirma |
| NÃO usar guard client-side para segurança | **PASS** | Grep: nenhum `AdminGuardClient`; layouts são server components; sidebar só esconde links (UX), gate real é `(t1)/layout.tsx:7` + `requireApiAdmin` |

**Notas de escopo (observações, não violações):**
1. **Commits intercalados fora do plano na mesma janela** — `597e2bc` (página Usuários do plano + feature RAG/chat no MESMO commit), `6db568a` (Fabi chat), `a8a8298` (seed re-branqueou URLs de imagem + placeholders). O `AdminSidebarClient.tsx` ganhou o item "Analytics Chat RAG" (`:26`) fora do plano — com isso o NAV de T1 tem 12 itens (o QA do plano previa 11). Não quebra o contrato do plano (o filtro T2 → 1 item continua), mas o commit `597e2bc` mistura duas features e sua mensagem não reflete só o plano.
2. **Lint global com 39 erros pré-existentes** fora do escopo (registrado na task-18) — a esteira CI (`npm run lint` no pipeline) pode estar vermelha; os erros não são deste plano.

**F4 — Veredito: PASS em todos os 8 guardrails; 2 observações de higiene de commit.**

---

## Veredito final

### ⚠️ **APROVADO COM RESSALVAS**

Todos os 18 todos atendem aos critérios de aceitação (F1), os 8 guardrails de escopo foram respeitados (F4), type-check e a suíte unitária nova passam (32/32 re-executados nesta revisão). As ressalvas não bloqueiam o merge, mas merecem correção em follow-up.

### Issues (priorizadas, máx. 10)

1. **[MÉDIA — Robustez] Orphan no Drive quando o 2º upload falha** — `src/app/api/admin/arts/upload/route.ts:103-108`: envolver os dois `uploadArtFile` no mesmo try/catch do cleanup (mover o try para antes do 1º upload ou capturar falha do 2º e apagar o `previewId`).
2. **[BAIXA — Segurança, pré-existente] Fallback de JWT_SECRET hardcoded** — `src/lib/auth-jwt.ts:1`: remover `JWT_SECRET_FALLBACK` em produção (ou lançar erro se `JWT_SECRET` ausente). Não introduzido por este plano, mas o plano é a primeira superfície que depende dele criticamente.
3. **[BAIXA — Qualidade] Tipo de `streamDriveFile` impreciso** — `src/lib/drive.ts:28-31` + casts em `preview/route.ts:28` e `download/route.ts:28`: declarar retorno como `NodeJS.ReadableStream` apenas e documentar a conversão p/ `Response`.
4. **[BAIXA — Segurança] PATCH de usuário sem CSRF/ratelimit** — `src/app/api/admin/users/[id]/route.ts:20-52`: conforme o plano (CSRF só no POST), mas trocar senha de outro usuário é mutação sensível; considerar `validateCsrf` por consistência com `arts/[id]` (que aplica).
5. **[BAIXA — Higiene] `console.log` de debug em produção** — `src/app/(marketing)/[categoria]/page.tsx:87` (pré-existente): remover.
6. **[INFO — Git] Commit `597e2bc` mistura o todo 8 (Usuários) com a feature RAG/chat** — mensagem não reflete o plano; dificulta blame/revert seletivo. Separar em commits por feature.
7. **[INFO — Sidebar] NAV de T1 com 12 itens (inclui "Analytics Chat RAG") vs. 11 esperados no QA do plano** — decorrente do item acima; sem impacto funcional (filtro T2 segue correto).
8. **[INFO — Operacional] Smoke real do Drive pendente** — sem credenciais (`GOOGLE_SERVICE_ACCOUNT_JSON`/`GOOGLE_DRIVE_ARTS_FOLDER_ID`), o fluxo upload→preview→download não foi validado de ponta a ponta (SKIP registrado na task-18). Configurar credenciais e rodar o smoke antes de liberar para vendedores.
9. **[INFO — CI] Lint global vermelho por erros pré-existentes fora do escopo** — não deste plano, mas o pipeline da Vercel roda `npm run lint`; endereçar ou isolar o escopo do lint no CI.

---

*Nota metodológica: revisão 100% read-only. Nenhum arquivo de código foi modificado. Re-execução de `tsc --noEmit` e dos testes unitários novos confirmou o estado verde dos critérios agent-executáveis.*
