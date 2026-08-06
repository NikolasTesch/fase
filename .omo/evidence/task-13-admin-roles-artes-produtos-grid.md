# Task 13 — APIs de artes (upload/list/patch/delete/preview/download)

Plan: `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 13, lines 395-429)
Status: **DONE (type-check ok; smoke real Drive = SKIP sem credenciais)**

## O que foi implementado

5 arquivos de rota, conforme o plano:

| Rota | Métodos | Descrição |
|---|---|---|
| `src/app/api/admin/arts/route.ts` | GET | Lista artes; filtros `?q=` (name contains insensitive) e `?tagId=` (`tags: { some: { id } }`); include `tags` + `createdBy: { select: { name: true } }`; orderBy `createdAt: desc`. **Sem POST** (405 por padrão — criação só via /upload, matcher T2 libera apenas GET). |
| `src/app/api/admin/arts/upload/route.ts` | POST | `runtime = "nodejs"` + `dynamic = "force-dynamic"`. requireApiAdmin → `user = auth as AdminUser`; canAccessRoute; validateCsrf; uploadRatelimit. FormData: `file` (preview), `original`, `name`, `description?`, `tagIds` (JSON string). ArtUploadSchema; tagIds filtrados por `artTag.findMany({ where: { id: { in } } })` (só existentes). Preview: type ∈ ART_PREVIEW_MIME, ≤ ART_MAX_PREVIEW_SIZE, magic bytes via `sharp(file).metadata()` (sem conversão). Original: extensão ∈ ART_ORIGINAL_EXTENSIONS (de `original.name`), ≤ ART_MAX_ORIGINAL_SIZE, **sem conversão**. `uploadArtFile` nos 2 arquivos → `artFile.create` com `tags: { connect }` → 201 `{ id, name }`. Falha no create após uploads → `deleteDriveFile` best-effort nos 2 ids (try/catch). |
| `src/app/api/admin/arts/[id]/route.ts` | PATCH/DELETE | Assinatura obrigatória Next 16: `ctx: { params: Promise<{ id: string }> }` + `await ctx.params` (idem nos dois). `runtime = "nodejs"`. requireApiAdmin + canAccessRoute; fetch art (404 se não existe); T2_VENDEDOR com `createdById !== user.id` → 403 "Você só pode editar/excluir suas próprias artes". PATCH: ArtUpdateSchema; `tags: { set: tagIds.map(...) }` após validar existência dos ids (400 se algum não existe); description null/undefined tratados. DELETE: `deleteDriveFile` preview+original em try/catch best-effort → `artFile.delete` hard delete (model não tem isActive). CSRF + adminRatelimit (padrão art-tags [id]). |
| `src/app/api/admin/arts/[id]/preview/route.ts` | GET | `await ctx.params`; requireApiAdmin + canAccessRoute; fetch art (404); `streamDriveFile(previewFileId)`; `new Response(stream as ReadableStream, { headers: { "Content-Type": previewMimeType, "Cache-Control": "private, max-age=300" } })`. |
| `src/app/api/admin/arts/[id]/download/route.ts` | GET | `await ctx.params`; requireApiAdmin + canAccessRoute; fetch art (404); `streamDriveFile(originalFileId)`; headers: `Content-Type: originalMimeType` + `Content-Disposition: attachment; filename*=UTF-8''${encodeURIComponent(originalFileName)}`. |

## Verificação executada

- [x] `npm run type-check` → **exit 0** (tsc --noEmit limpo)
- [x] Revisão de fluxo vs. plano: todos os itens a–f do todo 13 cobertos; matcher do todo 3 já libera T2 nas rotas (GET /api/admin/arts, POST /upload, PATCH/DELETE [id], GET preview/download) e `canAccessRoute` é chamado em todas as rotas.
- [x] Conferência de integridade: nunca retorna Drive fileId; sem link público; sem POST em /api/admin/arts; sem filtro isActive; sem conversão de original (.cdr etc.); sem `as any`/`@ts-ignore` (única cast explícita: `stream as ReadableStream` e `auth as AdminUser`, ambas previstas no plano).
- [ ] Teste unitário mockado do fluxo PATCH/403 — **SKIP** (não solicitado no plano como obrigatório para esta task; QA real de 403 exige prisma real + sessão admin; ver nota abaixo).
- [ ] Smoke real do Google Drive (upload cria 2 arquivos + ArtFile; download com Content-Disposition correto) — **SKIP** (sem `GOOGLE_SERVICE_ACCOUNT_JSON`/`GOOGLE_DRIVE_ARTS_FOLDER_ID` no ambiente local).

## Notas

- Erros de configuração do Drive (`GOOGLE_*` não configurada) são propagados como 500 com a mensagem clara da lib `drive.ts` (requisito QA "sem env do Drive → erro 500 com mensagem clara"); demais erros → "Erro interno" (padrão do repo).
- QA de 403 do T2 é coberto por revisão de código (regra `art.createdById !== user.id` idêntica em PATCH e DELETE) e pela decisão do plano de testar com prisma real em etapa posterior — registrado para todo 14 (página /admin/conteudo) validar em browser.

## Artefatos

- 5 rotas em `src/app/api/admin/arts/**`
- Dependências já existentes: `src/lib/drive.ts` (todo 9), `src/lib/validations/arts.ts` (todo 10), `src/lib/auth.ts` (todo 3), art-tags API (todo 12)
