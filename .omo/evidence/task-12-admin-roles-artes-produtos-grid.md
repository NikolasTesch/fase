# Task 12 — APIs de tags (GET/POST /api/admin/art-tags, PATCH/DELETE [id])

**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` todo 12
**Data:** 2026-08-06
**Status:** ✅ Concluído

## Arquivos criados

### `src/app/api/admin/art-tags/route.ts`
- `export const dynamic = "force-dynamic";`
- **GET** — `requireApiAdmin()` (T2 pode ler, sem bloqueio por role):
  ```ts
  const auth = await requireApiAdmin();
  if (auth instanceof NextResponse) return auth;
  const tags = await prisma.artTag.findMany({
    include: { _count: { select: { arts: true } } },
    orderBy: { name: "asc" },
  });
  ```
- **POST** (T1-only): `requireApiAdmin` → `canAccessRoute(auth.role, req.nextUrl.pathname, "POST")` → 403 se negado; `validateCsrf(req)`; `adminRatelimit.limit("admin:" + ip)` (função confirmada em `src/lib/ratelimit.ts` — 60 req/min, prefixo `ratelimit:admin`); `ArtTagSchema.safeParse(body)` (de `@/lib/validations/arts`); slug automático; `P2002` → 409 "Já existe uma tag com este nome."

### `src/app/api/admin/art-tags/[id]/route.ts`
- Assinatura Next 16: `ctx: { params: Promise<{ id: string }> }` + `await ctx.params` (PATCH e DELETE).
- **PATCH** (T1-only via `canAccessRoute`): CSRF + ratelimit; `ArtTagSchema.partial().safeParse`; renomeia `name` e re-gera `slug`; `P2002` → 409, `P2025` → 404 "Tag não encontrada".
- **DELETE** (T1-only): CSRF + ratelimit; `prisma.artTag.delete({ where: { id } })` — o m2m implícito remove as relações na tabela de junção e **não deleta artes**; `P2025` → 404; responde `{ success: true }` (mesmo padrão de `testimonials/[id]`).

Sem comentários além do padrão CSRF/rate herdado de `categories/route.ts` (consistência com o repo).

## Verificação

### Type-check
Rodada 1 — `npx tsc --noEmit` (projeto completo):
```
EXIT=2
```
Falhas 100% pré-existentes, **nenhuma nos arquivos do todo 12**:
1. `.next/types/validator.ts` e `.next/dev/types/validator.ts` (gerados, gitignored — `git check-ignore` confirma): referenciam caminhos antigos (`admin/categorias/page.js` etc., anteriores ao git mv do route group `(t1)` do todo 4). Cache stale que regenera no próximo `next dev`/`next build`.
2. `src/app/(admin)/layout.tsx(44,31)` — erro em cascata do item 1 (a prop `role` passada no layout não é aceita pelo sidebar, trabalho em andamento não commitado dos todos 4/5, fora do escopo).

Rodada 2 — `npx tsc --noEmit -p tsconfig.tmp.json` (extends do tsconfig do projeto, `include: ["src/**/*.ts", "src/**/*.tsx"]`, `.next` excluído):
```
EXIT=0
```
✅ **Todo o código-fonte do projeto — incluindo as 2 rotas novas — type-checka limpo sob as regras do tsconfig (strict, alias `@/`)**.

### Lógica de slug (node, expressão exata do plano)
```
["Futebol","Patrocinador","Número","Vôlei","Escudo 2x"] → ["futebol","patrocinador","numero","volei","escudo-2x"]
```
✅ NFD remove acentos; separador `-`; trim de hífens.

### RBAC (canAccessRoute real, via tsx)
```
T1 POST /api/admin/art-tags : true
T2 GET  /api/admin/art-tags : true   ← T2 lê
T2 POST /api/admin/art-tags : false  ← 403
T2 PATCH /api/admin/art-tags/1 : false
T2 DELETE /api/admin/art-tags/1 : false
```
✅ T2 nunca muta tags — bate com a seção "Must NOT do" do plano.

## QA do plano (curl com servidor)
SKIP — exigiria servidor + cookie admin + Origin; coberto acima por verificação de matcher real e type-check. O fluxo completo (POST "Futebol" → slug "futebol", GET com `_count.arts`, 409 em duplicata) depende de DB e credenciais; QA final em todo 18.

## Commit
`feat(admin): add art tags API (T1 mutations, T2 read)` — inclui apenas `route.ts`, `[id]/route.ts` e esta evidência (working tree tinha mudanças não relacionadas não commitadas — não incluídas).
