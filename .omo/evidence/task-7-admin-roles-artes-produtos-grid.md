# Task 7 — APIs de Usuários (GET/POST /api/admin/users, PATCH /api/admin/users/[id])

**Data:** 2026-08-06
**Plano:** `.omo/plans/admin-roles-artes-produtos-grid.md` (todo 7)
**Commit:** `feat(admin): add users management API (T1 only)`

## O que foi feito

### `src/app/api/admin/users/route.ts` (novo)
- `export const dynamic = "force-dynamic";`
- **GET**: `requireApiAdmin()` → `if (auth instanceof NextResponse) return auth;` → `canAccessRoute(auth.role, req.nextUrl.pathname, "GET")` (T1-only; T2 → 403). Lista `prisma.adminUser.findMany` com `select` de `{ id, email, name, role, isActive, createdAt }` (sem `passwordHash`), `orderBy: { createdAt: "desc" }`.
- **POST**: mesmo gate T1-only + `validateCsrf(req)` + `adminRatelimit.limit("admin:" + ip)` + `UserCreateSchema.safeParse` (Zod v4, de `@/lib/validations/auth.ts` — todo 10) + `bcrypt.hash(password, 12)` (bcryptjs) + `prisma.adminUser.create` com o mesmo `select` (sem hash na resposta). `Prisma.PrismaClientKnownRequestError` P2002 → `409 { message: "E-mail já cadastrado" }`.

### `src/app/api/admin/users/[id]/route.ts` (novo, PATCH)
- Assinatura Next.js 16: `export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> })` com `const { id } = await ctx.params;` (params é Promise — ver AGENTS.md).
- Gate T1-only (`requireApiAdmin` + `canAccessRoute` PATCH).
- Body parcial via `UserUpdateSchema` (`name? / role? / isActive? / password?`).
- Guard de auto-desativação: `if (id === auth.id && data.isActive === false)` → `403 "Você não pode desativar a si mesmo"` (desativar role próprio é permitido — decisão do plano).
- `password` → `bcrypt.hash(password, 12)` antes do `prisma.adminUser.update`.
- **Sem DELETE** (desativação é via `PATCH isActive: false`).

## Verificação

### `npx tsc --noEmit` → exit 0 (2 rodadas, a segunda após regeneração do cache)

```
EXIT_CODE=0
```

Nota de transparência: na primeira rodada, o tsc acusou 22 erros — todos em `.next/types/validator.ts` (cache de tipos gerado pelo Next apontando para paths pré-git-mv do todo 4) e nenhum nos arquivos desta task. Após regeneração do cache `.next` (artefato de build, gitignored), `npx tsc --noEmit` passa limpo.

### Cobertura dos critérios de aceite do todo 7

| Critério | Status |
|---|---|
| `npx tsc --noEmit` passa | ✅ exit 0 |
| POST cria usuário com hash bcrypt (cost 12) | ✅ `bcrypt.hash(password, 12)` + `select` sem hash na resposta |
| GET lista sem `passwordHash` | ✅ select explícito |
| PATCH desativa (`isActive: false`) | ✅ via `UserUpdateSchema` |
| T2 recebe 403 | ✅ `canAccessRoute` (T2 → false em `/api/admin/users*`) |
| Auto-desativação recebe 403 | ✅ guard `id === auth.id && isActive === false` |
| E-mail duplicado → 409 | ✅ catch P2002 → `"E-mail já cadastrado"` |
| CSRF + rate limit no POST | ✅ `validateCsrf` + `adminRatelimit` |
| Assinatura Next 16 com params Promise | ✅ `await ctx.params` |
| Sem DELETE | ✅ |

## QA manual não executado

QA com servidor rodando (POST/PATCH reais com cookie de admin) fica para a onda de verificação final (todo 18 / F3), conforme estratégia do plano ("testes-after"). Os caminhos lógicos foram cobertos por type-check + revisão do diff.

## Arquivos

- `src/app/api/admin/users/route.ts` (novo)
- `src/app/api/admin/users/[id]/route.ts` (novo)
- `.omo/evidence/task-7-admin-roles-artes-produtos-grid.md` (este)
