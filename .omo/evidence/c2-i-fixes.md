# Correções de Segurança — C2 + I1–I5

**Data:** 2026-08-06
**Base:** achados em `.omo/evidence/f5-seguranca.md`
**Verificação:** `npx tsc --noEmit` → exit 0, zero erros; `npm run test:unit` → 75/75 passou.

---

## C2 — `JWT_SECRET_FALLBACK` removido (fail-closed)

- **Arquivo:** `src/lib/auth-jwt.ts`
- **Mudança:** removida a constante `JWT_SECRET_FALLBACK` e o `|| fallback` em `getJwtSecret()`. Agora, se `process.env.JWT_SECRET` estiver ausente, a função **lança** `Error("JWT_SECRET não configurada")`. Retorno inalterado (`Uint8Array` via `TextEncoder`), como os callers esperam.
- **Call sites:** `src/middleware.ts:28` e `src/lib/auth.ts:15` chamam `getJwtSecret()` dentro de funções de requisição (nunca em module load) — sem risco de crash em build; em produção sem env, requisições falham com 500 em vez de usar segredo público.
- **tsc:** exit 0. **Testes:** 75/75 (nenhum teste referencia auth-jwt).

## I1 — Ownership T2 em preview/download

- **Arquivos:** `src/app/api/admin/arts/[id]/preview/route.ts` e `[id]/download/route.ts`
- **Mudança:** após o `findUnique` da arte (antes do streaming), adicionado:
  `if (auth.role === "T2_VENDEDOR" && art.createdById !== auth.id) return errorResponse("Você só pode acessar suas próprias artes", 403);`
  Mesmo padrão do PATCH/DELETE em `arts/[id]/route.ts:31-33`. T1_GERENCIA continua vendo tudo.
- **tsc:** exit 0. **Testes:** 75/75.

## I2 — Drive fileIds não vazam nas respostas da API

- **Arquivos:** `src/app/api/admin/arts/route.ts` (GET) e `[id]/route.ts` (PATCH)
- **Mudança GET:** `include` substituído por `select` explícito com `id, name, description, previewMimeType, originalFileName, originalMimeType, sizeBytes, createdAt, updatedAt, createdById` + aninhado `tags: true, createdBy: { select: { name: true } }`. **`previewFileId` e `originalFileId` omitidos.** `where` (q/tagId) e `orderBy` inalterados.
  - Verificado: `ConteudoClient` não referencia `previewFileId`/`originalFileId` (usa URLs `/api/admin/arts/{id}/preview|download`); a página `conteudo/page.tsx` busca via Prisma no servidor.
- **Mudança PATCH:** resposta passa a ser `Response.json({ id: updated.id, name: updated.name })` — o client faz `router.refresh()` após PATCH e não lê o body; DTO mantido conservador.
- **art-tags:** verificado, sem dados sensíveis — inalterado.
- **tsc:** exit 0. **Testes:** 75/75.

## I3 — Original sem MIME controlado pelo cliente + nosniff

- **Arquivos:** `src/app/api/admin/arts/upload/route.ts`, `[id]/download/route.ts`, `[id]/preview/route.ts`
- **Mudança upload:** após ler `originalBuf`, `isImageExt = ["png","jpg","jpeg","webp","gif"].includes(ext)`; `originalMime = isImageExt && original.type ? original.type : "application/octet-stream"`. `originalMime` usado em `uploadArtFile(...)` e no `originalMimeType` do Prisma. Não-imagens (.cdr/.ai/.eps/.svg/.pdf) são armazenadas como octet-stream — sem sniffing sharp (não parseável).
- **Mudança streams:** `"X-Content-Type-Options": "nosniff"` adicionado aos headers de `download/route.ts` e `preview/route.ts`.
- **tsc:** exit 0. **Testes:** 75/75.

## I4 — Rate limit fail-closed

- **Arquivos:** `src/lib/ratelimit.ts`, `src/app/api/admin/auth/login/route.ts`
- **Mudança ratelimit.ts:** sem `UPSTASH_REDIS_REST_URL/TOKEN`, `limit()` agora **lança** `Error("UPSTASH_REDIS_REST_URL/TOKEN não configurados")` em vez de `success: true`. Rotas admin que fazem `if (!allowed) return 429` passam a 500 (fail-closed > fail-open).
- **Mudança login:** o `catch` que engolia o erro do Redis agora loga com `console.error` e retorna `503` `"Serviço temporariamente indisponível. Tente novamente."`. Shape de sucesso/erro do login inalterado (mantém o padrão `Response.json` do arquivo).
- **Testes:** nenhum teste mocka o ratelimit (verificado por grep) — 75/75 passou sem ajuste de testes.
- **tsc:** exit 0.

## I5 — getClientIp sem spoofing via primeiro XFF

- **Arquivo:** `src/lib/ip.ts`
- **Mudança:** nova ordem de precedência: `x-real-ip` → `x-vercel-forwarded-for` → **último** valor de `x-forwarded-for` (o mais recente da cadeia, anexado pelo último proxy confiável) → `"anonymous"`. O primeiro valor de XFF (forjável pelo cliente) não é mais usado. WHY documentado em comentário.
  - Nota: `req.ip` não está disponível nesta versão do Next (o adapter `next-request.js` não repassa `ip` ao `NextRequest` e o tipo não o declara) — verificado no runtime instalado; removido da cadeia.
- **tsc:** exit 0. **Testes:** 75/75.

---

## Escopo

| Achado | Arquivos alterados |
|---|---|
| C2 | `src/lib/auth-jwt.ts` |
| I1 | `arts/[id]/preview/route.ts`, `arts/[id]/download/route.ts` |
| I2 | `arts/route.ts`, `arts/[id]/route.ts` |
| I3 | `arts/upload/route.ts`, `arts/[id]/download/route.ts`, `arts/[id]/preview/route.ts` |
| I4 | `src/lib/ratelimit.ts`, `auth/login/route.ts` |
| I5 | `src/lib/ip.ts` |

Fora de escopo (não tocados): rotas `/api/admin/leads` e demais rotas preexistentes (C1 — tarefa separada), `src/middleware.ts`, `src/lib/auth.ts`, flags de cookie.
